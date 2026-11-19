import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

import { replaceKeysInNode } from "../lib/key-replace.mjs";

// Compile the component without starting a browser or a preview server.
function loadModule(filename, contextOverrides = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = createRequire(filename);
  const exports = {};
  const require = (id) => {
    if (id === "../context/KeyContext") {
      return {
        useKeyContext: () => ({
          apiKey: "zrv_your_api_key",
          serviceKey: "zrv_svc_your_service_key",
          clientId: "zrv_client_your_client_id",
          setApiKey() {},
          setServiceKey() {},
          setClientId() {},
          ...contextOverrides,
        }),
      };
    }
    if (id.startsWith("./")) {
      const sibling = path.resolve(
        path.dirname(filename),
        `${id.slice(2)}.tsx`,
      );
      if (fs.existsSync(sibling)) return loadModule(sibling, contextOverrides);
    }
    return localRequire(id);
  };
  vm.runInNewContext(compiled, { exports, require }, { filename });
  return exports;
}

function loadComponent(name, contextOverrides = {}) {
  const filename = path.resolve(`components/mdx/${name}.tsx`);
  return loadModule(filename, contextOverrides)[name];
}

test("key controls have a label, masked input, and named buttons", () => {
  const KeyInserter = loadComponent("KeyInserter");
  const html = renderToStaticMarkup(
    React.createElement(KeyInserter, { type: "service" }),
  );
  assert.match(html, /zorveus-key-toolbar not-prose/);
  assert.match(html, /<label for="[^"]+">Service key<\/label>/);
  assert.match(html, /type="password"/);
  assert.match(html, /aria-label="Show key"/);
  assert.match(html, /aria-label="Copy key"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-describedby=/);
});

test("callouts isolate component typography and preserve rich content", () => {
  const Callout = loadComponent("Callout");
  const html = renderToStaticMarkup(
    React.createElement(
      Callout,
      { type: "warning", title: "Check allowance" },
      React.createElement("p", null, "Read the available amount."),
    ),
  );
  assert.match(
    html,
    /<aside[^>]+not-prose[^>]+data-type="warning"[^>]+role="note"/,
  );
  assert.match(html, /zorveus-callout-title/);
  assert.match(html, /zorveus-rich-content/);
  assert.match(html, /Read the available amount\./);
});

test("navigation cards use one heading row and keep their destination", () => {
  const Card = loadComponent("Card");
  const html = renderToStaticMarkup(
    React.createElement(
      Card,
      {
        title: "Get started",
        icon: "rocket",
        href: "/getting-started/overview",
      },
      "Configure your app.",
    ),
  );
  assert.match(html, /href="\/getting-started\/overview"/);
  assert.match(html, /zorveus-card-container not-prose/);
  assert.match(html, /zorveus-card-heading/);
  assert.match(html, /<h3>Get started<\/h3>/);
  assert.doesNotMatch(html, /select-none|justify-between/);

  const withCta = renderToStaticMarkup(
    React.createElement(
      Card,
      {
        title: "SaaS integration",
        href: "/getting-started/integrate-your-product",
        cta: "View quickstart",
      },
      "Fund AI usage.",
    ),
  );
  assert.match(withCta, /zorveus-card-cta/);
  assert.match(withCta, /View quickstart/);

  const compactLink = renderToStaticMarkup(
    React.createElement(Card, {
      title: "Customer allowances",
      href: "/startups/configure-product-user-allowances",
    }),
  );
  assert.doesNotMatch(compactLink, /zorveus-rich-content/);
});

test("page feedback has explicit divider spacing and a wrapping layout", () => {
  const PageFeedback = loadComponent("PageFeedback");
  const html = renderToStaticMarkup(React.createElement(PageFeedback));
  assert.match(html, /zorveus-page-feedback not-prose/);
  assert.match(html, /Was this page helpful\?/);
  const css = fs.readFileSync("app/globals.css", "utf8");
  const rule = css.match(/\.zorveus-page-feedback\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /padding-top:\s*24px/);
  assert.match(rule, /border-top:\s*1px/);
  assert.match(rule, /flex-wrap:\s*wrap/);
});

test("architecture diagram labels the setup, inference, and service-key paths", () => {
  const ArchitectureDiagram = loadComponent("ArchitectureDiagram");
  const html = renderToStaticMarkup(React.createElement(ArchitectureDiagram));
  assert.match(html, /<figure[^>]+aria-label="Zorveus architecture"/);
  assert.match(html, /src="\/diagrams\/architecture-light\.jpg"/);
  assert.match(html, /src="\/diagrams\/architecture-dark\.jpg"/);
  assert.match(html, /Zorveus dashboard/);
  assert.match(html, /Your application backend/);
  assert.match(html, /Model provider/);
  assert.match(html, /service key for supported product-user/);
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.ok(fs.existsSync("public/diagrams/architecture-light.jpg"));
  assert.ok(fs.existsSync("public/diagrams/architecture-dark.jpg"));
  const css = fs.readFileSync("app/globals.css", "utf8");
  assert.match(
    css,
    /\.zorveus-architecture-flow \{ grid-template-columns: 1fr; \}/,
  );
});

