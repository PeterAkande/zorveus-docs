# Agent Implementation Brief

## Assignment

Build the public Zorveus MDX documentation site for `https://docs.zorveus.com` inside the dedicated documentation repository at:

```text
/Users/peterakande/DevProjects/Docs/zorveus-docs
```

Assume no product knowledge from previous conversations. Read every document in
`/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/`
in the order listed by
`/Users/peterakande/DevProjects/Web/work/zorveus_frontend/public_documentation/README.md`
before creating files.

## Required Approach

1. **Framework & Architecture**: Build the documentation site using **Fumadocs** on Next.js App Router while strictly adhering to a **Zero Lock-In MDX Authoring Contract** (using standard Mintlify-compatible component tags: `<Callout>`, `<Steps>`, `<Tabs>`, `<Tab>`, `<CodeGroup>`, `<CardGroup>`, `<Card>`, `<ParamField>`, `<ResponseField>`, `<Badge>`).
2. **Interactive UI & Ergonomics**: Implement all UI additions detailed in `05_ui_and_design_guide.md` (Quickstart Key Inserter, interactive API Try-It-Out runner, OAuth PKCE flow visualizers, persistent multi-SDK switcher, Cmd+K search modal, and `#4DFFB4` mint accent branding).
3. **First-Screen Experience**: Build the actual documentation experience as the first screen, not a marketing landing page.
4. **Information Architecture**: Use the content tree and page requirements in `02_information_architecture_and_page_specs.md`.
5. **OpenAPI API Reference**: Generate the product API reference from a freshly exported and filtered OpenAPI 3.1 schema (`docs/openapi.json`), excluding private `/admin/*`, `/internal/*`, and `/payments/webhooks/*` endpoints.
6. **Inference Guides**: Hand-author inference guides with complete, verified `curl`, Python (OpenAI SDK), and JavaScript/TypeScript (OpenAI SDK) code samples.
7. **Synthetic Credentials**: Use synthetic secrets (`zrv_your_inference_key`) and production Zorveus domains (`https://api.zorveus.com`, `https://api.zorveus.com/v1`).
8. **Quality Assurance**: Run content, build, link, schema, secret, and browser QA before completion.

## Backend Repository Inputs

Use these inputs from the Zorveus backend repository:

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/http_errors.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/session_auth.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/service_key_auth.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/zorveus_gateway/
/Users/peterakande/DevProjects/Backend/work/zorveus/tests/zorveus/
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/bruno/Zorveus Local API/
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/zorveus_product_overview.md
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/zorveus_startup_org_dashboard_guide.md
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/zorveus_developer_org_dashboard_guide.md
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/zorveus_frontend_oauth_consent_flow.md
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/zorveus_product_user_credits_and_cap_model.md
/Users/peterakande/DevProjects/Backend/work/zorveus/docs/zorveus_frontend_wallet_top_up_flow.md
```

The source-of-truth hierarchy in
`/Users/peterakande/DevProjects/Backend/work/zorveus/docs/public_documentation/README.md`
overrides this list when sources disagree.

## First Milestone

Implement and validate these pages first:

```text
/
/getting-started/overview
/getting-started/startup-quickstart
/getting-started/product-user-quickstart
/getting-started/byok-quickstart
/getting-started/oauth-app-quickstart
/concepts/apps-connections-and-keys
/concepts/funding-and-billing
/inference/chat-completions
/inference/responses
/inference/streaming
/inference/model-discovery
/startups/inference-keys
/startups/product-users
/startups/credit-grants
/startups/provider-credentials
/oauth/overview
/oauth/authorization-request
/oauth/token-exchange
/platform/authentication
/platform/errors
/platform/security
/api-reference
/resources/troubleshooting
```

Once this milestone is coherent and accurate, implement the remaining tree.

## Acceptance Tests

A clean-account reader must be able to:

- Understand which Zorveus integration mode applies to them
- Send a first chat completion using an inference key
- Add product-user metadata and observe attribution
- Understand BYOK provider cost versus Zorveus sell cost
- Register an OAuth app and complete PKCE token exchange
- Identify the correct credential for every API surface
- Find an endpoint from search or navigation
- Understand and act on common errors

The site must not expose admin/internal endpoints, real secrets, infrastructure
identifiers, implementation tracebacks, or unsupported capability claims.

## Completion Report

When implementation is complete, report:

- Site framework and deployment target
- Implemented navigation groups and pages
- OpenAPI generation/filtering mechanism
- Verified inference samples
- CI checks added
- Browser viewports tested
- Deferred pages or capabilities and why they were deferred
- Production URL and any required DNS/environment actions
