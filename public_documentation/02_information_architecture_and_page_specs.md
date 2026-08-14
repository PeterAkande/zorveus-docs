# Information Architecture and Page Specifications

## Navigation Principles

- Lead with successful workflows, not an alphabetical API catalog.
- Make Startup Quickstart the strongest call to action.
- Keep OAuth development separate from startup programmatic inference.
- Put concepts before advanced reference.
- Keep wallet-user help available without crowding the developer path.
- Link each conceptual guide to its related API reference operations.
- Mark features as Beta, Deprecated, or Planned when appropriate.

## Proposed MDX Content Tree

```text
content/
  index.mdx
  getting-started/
    overview.mdx
    startup-quickstart.mdx
    product-user-quickstart.mdx
    byok-quickstart.mdx
    oauth-app-quickstart.mdx
  concepts/
    architecture.mdx
    organizations.mdx
    apps-connections-and-keys.mdx
    funding-and-billing.mdx
    models-and-routing.mdx
    caps-and-credits.mdx
    usage-and-cost.mdx
  inference/
    overview.mdx
    chat-completions.mdx
    responses.mdx
    streaming.mdx
    tool-calling.mdx
    product-user-metadata.mdx
    embeddings.mdx
    images.mdx
    audio.mdx
    moderation.mdx
    rerank.mdx
    realtime.mdx
    model-discovery.mdx
  startups/
    apps.mdx
    inference-keys.mdx
    product-users.mdx
    credit-grants.mdx
    service-keys.mdx
    provider-credentials.mdx
    automatic-routing.mdx
    members.mdx
  oauth/
    overview.mdx
    register-an-app.mdx
    authorization-request.mdx
    consent-and-caps.mdx
    token-exchange.mdx
    use-the-token.mdx
    reauthorization.mdx
    revocation.mdx
    testing-draft-apps.mdx
    app-review.mdx
    errors.mdx
  wallet-and-billing/
    wallets.mdx
    top-ups.mdx
    top-up-return-flow.mdx
    promotions.mdx
    caps.mdx
    ledger.mdx
    usage.mdx
    usage-filters.mdx
    byok-costs.mdx
  account-and-organizations/
    account-security.mdx
    organizations.mdx
    members-and-invites.mdx
    connected-apps.mdx
    notification-settings.mdx
  providers/
    overview.mdx
    openai.mdx
    gemini.mdx
    anthropic.mdx
    nvidia-nim.mdx
    openrouter.mdx
    azure-openai.mdx
    aws-bedrock.mdx
  platform/
    base-urls.mdx
    authentication.mdx
    errors.mdx
    rate-limits.mdx
    idempotency.mdx
    pagination.mdx
    money-and-dates.mdx
    security.mdx
  api-reference/
    generated pages
  resources/
    examples.mdx
    troubleshooting.mdx
    faq.mdx
    changelog.mdx
    support.mdx
```

The implementation may adapt filenames to its MDX framework, but public slugs
and grouping should remain stable once launched.

## Home Page

`/`

Required content:

- Literal H1: `Zorveus Documentation`
- One-sentence startup-focused description
- Three intent cards: Build an AI product, Connect an OAuth app, Use your wallet
- A minimal OpenAI-compatible example above the fold
- Links to model discovery, API reference, examples, status, and support
- Production API base URL

Do not turn this into a marketing landing page. The first viewport should help
the reader begin an integration.

## Getting Started

### Overview

Explain the three modes and help the reader choose:

| Goal | Path |
| --- | --- |
| Startup funds its own product | Startup programmatic connection |
| Startup uses its own provider key | Startup connection plus provider credential |
| End user funds a third-party app | OAuth user connection |

Include prerequisites, production base URLs, credential terminology, and links
to each quickstart.

### Startup Quickstart

Required steps:

1. Create or select a startup organization.
2. Create an app.
3. Create a dashboard inference key for the app and organization.
4. Store the one-time key securely.
5. Call `https://api.zorveus.com/v1` with the OpenAI client.
6. Verify usage in the dashboard.

