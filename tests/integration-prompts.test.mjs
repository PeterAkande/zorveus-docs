import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const prompts = JSON.parse(fs.readFileSync('lib/integration-prompts.json', 'utf8'));

test('Business prompt retains detailed billing, attribution, and webhook instructions', () => {
  for (const section of ['ZORVEUS_FREE_KEY', 'allowance_starts_at', 'grant_credit_by_external_id', 'product_user.cap_reached', 'provider_credential.quota_exhausted', 'X-Zorveus-External-User-ID']) {
    assert.ok(prompts.business.includes(section), section);
  }
  assert.match(prompts.business, /dashboard only/);
  assert.match(prompts.business, /Status changes and credit revocation are dashboard-only/);
});

test('OAuth prompt separates user authorization from Business credit management', () => {
  assert.match(prompts.oauth, /Authorization Code with PKCE/);
  assert.match(prompts.oauth, /\/oauth\/token/);
  assert.match(prompts.oauth, /\/oauth\/revoke/);
  assert.match(prompts.oauth, /Do not invent a refresh-token flow/);
  assert.match(prompts.oauth, /does not require a Business service key/);
  assert.doesNotMatch(prompts.oauth, /grant_credit_by_external_id/);
});

test('prompt downloads return the selected text and reject unknown routes', async () => {
  const source = fs.readFileSync('app/api/integration-prompt/route.ts', 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: () => prompts, URL, Response });
  for (const route of ['business', 'oauth']) {
    const response = exports.GET({ url: `https://docs.zorveus.com/api/integration-prompt?route=${route}` });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), prompts[route]);
    assert.match(response.headers.get('Content-Disposition'), new RegExp(`zorveus-${route}`));
  }
  assert.equal(exports.GET({ url: 'https://docs.zorveus.com/api/integration-prompt?route=unknown' }).status, 400);
});
