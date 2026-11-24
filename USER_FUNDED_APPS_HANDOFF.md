# User-funded apps documentation handoff

This brief specifies the rewrite and consolidation of the **User-funded apps** section (`content/docs/oauth/`). Use it with the repository's `AGENTS.md` and the `unslop` guidelines.

The user requested this resolve document before implementation. Creating this file does not alter code or documentation pages. When authorized, implement according to the specifications below.

---

## 1. Intended result

A developer should be able to register an app, let their users connect a Zorveus wallet, and run inference without paying for model requests from their own company card. 

The section teaches the **Bring Your Own Wallet (BYOW)** architecture:
1. **User owns the wallet:** Users authenticate with Zorveus via OAuth 2.0 PKCE and select which funding account pays.
2. **Direct gateway inference:** Your app uses the returned access token as a standard bearer API key against `https://api.zorveus.com/v1`.
3. **Zero API billing liabilities:** Model usage is charged directly against the user's Zorveus balance and spend limit. Your product incurs $0 in model debt.

### Writing standard

- Write as if you are explaining the feature to a developer sitting beside you. Assume they can code but have never used Zorveus OAuth.
- Open with what the developer can build. Use active voice and concrete examples.
- Remove RFC textbook theory. Explain OAuth actors through what they do in the app:
  - You (the developer) register the app and send requests.
  - The user signs in and chooses which wallet pays.
  - Zorveus handles consent, checks limits, and routes the model calls.
- Clearly separate **Public clients** (React, Single Page Apps, mobile apps) and **Confidential clients** (Node.js, Next.js server actions, Python backends).
- Use real model IDs throughout (`openai/gpt-4.1-mini`, `anthropic/claude-3-5-sonnet`, `gemini/gemini-2.5-flash-image`, `zorveus/qwen3.8-27b`). Never use hallucinated names like `gpt-6-sol`.
- Keep snippets self-contained with package installation commands and imports.
- Link to the live reference Code Lab (**PulseWrite AI** at `pulsewrite.peterakande.com`) as the runnable implementation.

---

## 2. Navigation and page consolidation

The current section suffers from extreme fragmentation: 11 pages, with 5 of them being 10 to 17 line stubs. 

We will consolidate the section into **6 purposeful, comprehensive guides**:

| Order | Target file | Title | Scope and consolidation |
| :--- | :--- | :--- | :--- |
| 1 | `content/docs/oauth/overview.mdx` | Connect user wallets | Product model, architecture diagram, public vs. confidential clients, and the 3-step lifecycle. |
| 2 | `content/docs/oauth/register-an-app.mdx` | Register an OAuth app | Dashboard setup, client types, redirect URIs, permission scopes, and spending cap policies. *(Consolidates `register-an-app.mdx` and `consent-and-caps.mdx`)* |
| 3 | `content/docs/oauth/token-exchange.mdx` | Connect users and exchange tokens | The complete PKCE cycle: generating challenge, browser redirect, handling callback, validating state, and exchanging the code for an access token. *(Consolidates `authorization-request.mdx` and `token-exchange.mdx`)* |
| 4 | `content/docs/oauth/use-the-token.mdx` | Run AI requests with user tokens | Executing chat, image, and audio completions using `@zorveus/sdk`, `@zorveus/react`, and native OpenAI SDKs. User token isolation and real models. |
| 5 | `content/docs/oauth/revocation.mdx` | Disconnect and reauthorize | Handling user logouts, revoking tokens on `/oauth/revoke`, managing expired tokens, and reauthorizing. *(Consolidates `revocation.mdx` and `reauthorization.mdx`)* |
| 6 | `content/docs/oauth/app-review.mdx` | Test, publish, and handle errors | Managing draft status, adding test users, submitting for review, and handling OAuth / inference error codes. *(Consolidates `testing-draft-apps.mdx`, `app-review.mdx`, and `errors.mdx`)* |

### Navigation file (`content/docs/oauth/meta.json`)

```json
{
  "title": "User-funded apps",
  "pages": [
    "overview",
    "register-an-app",
    "token-exchange",
    "use-the-token",
    "revocation",
    "app-review"
  ]
}
```

### URL redirection and anchor compatibility

Preserve inbound links and bookmarks by adding explicit `<span id="..." />` anchors and redirects in `next.config.mjs`:

