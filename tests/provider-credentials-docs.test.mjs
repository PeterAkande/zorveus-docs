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


test('documented service-key actions focus on customers and allowance', () => {
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



test('API reference drafts stay within the documented integration scope', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'zorveus-reference-'));
  try {
    const publicPaths = {
      '/models': { get: { summary: 'List models' } },
      '/inference-keys/usage': { get: {} },
      '/oauth/authorize': { get: {} },
      '/oauth/token': { post: {} },
      '/oauth/revoke': { post: {} },
      '/product-users/by-external-id': { get: {}, put: {} },
      '/product-users/by-external-id/credit-summary': { get: {} },
      '/product-users/by-external-id/allowance-debt': { get: {} },
      '/product-users/by-external-id/credit-grants': { get: {}, post: {} },
    };
    const privatePaths = [
      '/auth/login', '/auth/csrf', '/me', '/orgs', '/apps', '/wallet', '/caps',
      '/dashboard-api/usage', '/notification-settings', '/provider-credentials',
      '/app-connections/org-programmatic', '/product-users/{product_end_user_id}',
      '/oauth/authorization-requests/{id}/decision',
      '/orgs/{org_id}/apps/{app_id}/routing-keys',
      '/product-users/by-external-id/future-dashboard-route',
    ];
    const schemaPath = path.join(directory, 'openapi.json');
    fs.writeFileSync(schemaPath, JSON.stringify({ paths: {
      ...Object.fromEntries(privatePaths.map((route) => [route, { get: {}, post: {} }])),
      ...publicPaths,
    } }));
    const outputDirectory = path.join(directory, 'drafts');
    execFileSync(process.execPath, [path.resolve('scripts/generate-api-reference.mjs'), schemaPath, outputDirectory]);
    const output = fs.readdirSync(outputDirectory)
      .map((name) => fs.readFileSync(path.join(outputDirectory, name), 'utf8')).join('\n');
    for (const [route, methods] of Object.entries(publicPaths)) {
      for (const method of Object.keys(methods)) {
        assert.ok(output.includes(`method="${method.toUpperCase()}" path="${route}"`), `${method} ${route}`);
      }
    }
    for (const route of privatePaths) assert.ok(!output.includes(`path="${route}"`), route);
    assert.match(output, /path="\/models" auth="none"/);
    assert.match(output, /path="\/product-users\/by-external-id" auth="service_key"/);
    assert.match(output, /path="\/inference-keys\/usage" auth="api_key"/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