test("flow diagram renders theme-matched stripe credit and resource hierarchy images", () => {
  const FlowDiagram = loadComponent("FlowDiagram");
  const stripeHtml = renderToStaticMarkup(
    React.createElement(FlowDiagram, { flow: "stripe-credits" }),
  );
  assert.match(stripeHtml, /src="\/diagrams\/stripe-credits-light\.jpg"/);
  assert.match(stripeHtml, /src="\/diagrams\/stripe-credits-dark\.jpg"/);
  assert.match(
    stripeHtml,
    /POST \/product-users\/by-external-id\/credit-grants/,
  );
  assert.ok(fs.existsSync("public/diagrams/stripe-credits-light.jpg"));
  assert.ok(fs.existsSync("public/diagrams/stripe-credits-dark.jpg"));

  const hierarchyHtml = renderToStaticMarkup(
    React.createElement(FlowDiagram, { flow: "resource-hierarchy" }),
  );
  assert.match(
    hierarchyHtml,
    /src="\/diagrams\/resource-hierarchy-light\.jpg"/,
  );
  assert.match(hierarchyHtml, /src="\/diagrams\/resource-hierarchy-dark\.jpg"/);
  assert.match(hierarchyHtml, /App Connection/);
  assert.ok(fs.existsSync("public/diagrams/resource-hierarchy-light.jpg"));
  assert.ok(fs.existsSync("public/diagrams/resource-hierarchy-dark.jpg"));
});

test("endpoint methods have distinct pill styles and retain authentication labels", () => {
  const ApiEndpoint = loadComponent("ApiEndpoint");
  const css = fs.readFileSync("app/globals.css", "utf8");
  for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
    const html = renderToStaticMarkup(
      React.createElement(ApiEndpoint, {
        method: method.toLowerCase(),
        path: "/models",
        auth: "api_key",
      }),
    );
    assert.ok(html.includes(`data-method="${method}"`));
    assert.match(html, /API Key \(Bearer zrv_\.\.\.\)/);
    assert.match(html, /\/models/);
    assert.ok(
      css.includes(`.zorveus-endpoint-method[data-method="${method}"]`),
    );
  }
  assert.match(css, /\.zorveus-endpoint-method \{[^}]*border-radius: 999px/);
});

test("integration picker offers two routes and hides the preview initially", () => {
  const Picker = loadComponent("IntegrationPromptPicker");
  const html = renderToStaticMarkup(React.createElement(Picker));
  assert.match(html, /value="business"/);
  assert.match(html, /value="oauth"/);
  assert.match(html, /Copy Business prompt/);
  assert.match(html, /Download Markdown/);
  assert.match(html, /<details><summary>Preview the full prompt/);
  assert.doesNotMatch(html, /<details open/);
});

test("code group renders tab triggers and replaces key placeholders in child code", () => {
  const CodeGroup = loadComponent("CodeGroup", {
    apiKey: "zrv_live_custom_123",
  });
  const child1 = React.createElement(
    "pre",
    null,
    React.createElement(
      "code",
      null,
      'curl -H "Authorization: Bearer zrv_your_api_key"',
    ),
  );
  const child2 = React.createElement(
    "pre",
    null,
    React.createElement(
      "code",
      null,
      'client = Zorveus(api_key="zrv_your_api_key")',
    ),
  );
  const html = renderToStaticMarkup(
    React.createElement(
      CodeGroup,
      { titles: ["cURL", "Python"] },
      child1,
      child2,
    ),
  );
  assert.match(html, /zorveus-tabs not-prose/);
  assert.match(html, /zorveus-tabs-list/);
  assert.match(
    html,
    /<button[^>]+class="zorveus-tabs-trigger"[^>]*>cURL<\/button>/,
  );
  assert.match(
    html,
    /<button[^>]+class="zorveus-tabs-trigger"[^>]*>Python<\/button>/,
  );
  assert.match(html, /zorveus-tabs-content/);
  assert.match(html, /Bearer zrv_live_custom_123/);
  assert.doesNotMatch(html, /zrv_your_api_key/);
});

test("key replacement handles split Shiki spans and standalone MDX pre wiring", () => {
  const splitLine = React.createElement(
    "span",
    { className: "line" },
    React.createElement("span", null, "Bearer zrv_your_"),
    React.createElement("span", null, "api_key"),
  );
  const replaced = replaceKeysInNode(splitLine, {
    zrv_your_api_key: "zrv_live_custom_123",
  });
  const html = renderToStaticMarkup(replaced);
  assert.match(html, /Bearer zrv_live_custom_123/);
  assert.doesNotMatch(html, /zrv_your_/);

  const mdxComponents = fs.readFileSync("mdx-components.tsx", "utf8");
  assert.match(mdxComponents, /pre:\s*CodePre/);
});

test("integration decision guide uses accessible radio groups and live recommendation", () => {
  const IntegrationDecisionGuide = loadComponent("IntegrationDecisionGuide");
  const html = renderToStaticMarkup(
    React.createElement(IntegrationDecisionGuide),
  );
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /zorveus-decision-svg/);
  assert.match(html, /Routes models, bills org/);
  assert.match(html, /Business organization/);
  assert.match(html, /href="\/getting-started\/startup-quickstart"/);
  assert.doesNotMatch(
    html,
    /Where do provider keys live\?|Bring your own key|byok-quickstart/,
  );
});

test("copy page button includes screen-reader live region and layout provides skip link", () => {
  const CopyPageButton = loadComponent("CopyPageButton");
  const html = renderToStaticMarkup(React.createElement(CopyPageButton));
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Copy for LLM/);

  const layout = fs.readFileSync("app/(docs)/layout.tsx", "utf8");
  assert.match(layout, /href="#nd-page"/);
  assert.match(layout, /Skip to main content/);

  const css = fs.readFileSync("app/globals.css", "utf8");
  assert.match(css, /\.sr-only\s*\{[^}]*overflow:\s*hidden/);
});
