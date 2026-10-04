import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

// Compile the component without starting a browser or a preview server.
function loadComponent(name) {
  const filename = path.resolve(`components/mdx/${name}.tsx`);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = createRequire(filename);
  const exports = {};
  const require = (id) => id === '../context/KeyContext' ? {
    useKeyContext: () => ({
      apiKey: 'zrv_your_api_key', serviceKey: 'zrv_svc_your_service_key', clientId: 'zrv_client_your_client_id',
      setApiKey() {}, setServiceKey() {}, setClientId() {},
    }),
  } : localRequire(id);
  vm.runInNewContext(compiled, { exports, require }, { filename });
  return exports[name];
}

test('key controls have a label, masked input, and named buttons', () => {
  const KeyInserter = loadComponent('KeyInserter');
  const html = renderToStaticMarkup(React.createElement(KeyInserter, { type: 'service' }));
  assert.match(html, /zorveus-key-toolbar not-prose/);
  assert.match(html, /<label for="[^"]+">Service key<\/label>/);
  assert.match(html, /type="password"/);
  assert.match(html, /aria-label="Show key"/);
  assert.match(html, /aria-label="Copy key"/);
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-describedby=/);
});

test('callouts isolate component typography and preserve rich content', () => {
  const Callout = loadComponent('Callout');
  const html = renderToStaticMarkup(React.createElement(Callout, { type: 'warning', title: 'Check allowance' }, React.createElement('p', null, 'Read the available amount.')));
  assert.match(html, /<aside[^>]+not-prose[^>]+data-type="warning"[^>]+role="note"/);
  assert.match(html, /zorveus-callout-title/);
  assert.match(html, /zorveus-rich-content/);
  assert.match(html, /Read the available amount\./);
});

test('navigation cards use one heading row and keep their destination', () => {
  const Card = loadComponent('Card');
  const html = renderToStaticMarkup(React.createElement(Card, { title: 'Get started', icon: 'rocket', href: '/getting-started/overview' }, 'Configure your app.'));
  assert.match(html, /href="\/getting-started\/overview"/);
  assert.match(html, /zorveus-card-container not-prose/);
  assert.match(html, /zorveus-card-heading/);
  assert.match(html, /<h3>Get started<\/h3>/);
  assert.doesNotMatch(html, /select-none|justify-between/);
});

test('page feedback has explicit divider spacing and a wrapping layout', () => {
  const PageFeedback = loadComponent('PageFeedback');
  const html = renderToStaticMarkup(React.createElement(PageFeedback));
  assert.match(html, /zorveus-page-feedback not-prose/);
  assert.match(html, /Was this page helpful\?/);
  const css = fs.readFileSync('app/globals.css', 'utf8');
  const rule = css.match(/\.zorveus-page-feedback\s*\{([^}]+)\}/)?.[1];
  assert.ok(rule);
  assert.match(rule, /padding-top:\s*24px/);
  assert.match(rule, /border-top:\s*1px/);
  assert.match(rule, /flex-wrap:\s*wrap/);
});

test('architecture diagram labels the setup, inference, and service-key paths', () => {
  const ArchitectureDiagram = loadComponent('ArchitectureDiagram');
  const html = renderToStaticMarkup(React.createElement(ArchitectureDiagram));
  assert.match(html, /<figure[^>]+aria-label="Zorveus architecture"/);
  assert.match(html, /Zorveus dashboard/);
  assert.match(html, /Your application backend/);
  assert.match(html, /Model provider/);
  assert.match(html, /service key for supported product-user/);
  assert.equal((html.match(/<li>/g) || []).length, 3);
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.match(css, /\.zorveus-architecture-flow \{ grid-template-columns: 1fr; \}/);
});

test('endpoint methods have distinct pill styles and retain authentication labels', () => {
  const ApiEndpoint = loadComponent('ApiEndpoint');
  const css = fs.readFileSync('app/globals.css', 'utf8');
  for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
    const html = renderToStaticMarkup(React.createElement(ApiEndpoint, { method: method.toLowerCase(), path: '/models', auth: 'api_key' }));
    assert.ok(html.includes(`data-method="${method}"`));
    assert.match(html, /API Key \(Bearer zrv_\.\.\.\)/);
    assert.match(html, /\/models/);
    assert.ok(css.includes(`.zorveus-endpoint-method[data-method="${method}"]`));
  }
  assert.match(css, /\.zorveus-endpoint-method \{[^}]*border-radius: 999px/);
});