```javascript
// In next.config.mjs rewrites/redirects:
{ source: '/oauth/authorization-request', destination: '/oauth/token-exchange#start-authorization', permanent: false },
{ source: '/oauth/consent-and-caps', destination: '/oauth/register-an-app#spending-caps', permanent: false },
{ source: '/oauth/reauthorization', destination: '/oauth/revocation#reauthorize-a-user', permanent: false },
{ source: '/oauth/testing-draft-apps', destination: '/oauth/app-review#test-users', permanent: false },
{ source: '/oauth/errors', destination: '/oauth/app-review#oauth-errors', permanent: false },
```

---

## 3. Core architectural patterns

### Public clients vs. Confidential clients

| Dimension | Public client (Browser / Mobile / SPA) | Confidential client (Server / Backend) |
| :--- | :--- | :--- |
| **Example stacks** | React, Vite, Next.js client components, iOS/Android | Node.js, Express, Next.js server actions, FastAPI, Django |
| **Credentials** | `client_id` only. Never holds a client secret. | `client_id` + `client_secret`. Kept on server in `.env`. |
| **PKCE security** | High-entropy verifier kept in memory or `sessionStorage`. | Verifier kept in server session cookie. |
| **Token exchange** | `/oauth/token` called without `client_secret`. | `/oauth/token` called with `client_secret`. |
| **Token storage** | In-memory React state via `@zorveus/react` or local session. | Encrypted database or server session tied to user account. |

### SDK method harmonization

Across all guides and quickstarts, standardize on the canonical method signatures:

- **PKCE generation**:
  - TypeScript: `const { state, codeVerifier, codeChallenge } = await ZorveusOAuth.generatePKCE();`
  - Python: `pkce = ZorveusOAuth.generate_pkce()` (`pkce.state`, `pkce.code_verifier`, `pkce.code_challenge`)
- **Authorization URL**:
  - TypeScript: `ZorveusOAuth.getAuthorizationUrl({ clientId, redirectUri, state, codeChallenge, scopes, baseURL })`
  - Python: `ZorveusOAuth.get_authorization_url(client_id=..., redirect_uri=..., state=..., code_challenge=..., scopes=..., base_url=...)`
  - Scope accepts both array format (`["inference:write", "models:*"]`) and space-separated string (`"inference:write models:*"`).
- **Callback validation**:
  - TypeScript: `ZorveusOAuth.validateCallback({ urlOrParams, expectedState })`
  - Python: `ZorveusOAuth.validate_callback(callback_url, expected_state=...)`
- **Token exchange**:
  - TypeScript: `ZorveusOAuth.exchangeToken({ clientId, clientSecret, code, codeVerifier, redirectUri })`
  - Python: `ZorveusOAuth.exchange_token(client_id=..., client_secret=..., code=..., code_verifier=..., redirect_uri=...)`
  *(Note: Keep `exchangeCode` as an alias in code comments to prevent any legacy confusion).*
- **Token revocation**:
  - TypeScript: `ZorveusOAuth.revokeToken({ clientId, clientSecret, token })`
  - Python: `ZorveusOAuth.revoke_token(client_id=..., client_secret=..., token=...)`

---

## 4. Page specifications

### Page 1: `overview.mdx` (Connect user wallets)
- **Developer goal:** Let users connect their personal Zorveus account and pay for their own AI usage in your app.
- **How it works diagram:**
  - `User -> Your App -> Zorveus OAuth -> User approves wallet`
  - `Your App -> Zorveus Gateway (Bearer user token) -> AI Provider -> User's Wallet debited`
- **When to use this model:**
  - Consumer AI tools, writing studios, developer agents, and BYOW tools where users bring their own compute funds.
  - Contrast with Startups/Product Users (where your product bills the customer on Stripe and allocates allowances).
- **Public vs. Confidential clients overview table.**
- **Reference app:** Link to **PulseWrite AI** (`pulsewrite.peterakande.com`) and its Code Lab.

### Page 2: `register-an-app.mdx` (Register an OAuth app)
- **Step-by-step registration in Zorveus Console:**
  - Choosing app name and logo.
  - Selecting **Public** vs. **Confidential**. Explain rotation of client secrets.
  - Configuring exact redirect URIs (e.g. `http://localhost:5173/oauth/callback` for dev, `https://myapp.com/oauth/callback` for prod).
- **Configuring scopes:**
  - `inference:write`: Required to run completions.
  - Model scopes: `models:*` (all allowed models) or specific namespaces (`models:openai/*`, `models:anthropic/*`). Explain why `openai/*` without `models:` prefix fails validation.
- **Configuring spending caps `<span id="spending-caps" />`:**
  - Explain `default_cap_amount`, `minimum_cap_amount`, `maximum_cap_amount`, and `allow_unlimited_cap`.
  - Cap periods: `daily`, `monthly`, `lifetime`.
  - Explain that caps protect users from surprise bills.

