# Backend and OpenAPI Source Guide

## Two Public Backend Surfaces

Zorveus exposes two surfaces behind `api.zorveus.com`:

1. The FastAPI product/control API.
2. The OpenAI-compatible inference gateway.

FastAPI's `/openapi.json` describes the product API only. It contains public,
dashboard-only, internal, and administrative operations, so it must be filtered
before becoming a public reference.

The inference gateway is routed through LiteLLM and requires hand-authored
Zorveus guides plus verified examples. Do not assume the product OpenAPI schema
describes inference.

## Generate a Fresh Product API Schema

From the backend repository root:

```bash
cd /Users/peterakande/DevProjects/Backend/work/zorveus
ZORVEUS_ENVIRONMENT=test /Users/peterakande/DevProjects/Backend/work/zorveus/.venv-zorveus/bin/python -c '
import json
from pathlib import Path
from zorveus.root.app import create_app
from zorveus.root.settings import ZorveusSettings

schema = create_app(ZorveusSettings(environment="test")).openapi()
Path("/tmp/zorveus-openapi.json").write_text(
    json.dumps(schema, indent=2, sort_keys=True) + "\n"
)
'
```

The deployed schema is available at:

```text
https://api.zorveus.com/openapi.json
```

Prefer generating from the exact commit being documented. Fetch production only
to verify that deployment matches the commit.

The schema is OpenAPI 3.1 and currently has approximately 111 paths. The count
will change and must not be hardcoded into the docs.

## Never Publish the Raw Schema

Exclude every operation under:

```text
/admin/*
/internal/*
/payments/webhooks/*
```

Health routes can appear on an integration-health page, but not as primary
customer API operations.

Payment webhooks are provider-to-Zorveus infrastructure. A setup guide may tell
an operator which webhook URL to configure, but customers do not call or
simulate that endpoint as an ordinary API operation.

## Public Product API Groups

| Group | Route families | Primary authentication |
| --- | --- | --- |
| Account | `/auth/*`, `/me` | Dashboard session; CSRF on writes |
| Organizations | `/orgs*`, `/onboarding/*` | Dashboard session; CSRF on writes |
| Apps | `/apps*` | Dashboard session; CSRF on writes |
| OAuth | `/oauth/*` | Mixed browser, session, and client authentication |
| App connections | `/app-connections*` | Dashboard session or supported service flow |
| Service keys | `/orgs/{org_id}/service-keys*` | Dashboard session |
| Product users | `/product-users*` | Dashboard session or organization service key |
| Provider credentials | `/provider-credentials*` | Dashboard session or organization service key |
| Wallet | `/wallet*` | Dashboard session |
| Payments | `/wallet/top-up*` | Dashboard session |
| Promotions | `/wallet/promotions/redeem` | Dashboard session |
| Caps | `/caps*` | Dashboard session |
| Usage | `/dashboard-api/usage*` and summaries | Dashboard session |
| Models | `/models` | Dashboard session |
| Notifications | `/notification-settings` | Dashboard session |

Do not assign authentication from this table alone. Inspect each route's
dependencies and tests before generating an auth badge or request example.

## Authentication Sources

### Dashboard Session and CSRF

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/session_auth.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/session_service.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/auth_router.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/me_router.py
```

Browser reads use the HTTP-only dashboard session cookie. State-changing
dashboard requests require the session, CSRF header, and trusted Origin.
Frontend examples should use credentials-enabled browser fetch.

Never tell browser code to read or attach the HTTP-only cookie manually.

### Inference Key

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/zorveus_gateway/auth.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/zorveus_gateway/hooks.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/zorveus_gateway/routes.py
```

Inference uses:

```http
Authorization: Bearer zrv_...
```

The key resolves an app connection and its organization, scopes, models, cap,
credit mode, and provider credential policy.

### Organization Service Key

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/service_key_auth.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/api_keys_router.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/product_users_router.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/provider_credentials_router.py
```

Inspect each programmatic route dependency to document exact headers and
permissions. Service keys are server-only.

### OAuth Client Authentication

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/oauth_router.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/oauth_service.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/database/db_handlers/oauth_db_handler.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/oauth_schemas.py
```

Authorization is browser-driven. Token exchange is backend-driven for
confidential clients. Always document PKCE and state validation.

