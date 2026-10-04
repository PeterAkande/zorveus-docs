import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('provider setup guides use the dashboard, not credential API requests', () => {
  const pages = fs.readdirSync('content/docs/providers').filter((name) => name.endsWith('.mdx'))
    .map((name) => `content/docs/providers/${name}`);
  pages.push('content/docs/startups/provider-credentials.mdx', 'content/docs/api-reference/provider-credentials.mdx');
  for (const page of pages) {
    const content = fs.readFileSync(page, 'utf8');
    assert.match(content, /dashboard/, page);
    assert.match(content, /Provider Credentials/, page);
    assert.doesNotMatch(content, /(?:GET|POST|PATCH|DELETE) \/provider-credentials|api\.zorveus\.com\/provider-credentials/, page);
  }
});

test('API reference generation excludes dashboard credential routes', () => {
  const script = fs.readFileSync('scripts/generate-api-reference.mjs', 'utf8');
  assert.match(script, /const privatePrefixes = \[[^\]]*"\/provider-credentials"/);
  assert.doesNotMatch(script, /"provider-credentials":\s*\{/);
});

test('documented service-key endpoints use external product-user IDs only', () => {
  const files = fs.readdirSync('content/docs', { recursive: true }).filter((name) => name.endsWith('.mdx'));
  let count = 0;
  for (const file of files) {
    const content = fs.readFileSync(`content/docs/${file}`, 'utf8');
    for (const [tag] of content.matchAll(/<(?:ApiEndpoint|ApiRunner)\b[^>]*>/g)) {
      if (!/auth(?:Type)?="service_key"/.test(tag)) continue;
      const route = tag.match(/path="([^"]+)"/)?.[1];
      assert.ok(route?.startsWith('/product-users/by-external-id'), `${file}: ${tag}`);
      count += 1;
    }
    assert.doesNotMatch(content, /\/app-connections\/org-programmatic/, file);
  }
  assert.ok(count > 0);
});

test('API reference generation preserves the confirmed public integration boundary', () => {
  const script = fs.readFileSync('scripts/generate-api-reference.mjs', 'utf8');
  assert.match(script, /const privatePrefixes = \[[^\]]*"\/app-connections\/org-programmatic"/);
  assert.match(script, /if \(route\.startsWith\("\/product-users"\) && !route\.startsWith\("\/product-users\/by-external-id"\)\) continue;/);
});
