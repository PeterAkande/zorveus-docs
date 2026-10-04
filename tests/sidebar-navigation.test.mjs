import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('all documentation sections remain in one navigation tree', () => {
  const directory = path.resolve('content/docs');
  const sections = fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  for (const section of sections) {
    const file = path.join(directory, section.name, 'meta.json');
    const metadata = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.notEqual(metadata.root, true, `${section.name} must not replace the sidebar tree`);
    assert.ok(metadata.title);
    assert.ok(metadata.pages.length > 0);
  }
});

test('layout disables section switching and retains the shared tree', () => {
  const layout = fs.readFileSync('app/(docs)/layout.tsx', 'utf8');
  assert.match(layout, /tree=\{source\.pageTree\}/);
  assert.match(layout, /tabs=\{false\}/);
});