### Provider Webhooks

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/payments_router.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/payment_service.py
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/payment_providers.py
```

This is provider infrastructure, not customer API authentication.

## Product API Source Map

| Topic | Router | Schema | Main service |
| --- | --- | --- | --- |
| Signup, login, sessions | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/auth_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/auth_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/identity_service.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/session_service.py` |
| Current user | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/me_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/auth_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/user_service.py` |
| Organizations and members | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/orgs_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/org_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/org_service.py` |
| Apps | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/apps_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/app_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/app_service.py` |
| OAuth | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/oauth_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/oauth_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/oauth_service.py` |
| Connections and keys | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/app_connections_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/app_connection_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/app_connection_service.py` |
| Service keys | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/api_keys_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/key_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/api_key_service.py` |
| Product users and grants | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/product_users_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/product_user_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/product_user_service.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/product_user_credit_service.py` |
| Provider credentials | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/provider_credentials_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/provider_credential_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/provider_credential_service.py` |
| Wallet and ledger | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/wallet_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/wallet_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/wallet_service.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/ledger_service.py` |
| Top-ups | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/payments_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/payment_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/payment_service.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/payment_providers.py` |
| Promotions | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/promotions_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/promotion_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/promotion_service.py` |
| Caps | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/caps_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/cap_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/cap_service.py` |
| Usage | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/usage_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/usage_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/usage_service.py` |
| Dashboard summaries | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/dashboard_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/dashboard_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/dashboard_service.py` |
| Models and providers | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/models_router.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/provider_credentials_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/models_schemas.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/provider_credential_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/models_service.py`, `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/provider_credential_service.py` |
| Notifications | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/notifications_router.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/notification_schemas.py` | `/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/notification_service.py` |

Router, schema, and service paths are rooted at
`/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/routers/`,
`/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/schemas/`, and
`/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/services/`.

## Verify an Endpoint Contract

For every documented operation:

1. Locate its route decorator and function.
2. Record request/response models, parameters, status code, and dependencies.
3. Inspect Pydantic fields for required, optional, nullable, enum, and bounds.
4. Inspect service validation, idempotency, and lifecycle behavior not in OpenAPI.
5. Inspect mapped router and service tests for errors and edge cases.
6. Compare the Bruno request for a realistic call sequence.
7. Run the request against local or staging before publishing it.

OpenAPI is authoritative for shape, but it does not fully explain cross-resource
semantics, one-time secrets, privacy, or transaction behavior.

## OpenAPI Filtering Policy

Create a derived schema and leave the backend schema unchanged:

1. Remove private path prefixes.
2. Remove component schemas referenced only by removed operations.
3. Add `https://api.zorveus.com` as production server metadata.
4. Preserve OpenAPI 3.1 nullable semantics.
5. Preserve operation IDs or map them explicitly to stable docs IDs.
6. Add auth descriptions only after checking route dependencies.
7. Fail CI when a public operation disappears or changes incompatibly.

Parse JSON structurally. Do not filter the schema with string replacement.

## Label API Surfaces Correctly

Do not show cookie-authenticated dashboard endpoints as if they were suitable
for a startup backend.

Use these labels:

- `Dashboard API`: used by `app.zorveus.com` with cookie and CSRF
- `Management API`: server-to-server with an organization service key
- `OAuth endpoint`: browser navigation or OAuth client backend
- `Inference API`: called with a Zorveus inference key

When a resource has dashboard and programmatic variants, explain both and lead
startup automation toward the service-key route.

## Inference Gateway Sources

Allowed route classification:

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/zorveus_gateway/routes.py
```

Production ALB route manifest:

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/infra/aws/ecs-fargate/gateway-route-manifest.json
```

The allowlist defines paths that may reach the gateway, not complete product
support. Before publishing a capability, verify route classification, custom
auth, reservation/usage hooks, model parsing, credential injection, pricing,
accounting, and a maintained successful example.

## Maintained Inference Examples

Initial evidence lives in:

```text
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/01_normal_inference_with_cap.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/02_inference_with_product_user.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/03_streaming_chat_completion.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/04_responses_api.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/05_tool_calling.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/06_list_models.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/07_embeddings.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/08_image_generation.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/09_moderation.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/10_text_to_speech.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/11_rerank.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/12_realtime_client_secret.py
/Users/peterakande/DevProjects/Backend/work/zorveus/examples/zorveus_client/15_audio_transcription.py
```

Some examples skip when no compatible model is configured. A skipped example
is not proof of production support.

## Provider and Model Sources

Use runtime catalogs as customer-facing sources:

- Product model picker: `GET /models`
- Provider catalog: `GET /provider-credentials/providers`
- Inference-key discovery: `GET /v1/models`

The repository model-price JSON is pricing input and fallback metadata. It is
not proof that a deployed key can route a model.

## Errors

Product API errors use:

```json
{
  "error": {
    "code": "zorveus_example_error",
    "message": "A safe public message."
  }
}
```

Gateway errors are OpenAI-compatible and may place a Zorveus error in
provider-specific fields. Document both shapes separately.

Canonical codes and messages live in
`/Users/peterakande/DevProjects/Backend/work/zorveus/zorveus/root/http_errors.py`.
Never expose tracebacks, SQL details, credential previews, or internal exception
text.

## Bruno and Tests

Bruno provides request sequences and variables but is not the contract. Tests
are stronger evidence. Every guide should identify at least one mapped test and
one Bruno request where available.

## Documentation Update Workflow

Every public backend change should trigger:

1. Fresh OpenAPI generation.
2. Public-schema diff.
3. Related guide review.
4. Code-sample verification.
5. Customer-visible changelog entry.
6. Redirect or migration guide for renamed or removed contracts.

The docs build should fail on an unreviewed breaking public-schema diff instead
of silently deploying stale reference pages.
