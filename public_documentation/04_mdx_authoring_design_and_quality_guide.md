# MDX Authoring, Design, and Quality Guide

## Implementation Constraint

Documentation content must be MDX. The chosen framework may differ, but it must
support static or server rendering, accessible components, search, syntax
highlighting, generated API reference, redirects, and `docs.zorveus.com`.

Adapt component names to the framework while preserving the behavior here.

## Required MDX Components

| Component | Purpose |
| --- | --- |
| `Callout` | Notes, warnings, danger, success, and beta information |
| `Steps` | Ordered workflows |
| `Tabs` and `Tab` | Language or authentication variants |
| `CodeGroup` | Parallel curl, Python, JavaScript, and TypeScript examples |
| `Card` and `CardGroup` | Intent navigation and related guides |
| `ApiEndpoint` | HTTP method and path |
| `ParamField` | Request parameter documentation |
| `ResponseField` | Response field documentation |
| `Accordion` | Optional errors and troubleshooting |
| `RequestExample` | Copyable request example |
| `ResponseExample` | Success and error response examples |
| `Badge` | Availability such as Beta or Deprecated |

Do not use components as decoration. Prefer normal prose or a table when it is
clearer.

## Frontmatter Contract

Every page should have equivalent metadata:

```mdx
---
title: Startup quickstart
description: Send your first AI request through Zorveus and verify its usage.
sidebarTitle: Startup quickstart
slug: /getting-started/startup-quickstart
---
```

Optional fields:

```mdx
availability: stable
keywords:
  - OpenAI compatible API
  - AI gateway
  - product user metering
```

Prefer Git-derived modification dates over manually maintained dates.

## Standard Guide Structure

1. Outcome-oriented title
2. One-paragraph explanation
3. Prerequisites
4. Concept or resource relationship
5. Step-by-step implementation
6. Complete code sample
7. Expected response or observable result
8. Security and production notes
9. Common errors
10. Next steps

Avoid beginning a task page with internal architecture.

## Standard API Guide Structure

```mdx
---
title: Create a product user
description: Create or update a startup product user using your external identifier.
---

<ApiEndpoint method="PUT" path="/product-users/by-external-id" />

Short explanation of when to use the operation.

## Authentication

Exact credential type and header behavior.

## Request

<ParamField name="org_id" type="string" required>
  Organization that owns the product user.
</ParamField>

<CodeGroup>
  ...
</CodeGroup>

## Response

<ResponseExample>...</ResponseExample>

## Errors

Document actionable public errors.
```

Generated reference pages may use framework-specific components. Hand-authored
guides should link to reference rather than duplicate every schema field.

## Code-Sample Rules

### Credentials

Use unmistakably synthetic placeholders:

```text
zrv_your_inference_key
zrv_service_your_service_key
zrv_client_your_client_id
zrv_client_secret_your_client_secret
```

Never paste values from `.env`, Bruno environments, screenshots, logs, tests,
or local demo settings.

### Base URLs

Production inference examples:

```text
https://api.zorveus.com/v1
```

Product API examples:

```text
https://api.zorveus.com
```

Use local ports only in explicitly local-development pages.

### Languages

Central integrations should include `curl`, Python using the official OpenAI
client, and JavaScript or TypeScript using the official OpenAI client. Include
both JavaScript and TypeScript only when types add useful information.

### Complete Examples

Samples must include imports, client construction, request, and result access.
Avoid unexplained ellipses in the main quickstart.

The canonical Python shape is:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.zorveus.com/v1",
    api_key="zrv_your_inference_key",
)

response = client.chat.completions.create(
    model="openai/gpt-4.1-mini",
    messages=[{"role": "user", "content": "Hello"}],
)

