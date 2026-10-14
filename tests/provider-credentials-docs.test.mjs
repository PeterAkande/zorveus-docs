import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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


test('API reference generation omits routing management from a full backend schema', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'zorveus-routing-docs-'));
  try {
    const outputDirectory = path.join(directory, 'content/docs/api-reference');
    fs.mkdirSync(outputDirectory, { recursive: true });
    const routingPaths = [
      '/orgs/{org_id}/routing-keys',
      '/orgs/{org_id}/apps/{app_id}/routing-keys',
      '/orgs/{org_id}/apps/{app_id}/routing-keys/batch',
      '/orgs/{org_id}/apps/{app_id}/routing-keys/{api_key_id}',
      '/orgs/{org_id}/apps/{app_id}/routing-keys/{api_key_id}/members',
      '/orgs/{org_id}/apps/{app_id}/routing-keys/{api_key_id}/rotate',
      '/orgs/{org_id}/apps/{app_id}/routing-keys/{api_key_id}/revoke',
    ];
    const paths = Object.fromEntries(routingPaths.map((route) => [route, { get: {}, post: {}, put: {} }]));
    const schemaPath = path.join(directory, 'openapi.json');
    fs.writeFileSync(schemaPath, JSON.stringify({ paths: { ...paths, '/health': { get: {} } } }));
    execFileSync(process.execPath, [path.resolve('scripts/generate-api-reference.mjs'), schemaPath], { cwd: directory });
    const output = fs.readdirSync(outputDirectory)
      .map((name) => fs.readFileSync(path.join(outputDirectory, name), 'utf8')).join('\n');
    assert.match(output, /path="\/health"/);
    for (const route of routingPaths) assert.ok(!output.includes(route), route);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
