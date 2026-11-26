import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('theme switching is enabled without a forced dark class', () => {
  const layout = fs.readFileSync('app/layout.tsx', 'utf8');
  assert.match(layout, /enabled: true/);
  assert.match(layout, /defaultTheme: 'system'/);
  assert.match(layout, /enableSystem: true/);
  assert.doesNotMatch(layout, /className=\{`dark /);
});

test('shared theme colors have light and dark definitions', () => {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  const light = css.match(/:root \{\s*color-scheme: light;([^}]+)\}/)?.[1];
  const dark = css.match(/\.dark \{\s*color-scheme: dark;([^}]+)\}/)?.[1];
  assert.ok(light);
  assert.ok(dark);
  for (const token of ['bg', 'surface', 'heading', 'text', 'muted', 'border', 'accent']) {
    assert.ok(light.includes(`--docs-${token}:`));
    assert.ok(dark.includes(`--docs-${token}:`));
  }
  assert.match(css, /body \{\s*background-color: var\(--docs-bg\)/);
});

test('code blocks use always-dark Dracula Shiki theme and dark container tokens', () => {
  const sourceConfig = fs.readFileSync('source.config.ts', 'utf8');
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.match(sourceConfig, /light:\s*['"]dracula['"]/);
  assert.match(sourceConfig, /dark:\s*['"]dracula['"]/);
  assert.match(css, /--docs-codeblock-bg:\s*#282a36;/);
  assert.match(css, /--docs-codeblock-fg:\s*#f8f8f2;/);
});

test('page header has reset title margins and balanced vertical spacing', () => {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.match(css, /\.zorveus-page-title\s*\{[^}]*margin:\s*0\s*!important/);
  assert.match(css, /\.zorveus-breadcrumb/);
  assert.match(css, /\.zorveus-page-description\s*\{[^}]*margin-top:\s*18px\s*!important/);
  assert.match(css, /\.zorveus-page-actions\s*\{[^}]*margin-top:\s*20px/);
});