print(response.choices[0].message.content)
```

Verify model examples against the current catalog before publication. The model
above is illustrative, not a permanent availability promise.

### Product-User Metadata

Use field names confirmed by current reservation schemas and tests.
`external_user_id` is the preferred startup-facing identifier. Explain inline
creation and update behavior next to the example.

## Writing Style

- Write directly to the reader as `you`.
- Prefer concrete actions and outcomes.
- Define each Zorveus term before abbreviating it.
- Use short paragraphs and descriptive headings.
- Keep errors actionable.
- State defaults, null behavior, one-time secrets, and precedence.
- Separate current behavior from future plans.
- Avoid internal classes, tables, workers, migrations, and wrapper names.

## Visual Direction

The docs should feel like a quiet engineering tool:

- Restrained neutral palette with Zorveus brand accent
- Dense but readable navigation
- Comfortable maximum article width
- Sticky desktop table of contents
- Search from every page
- Responsive code blocks and tables
- Clear API method colors
- No decorative gradients or oversized marketing hero
- No nested cards
- Accessible focus, contrast, keyboard, and reduced-motion behavior

The home page may use cards for three audience entry points. Article sections
should remain unframed.

## Required Diagrams

1. Zorveus inference request lifecycle
2. App, app connection, and inference key relationship
3. Startup programmatic integration sequence
4. OAuth Authorization Code with PKCE sequence
5. Wallet reservation and settlement lifecycle
6. Product-user credit and cap decision model

Use text-based diagrams only if rendering is accessible and stable. Every
diagram needs equivalent surrounding prose.

## Search and Metadata

Index title, description, headings, body, endpoint paths, error codes, provider
identifiers, and model-family terms.

Every page needs a unique title/description, canonical docs URL, Open Graph
metadata, breadcrumbs, and useful alternate search terms. Add redirects when
published slugs change.

## API Reference Presentation

Each generated operation should show:

- Method and path
- Stability label
- Authentication type
- Path and query parameters
- Customer-relevant headers
- Request schema and example
- Response statuses and schemas
- Zorveus error examples
- Link to its workflow guide

Hide private component schemas left after filtering.

## Validation and CI

Run these checks for every pull request:

- MDX parsing and type checking
- Production build
- Internal link and anchor validation
- External link validation with controlled retries
- Spelling and terminology checks
- Duplicate title and slug detection
- OpenAPI validation
- Public OpenAPI diff against accepted baseline
- Secret scanning
- Code-sample linting
- Formatting

Where practical, execute quickstart samples against controlled staging. Never
run examples that can spend unbounded production funds.

## Browser QA

Inspect at least desktop 1440 x 900, tablet 768 x 1024, and mobile 390 x 844.

Verify sidebar/content layout, long paths and model names, code copy, tabs,
mobile tables, search, heading anchors, keyboard navigation, both themes, and
the absence of overlapping text or controls.

## Accuracy Review

For each page, answer:

1. Is every endpoint current?
2. Is authentication correct?
3. Are required, optional, and nullable fields accurate?
4. Are one-time secret semantics stated?
5. Are money and dates represented correctly?
6. Are lifecycle states complete?
7. Is the example model currently routable?
8. Does behavior have a test or verified runtime result?
9. Does the page expose private operations or secrets?
10. Is planned behavior labelled rather than presented as live?

## Release Checklist

- Production build passes
- Public OpenAPI is freshly generated and filtered
- Startup Quickstart succeeds from a clean account
- Product-user inline creation succeeds
- BYOK quickstart succeeds with a safe test credential
- OAuth succeeds from authorization through inference
- Wallet top-up guide matches the configured production provider
- Errors contain no traceback or sensitive data
- Code uses production domains or labelled localhost values
- Every navigation item resolves
- Search indexes new pages
- Changelog contains the docs launch
- `docs.zorveus.com` TLS, canonical domain, analytics, and monitoring work

## Maintenance Ownership

Public documentation is part of the backend contract. A public backend change
is incomplete until its reference, related guide, examples, and changelog are
updated.

Assign ownership for product terminology, product API generation, inference
verification, OAuth, providers, wallet/payments, and docs deployment/search.