Provide `curl`, Python, JavaScript, and TypeScript samples. Explain that cap and
model policies are configured in Zorveus, not sent by the client request.

### Product-User Quickstart

Start from a working startup inference key. Add metadata containing the external
user ID, display name, email, and optional startup metadata such as plan or
source. Explain precedence when both external ID and a Zorveus product-user ID
are supplied. Link to Product Users and Credit Grants.

### BYOK Quickstart

Show provider discovery, credential creation, model policy, automatic
resolution, inference, and usage. State clearly that the provider bills the
organization directly.

### OAuth App Quickstart

Build one complete Authorization Code with PKCE flow using synthetic values.
Explain browser navigation versus server-side token exchange.

## Concepts

### Architecture

Use one request-lifecycle diagram and distinguish control plane, inference data
plane, AI providers, wallet/caps/credits, and usage accounting.

### Organizations

Explain personal, startup, and developer organizations. Document ownership and
funding boundaries. Internal organizations are not customer workspaces.

### Apps, Connections, and Keys

Include this relationship:

```text
organization owns app
app + funding organization -> app connection
app connection -> historical inference keys
only active, non-revoked keys can call inference
```

Compare inference keys, service keys, OAuth client secrets, provider
credentials, and dashboard sessions.

### Funding and Billing

Compare wallet-funded, BYOK, and product-credit enforcement. Describe reserve,
provider call, and settlement without exposing internal reservation APIs.

### Models and Routing

Explain provider-prefixed model names, wildcard policies, model discovery,
provider resolution, priority, and managed fallback.

### Caps and Credits

Compare hard periodic spend limits with consumable product-user grants. Include
effective backend precedence.

### Usage and Cost

Define tokens, request count, provider cost, sell cost, billing mode, status,
and member/product-user attribution.

## Inference Pages

Every inference capability page must include:

- Endpoint and SDK method
- Authentication
- Supported request shape
- Minimal request
- Streaming example when applicable
- Product-user metadata compatibility
- Model-selection guidance
- Representative response
- Common errors
- Link to upstream-compatible semantics where Zorveus does not alter them

Use
`/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/`
as executable evidence. Do not publish a capability merely because a route
appears in the gateway allowlist.

The Model Discovery page must explain that policies such as `*` or `gemini/*`
expand into concrete routable models instead of appearing as model choices.

## Startup Pages

### Apps

Document create, list, detail, update, models, scopes, and the distinction
between a startup internal app and a developer OAuth app. Redirect URIs may be
empty at creation and added later.

### Inference Keys

Document creation, one-time secret display, alias, model policy, scope, cap,
credit mode, rotation, listing, update, and revocation.

### Product Users

Document inline upsert, explicit external-ID upsert, list/search/filter, detail,
status, usage summary, and effective cap presentation.

### Credit Grants

Document dashboard and service-key grants, expiration, remaining amount,
revocation, precedence, and startup-side idempotency.

### Service Keys

Document safe server use, supported management operations, revocation, and a
prominent browser-exposure warning.

### Provider Credentials

Document provider discovery, provider configuration, validation, encryption,
fingerprints, model policy, routing mode, priority, connection overrides,
rotation, and deletion.

### Automatic Routing

Explain exact and wildcard policies, active status, routing priority,
connection-specific grants, and fallback. Do not promise unimplemented provider
failover.

### Members

Explain roles, invitations, wallet spending by members, and runtime member
attribution. Keep product users visibly separate.

## OAuth Pages

### Overview

Define all actors and provide a complete sequence diagram.

### Register an App

Document app fields, one-time client secret, redirects, scopes, models, origins,
cap policy, test users, and app status.

### Authorization Request

