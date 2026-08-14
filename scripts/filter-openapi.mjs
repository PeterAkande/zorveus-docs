import fs from 'fs';
import path from 'path';

const openApiPath = path.resolve('public_documentation/openapi.json');
const outputDir = path.resolve('content/docs/api-reference');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const raw = fs.readFileSync(openApiPath, 'utf-8');
const openapi = JSON.parse(raw);

// Filter paths
const excludedPrefixes = ['/admin', '/internal', '/payments/webhooks'];
const filteredPaths = {};

for (const [routePath, methods] of Object.entries(openapi.paths || {})) {
  const isExcluded = excludedPrefixes.some((prefix) => routePath.startsWith(prefix));
  if (!isExcluded) {
    filteredPaths[routePath] = methods;
  }
}

console.log(`Original paths: ${Object.keys(openapi.paths).length}, Filtered public paths: ${Object.keys(filteredPaths).length}`);

// Group public endpoints into logical product categories
const categories = {
  'authentication': { title: 'Auth & Current User', routes: [] },
  'organizations': { title: 'Organizations & Members', routes: [] },
  'apps': { title: 'Apps & Connections', routes: [] },
  'oauth': { title: 'OAuth Operations', routes: [] },
  'product-users': { title: 'Product Users & Credits', routes: [] },
  'provider-credentials': { title: 'Provider Credentials', routes: [] },
  'wallet': { title: 'Wallets & Top-Ups', routes: [] },
  'caps': { title: 'Spending Caps', routes: [] },
  'usage': { title: 'Usage & Analytics', routes: [] },
  'models': { title: 'Model Catalog', routes: [] },
  'notifications': { title: 'Notification Settings', routes: [] },
};

function categorizeRoute(route) {
  if (route.startsWith('/auth') || route.startsWith('/me')) return 'authentication';
  if (route.startsWith('/orgs') || route.startsWith('/onboarding')) return 'organizations';
  if (route.startsWith('/apps') || route.startsWith('/app-connections')) return 'apps';
  if (route.startsWith('/oauth')) return 'oauth';
  if (route.startsWith('/product-users')) return 'product-users';
  if (route.startsWith('/provider-credentials')) return 'provider-credentials';
  if (route.startsWith('/wallet')) return 'wallet';
  if (route.startsWith('/caps')) return 'caps';
  if (route.startsWith('/dashboard-api/usage') || route.startsWith('/usage')) return 'usage';
  if (route.startsWith('/models')) return 'models';
  if (route.startsWith('/notification-settings')) return 'notifications';
  return 'organizations';
}

for (const [routePath, methods] of Object.entries(filteredPaths)) {
  const categoryKey = categorizeRoute(routePath);
  for (const [method, op] of Object.entries(methods)) {
    if (typeof op === 'object' && op !== null) {
      categories[categoryKey].routes.push({
        path: routePath,
        method: method.toUpperCase(),
        summary: op.summary || `${method.toUpperCase()} ${routePath}`,
        description: op.description || '',
        operationId: op.operationId || '',
        parameters: op.parameters || [],
        requestBody: op.requestBody || null,
        responses: op.responses || {},
      });
    }
  }
}

// Write meta.json for api-reference
const apiPages = ['overview'];

for (const [catKey, catData] of Object.entries(categories)) {
  if (catData.routes.length > 0) {
    apiPages.push(catKey);
  }
}

fs.writeFileSync(
  path.join(outputDir, 'meta.json'),
  JSON.stringify({ title: 'API Reference', pages: apiPages }, null, 2)
);

// Write api-reference overview page
const overviewContent = `---
title: API Reference Overview
description: Complete REST API Reference for the Zorveus Management and Product API on api.zorveus.com.
---

# API Reference Overview

The Zorveus Product and Management API provides programmatic access to manage organizations, apps, inference keys, product users, and provider credentials.

## Production Server

\`\`\`text
https://api.zorveus.com
\`\`\`

## Authentication Types

- **Service Key**: Use \`Authorization: Bearer zrv_service_...\` for server-to-server operations.
- **Dashboard Session**: Use browser session cookie and \`X-CSRF-Token\` for dashboard operations.
- **Inference Key**: Use \`Authorization: Bearer zrv_...\` for inference endpoints on \`https://api.zorveus.com/v1\`.

## API Groups

<CardGroup cols={2}>
  <Card title="Product Users & Credits" icon="layers" href="/api-reference/product-users">
    Manage customer identities and issue credit grants.
  </Card>
  <Card title="Provider Credentials" icon="key" href="/api-reference/provider-credentials">
    Store and configure BYOK provider keys.
  </Card>
  <Card title="Apps & Connections" icon="terminal" href="/api-reference/apps">
    Manage applications and programmatic inference connections.
  </Card>
  <Card title="Wallets & Top-Ups" icon="shield" href="/api-reference/wallet">
    Inspect ledger transactions, wallet balances, and top-up checkouts.
  </Card>
</CardGroup>
`;

fs.writeFileSync(path.join(outputDir, 'overview.mdx'), overviewContent);

// Determine auth type helper
function getAuthType(route, method) {
  if (route.startsWith('/product-users') || route.startsWith('/provider-credentials')) {
    return 'service_key';
  }
  if (route.startsWith('/oauth')) {
    return 'oauth_bearer';
  }
  return 'dashboard_session';
}

// Generate MDX page for each category
for (const [catKey, catData] of Object.entries(categories)) {
  if (catData.routes.length === 0) continue;

  let content = `---
title: ${catData.title} API
description: Reference and interactive runner for ${catData.title.toLowerCase()} operations.
---

# ${catData.title}

<KeyInserter type="service" label="Service Key Tester" placeholder="zrv_service_your_service_key" />

`;

  for (const op of catData.routes) {
    const authType = getAuthType(op.path, op.method);
    content += `## ${op.summary}\n\n`;
    content += `<ApiEndpoint method="${op.method}" path="${op.path}" auth="${authType}" />\n\n`;

    if (op.description) {
      content += `${op.description}\n\n`;
    }

    if (op.parameters && op.parameters.length > 0) {
      content += `### Parameters\n\n`;
      for (const param of op.parameters) {
        const paramType = param.schema?.type || 'string';
        const requiredAttr = param.required ? ' required' : '';
        content += `<ParamField name="${param.name}" type="${paramType}"${requiredAttr}>\n`;
        content += `  ${param.description || `Parameter in ${param.in}`}\n`;
        content += `</ParamField>\n\n`;
      }
    }

    content += `<ApiRunner method="${op.method}" path="${op.path}" authType="${authType}" />\n\n`;
    content += `---\n\n`;
  }

  fs.writeFileSync(path.join(outputDir, `${catKey}.mdx`), content);
}

console.log('Successfully generated public API reference pages!');