### Page 3: `token-exchange.mdx` (Connect users and exchange tokens)
- **Step 1: Start authorization `<span id="start-authorization" />`**:
  - Generate PKCE challenge and random state.
  - Save verifier and state in session.
  - Redirect browser to `/oauth/authorize`.
  - Show parameters: `response_type=code`, `client_id`, `redirect_uri`, `scope`, `code_challenge`, `code_challenge_method=S256`, `state`.
- **Step 2: User consent on Zorveus:**
  - User logs in, selects organization/wallet, reviews requested models, sets optional spend cap, and approves.
- **Step 3: Handle callback & state verification:**
  - Parse `code` and `state` from query parameters.
  - Check for user cancellation (`error=access_denied`).
  - Compare returned `state` against stored session `state` to prevent CSRF.
- **Step 4: Exchange code for access token:**
  - Call `POST https://api.zorveus.com/oauth/token` with `grant_type=authorization_code`.
  - Provide complete examples in React (`@zorveus/react`), TypeScript (`@zorveus/sdk`), Python (`zorveus`), and cURL.
  - Document the JSON response: `access_token`, `token_type: "Bearer"`, `scope`, `expires_in`, `app_connection_id`, `api_base`.

### Page 4: `use-the-token.mdx` (Run AI requests with user tokens)
- **Using the token as an API key:**
  - The token begins with `zrv_usr_...`.
  - It acts as a standard API key in `Authorization: Bearer <token>`.
- **Calling models with SDKs:**
  - **Zorveus SDK**: `new Zorveus({ apiKey: userToken })`.
  - **OpenAI SDK**: `new OpenAI({ apiKey: userToken, baseURL: "https://api.zorveus.com/v1" })`.
- **Multi-modal examples using real models:**
  - Streaming text completion: `openai/gpt-4.1-mini` or `zorveus/qwen3.8-27b`.
  - Image generation: `gemini/gemini-2.5-flash-image` via `openai.images.generate`.
  - Voice synthesis: `gemini/gemini-2.5-flash-preview-tts` via `openai.audio.speech.create`.
- **User token isolation rules:**
  - Never share client instances across users.
  - Keep tokens scoped to the authenticated session.
  - Never fall back to your own platform API key when a user token fails.

### Page 5: `revocation.mdx` (Disconnect and reauthorize)
- **Token revocation `<span id="revoke-token" />`:**
  - When a user logs out or clicks "Disconnect Wallet", call `POST https://api.zorveus.com/oauth/revoke`.
  - Code examples in TypeScript, Python, and cURL.
  - Explain response `{"revoked": true}`.
- **Token expiration and dashboard revocations:**
  - Tokens may carry `expires_in`. Zorveus does not issue refresh tokens.
  - Users can also revoke connections directly in their Zorveus dashboard.
- **Reauthorizing a user `<span id="reauthorize-a-user" />`:**
  - When an inference request returns HTTP `401` or `403` (`zorveus_key_inactive`), guide the user to reconnect.
  - Re-running the authorization flow updates the existing app connection and replaces the older token without creating orphaned billing accounts.

### Page 6: `app-review.mdx` (Test, publish, and handle errors)
- **Testing draft apps `<span id="test-users" />`:**
  - New apps start in `draft` status.
  - Only organization members and invited test users can connect.
  - Adding test user email addresses in dashboard settings.
- **App review and statuses:**
  - Lifecycle: `draft` -> `submitted_for_review` -> `active`.
  - Submitting app logo, description, terms of service, and privacy policy for public activation.
- **OAuth and inference error handling `<span id="oauth-errors" />`:**
  - Clean error tables matching backend schemas:
    - Authorization errors (`access_denied`, `redirect_uri_mismatch`).
    - Token exchange errors (`zorveus_invalid_code_verifier`, `zorveus_oauth_code_expired`, `zorveus_oauth_code_consumed`, `zorveus_invalid_client_secret`).
    - Post-authorization inference errors (`401` invalid token, `403` inactive/revoked token, `402` insufficient wallet balance, `403` cap exhausted).

---

## 5. Review and verification criteria

Before concluding the User-funded apps rewrite:
1. Run `./node_modules/.bin/fumadocs-mdx` to ensure all frontmatter and MDX content compile cleanly.
2. Run `npm run typecheck` (`tsc --noEmit`).
3. Run `npm test` (`node --test tests/*.test.mjs`) and ensure all 29 tests pass.
4. Run `node scripts/audit-docs.mjs` to confirm all internal links, headings, and cross-references resolve without 404s.
5. Verify that all 5 deleted URLs redirect cleanly in `next.config.mjs`.
