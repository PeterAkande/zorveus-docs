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
