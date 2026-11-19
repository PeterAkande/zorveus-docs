import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { buildGroupedNavigationTree } from '../lib/navigation-tree.mjs';

test('content section metadata avoids nested root overrides', () => {
  const directory = path.resolve('content/docs');
  const sections = fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  for (const section of sections) {
    const file = path.join(directory, section.name, 'meta.json');
    const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.notEqual(metadata.root, true, `${section.name} must not set root directly; grouping is controlled centrally`);
    assert.ok(metadata.title);
    assert.ok(metadata.pages.length > 0);
  }
});

test('layout uses notebook navbar tabs across Documentation, Code Labs, CLI, and API Reference', () => {
  const layout = fs.readFileSync('app/(docs)/layout.tsx', 'utf8');
  const clientLayout = fs.readFileSync('components/layout/ZorveusDocsLayout.tsx', 'utf8');
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.match(layout, /buildGroupedNavigationTree\(source\.pageTree\)/);
  assert.match(clientLayout, /from ['"]fumadocs-ui\/layouts\/notebook['"]/);
  assert.match(clientLayout, /tabMode="navbar"/);
  assert.match(clientLayout, /mode:\s*['"]top['"]/);
  assert.match(css, /#nd-subnav \[data-header-body\]\s*\{\s*height:\s*64px/);
  assert.match(css, /#nd-subnav \[data-header-tabs\]\s*\{\s*height:\s*68px/);
  assert.match(css, /--fd-header-height:\s*132px/);
});

test('grouped navigation tree builds four root tabs and preserves all section pages', () => {
  const sampleTree = {
    $id: 'docs-root',
    name: 'Documentation',
    children: [
      { type: 'page', name: 'Get started', url: '/' },
      { type: 'separator', name: 'Tutorials' },
      {
        type: 'folder',
        name: 'Quickstarts',
        $ref: { folder: 'getting-started' },
        children: [{ type: 'page', name: 'Overview', url: '/getting-started/overview' }],
      },
      {
        type: 'folder',
        name: 'Code Labs',
        $ref: { folder: 'code-labs' },
        children: [
          { type: 'page', name: 'Overview', url: '/code-labs/overview' },
          { type: 'page', name: 'Write Room SaaS starter', url: '/code-labs/write-room-saas' },
        ],
      },
      {
        type: 'folder',
        name: 'CLI & MCP',
        $ref: { folder: 'cli' },
        children: [{ type: 'page', name: 'CLI and MCP', url: '/cli/overview' }],
      },
      {
        type: 'folder',
        name: 'REST API',
        $ref: { folder: 'api-reference' },
        children: [{ type: 'page', name: 'Overview', url: '/api-reference/overview' }],
      },
    ],
  };

  const grouped = buildGroupedNavigationTree(sampleTree);
  assert.deepEqual(
    grouped.children.map((tab) => ({ name: tab.name, root: tab.root })),
    [
      { name: 'Documentation', root: true },
      { name: 'Code Labs', root: true },
      { name: 'CLI', root: true },
      { name: 'API Reference', root: true },
    ],
  );
  assert.equal(grouped.children[0].children.length, 3);
  assert.equal(grouped.children[1].children[1].url, '/code-labs/write-room-saas');
});