Document `response_type`, `client_id`, `redirect_uri`, `scope`,
`code_challenge`, `code_challenge_method=S256`, and `state`. Explain URL
encoding and frontend-owned OAuth entry behavior. The browser navigates to this
URL; it is not a normal JSON fetch.

### Consent and Caps

Explain payer organization selection, models/scopes, approval, unlimited choice,
and developer-configured min/default/max boundaries. Null boundaries mean no
developer boundary, not a hidden global limit.

### Token Exchange

Document code, verifier, redirect URI, client authentication, one-time code use,
and returned inference credential.

### Reauthorization

Explain one logical active user connection per app identity. Reauthorization can
change organization, policy, and cap; previous OAuth inference tokens are
revoked and one replacement is returned.

### Testing and Review

Explain draft test-user emails and draft, submitted, active, rejected, and
suspended states. Review status belongs inside app detail.

### OAuth Errors

Distinguish errors safe to redirect to a validated client URI from errors that
must remain on Zorveus because the client or URI cannot be trusted.

## Wallet and Billing Pages

### Wallets and Ledger

Explain available and reserved balances, ledger entries, and why in-flight
requests reserve funds.

### Top-Ups

Document provider selection, supported currencies, checkout creation, redirect,
status polling, webhook confirmation, expiry, and failure. Do not promise
currency conversion.

### Promotions

Document redemption and eligibility without exposing targeting rules to
ineligible users. Cover verified email, organization type, allowlists, account
creation range, minimum wallet spend, active dates, and redemption limits. All
configured groups use AND; values within an allowlist use OR.

### Usage and Filters

Document summary, event log, time series, and all implemented dimensions. Show
combined filtering rather than separate one-dimensional APIs.

## Account and Organization Help

These pages explain dashboard tasks rather than low-level contracts. Cover
account security, organizations, member invitations, connected apps,
revocation, notifications, email verification, and password recovery when
those email flows are implemented.

## Provider Pages

Each provider page should include:

- Provider identifier returned by the provider catalog
- Where to obtain the credential
- Required secret shape and provider config
- Example model policy and model name
- Validation behavior
- Common authentication and endpoint errors
- Whether a custom API base is required

Never place real provider keys in examples.

## Platform Pages

### Base URLs and Authentication

State production and local URLs. Compare dashboard session, inference key,
service key, OAuth client secret, and provider webhook authentication.

### Errors

Document both the product error envelope and OpenAI-compatible gateway error
envelope, including provider-specific fields and request IDs.

### Rate Limits

Publish concrete numbers only when enforced and stable. Otherwise explain `429`,
retry behavior, and returned headers without inventing quotas.

### Idempotency and Pagination

Document only implemented idempotency fields. Use actual endpoint pagination
parameters and shapes rather than a fictional global convention.

### Security

Cover secret storage, backend-only credentials, PKCE, OAuth state, exact
redirect matching, rotation, least-privilege model policy, caps, and safe logs.

## API Reference

Generate reference pages from the filtered FastAPI OpenAPI schema. Group by
public product domain. Hand-authored guides explain workflows and cross-endpoint
behavior.

## Resources

### Troubleshooting

Cover invalid/revoked keys, model policy denial, no routable provider, pricing
snapshot failure, wallet/cap denial, product credits, provider auth, redirect
mismatch, expired OAuth requests, CSRF/Origin errors, and payment currency
rejection.

### Changelog and Support

Provide dated customer-visible changes, breaking-change migration guidance,
status link, support contact, and security-reporting channel.

## Launch Scope

The minimum credible launch includes:

1. Home and core concepts
2. Startup Quickstart
3. Chat Completions, Responses, Streaming, and Model Discovery
4. Product Users and Credit Grants
5. Provider Credentials and BYOK
6. Inference Keys
7. Usage and Cost
8. Complete OAuth track
9. Authentication, Errors, and Security
10. Filtered API reference
11. Troubleshooting and Support

Audio, images, realtime, rerank, detailed wallet help, and individual provider
pages can follow if their capability tests are still being finalized.
