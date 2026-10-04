import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLlmsIndex, resolveDocumentPath } from '../lib/docs-export.mjs';

const pages = [
  { url: '/', title: 'Zorveus documentation' },
  { url: '/startups/check-allowance', title: 'Check allowance', description: 'Read available allowance.' },
];

test('resolve published pages and the homepage', () => {
  assert.equal(resolveDocumentPath('', pages, '/docs'), '/docs/index.mdx');
  assert.equal(resolveDocumentPath('startups/check-allowance', pages, '/docs'), '/docs/startups/check-allowance.mdx');
});

test('reject traversal, absolute paths, unknown pages, and encoded paths', () => {
  for (const slug of ['../package.json', '/etc/passwd', 'startups/../../package', '%2e%2e', 'startups/missing', 'startups\\check-allowance']) {
    assert.equal(resolveDocumentPath(slug, pages, '/docs'), null);
  }
});

test('index exposes every page with source and HTML links', () => {
  const index = buildLlmsIndex(pages);
  assert.match(index, /slug=startups%2Fcheck-allowance/);
  assert.match(index, /HTML: https:\/\/docs.zorveus.com\/startups\/check-allowance/);
  assert.match(index, /Read available allowance\./);
  assert.match(index, /## Business/);
  assert.match(index, /api\/raw-doc\?slug=\)/);
});
