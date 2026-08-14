# Zorveus Public Documentation Handoff

## Purpose

This folder is the complete implementation brief for the public documentation
site at `https://docs.zorveus.com`.

It is written for an engineer or coding agent with no prior Zorveus context.
Following these guides should produce public documentation that agrees with the
backend, explains the product clearly, and does not expose internal operations.

The public documentation is a separate product surface. It is not a copy of
the backend repository's engineering notes, Bruno collection, or FastAPI Swagger
page.

## Read Order

1. [Product and Audience Model](/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/01_product_and_audience_model.md)
2. [Information Architecture and Page Specifications](/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/02_information_architecture_and_page_specs.md)
3. [Backend and OpenAPI Source Guide](/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/03_backend_and_openapi_source_guide.md)
4. [MDX Authoring, Design, and Quality Guide](/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/04_mdx_authoring_design_and_quality_guide.md)
5. [UI and Design Guide](/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/05_ui_and_design_guide.md)
6. [Agent Implementation Brief](/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/AGENT_IMPLEMENTATION_BRIEF.md)

## Documentation Repository Location

The dedicated public documentation codebase is located at:

```text
/Users/peterakande/DevProjects/Docs/zorveus-docs
```

## Path Convention

Every reference to an existing file or directory in the Zorveus backend
repository uses an absolute path rooted at:

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/
```

Paths beginning with `/getting-started`, `/concepts`, `/oauth`, or another
documentation slug are public website routes. Paths beginning with `content/`
describe the proposed MDX project's future file layout. API paths such as
`/oauth/token` are HTTP routes. Those logical paths must not be converted into
local filesystem paths.

## Product Domains

| Domain | Purpose |
| --- | --- |
| `https://zorveus.com` | Public marketing website |
| `https://www.zorveus.com` | Public website alias |
| `https://app.zorveus.com` | Signed-in dashboard and OAuth consent UI |
| `https://api.zorveus.com` | Product API and inference gateway |
| `https://api.zorveus.com/v1` | Recommended OpenAI-compatible SDK base URL |
| `https://docs.zorveus.com` | Public documentation described here |

Do not use local URLs in primary production examples. Localhost belongs only in
a clearly labelled local-development section.

## Primary Documentation Goal

The docs should let a startup complete this journey without contacting Zorveus:

1. Understand whether Zorveus fits its product.
2. Create a startup workspace and app.
3. Create an inference key.
4. Call an AI model through the normal OpenAI SDK.
5. Attribute requests to its own product users.
6. Add its own provider credentials or use Zorveus-funded routing.
7. Apply product-user credits and spending controls.
8. Inspect usage and cost.

The secondary journey is for an app developer whose users connect their own
Zorveus wallets through OAuth.

The tertiary journey is product help for wallet users managing connected apps,
caps, top-ups, promotions, sessions, and organization membership.

## Source-of-Truth Order

When sources disagree, use this order:

1. Current routers, schemas, services, and tests under
   `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/` and
   `/Users/peterakande/DevProjects/Backend/work/zorveus/tests/zorveus/`.
2. A freshly generated FastAPI OpenAPI 3.1 schema.
3. Gateway policy in
   `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/zorveus_gateway/routes.py`
   and verified deployed gateway behavior.
4. Working examples under
   `/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/`.
5. Bruno requests under
   `/Users/peterakande/DevProjects/Backend/work/zorveus/docs/bruno/Zorveus Local API/`.
6. Existing product and frontend guides under
   `/Users/peterakande/DevProjects/Backend/work/zorveus/docs/`.

Never resolve a conflict by copying the oldest prose. Existing plans and guides
contain design history and may describe planned or superseded behavior.

## Non-Negotiable Product Rules

- Zorveus is startup-first, but also supports wallet users and OAuth app
  developers.
- The preferred inference integration is the standard OpenAI client with a
  Zorveus base URL and inference key.
- An app, app connection, and inference key are different resources.
- Inference keys are secrets and are returned only when issued or rotated.
- Service keys are server-side management credentials, not inference keys.
- Provider credentials are Bring Your Own Key secrets encrypted by Zorveus.
- BYOK usage still records provider cost and tokens, but does not debit the
  Zorveus wallet as a Zorveus sale.
- Product users are the startup's customers, identified primarily by the
  startup's `external_user_id`.
- Product-user metadata can create or update a product user inline during an
  inference request.
- Product-user credit grants are independent from the startup's subscription
  plan model.
- OAuth app developers receive scoped inference credentials but must not see
  the identities, wallets, provider keys, or product users of connected payer
  organizations.
- OAuth uses Authorization Code with PKCE and exact redirect URI matching.
- Reauthorization reuses the logical connection, revokes previous OAuth
  inference tokens, and issues one replacement token.
- Money is represented as decimal strings. Dates are timezone-aware ISO 8601.
- Caps and wallet checks happen before provider spend.

## Public Versus Private Material

Public documentation may include:

- Product concepts and user workflows
- Startup integration guides
- OAuth integration guides
- Public dashboard and service-key APIs
- Inference API behavior
- Provider configuration guides
- Wallet, cap, product-user, credit, and usage semantics
- Errors, security guidance, rate limits, and idempotency

Do not publish:

- `/admin/*` endpoint reference
- `/internal/*` endpoint reference
- Database schemas, migration procedures, or raw SQL
- AWS identifiers, networking details, secret ARNs, or deployment credentials
- Internal reconciliation, reservation, retry, and worker procedures
- Internal API secrets
- LiteLLM enterprise package details or internal admin routes
- Implementation trackers, scratch plans, or unresolved design notes
- Real API keys, client secrets, access tokens, webhook secrets, or cookies

## Required Deliverables

The documentation implementation is complete only when it includes:

- MDX pages matching the specifications in this folder
- A responsive sidebar and mobile navigation
- Search
- Language tabs for `curl`, Python, JavaScript, and TypeScript where relevant
- Copyable code samples using synthetic credentials
- A generated, filtered API reference based on current OpenAPI
- Hand-authored inference API guides
- Public changelog and support links
- Redirects for renamed documentation paths
- Link, MDX, spelling, and code-sample validation in CI
- A documented update workflow for backend contract changes

## Recommended Execution Order

1. Initialize the MDX application and configure `docs.zorveus.com`.
2. Implement navigation, layout, search, reusable components, and metadata.
3. Create Overview, Core Concepts, and Startup Quickstart.
4. Create inference guides and validate examples against staging or production.
5. Create product-user, credit, provider-credential, and usage guides.
6. Create the complete OAuth track.
7. Generate and filter the product API reference.
8. Add wallet-user help pages.
9. Add provider guides, troubleshooting, changelog, and support.
10. Run the release checklist in the MDX quality guide.

## Definition of Done

A new startup engineer should be able to make a successful inference request,
add product-user attribution, and understand billing without reading backend
source code.

A new OAuth app developer should be able to register an app, implement PKCE,
exchange a code, call inference, handle reauthorization, and revoke access.

A docs maintainer should be able to regenerate the API reference and determine
why every public claim is correct from the source hierarchy above.
