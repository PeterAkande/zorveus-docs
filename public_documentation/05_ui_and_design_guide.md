# UI and Design Guide

## Handoff Target Location

The public documentation application is housed at:

```text
/Users/peterakande/DevProjects/Docs/zorveus-docs
```

This guide details the UI/UX design specifications, brand aesthetics, interactive components, and ergonomic features for `https://docs.zorveus.com`.

---

## Design Principles & Aesthetics

1. **Quiet Engineering Ergonomics**:
   - Clean, dark-first UI with monochrome charcoal surfaces (`#0A0A0B` / `#121214`), light borders (`#27272A`), and clear content hierarchy.
   - Geist Sans for prose and navigation; Geist Mono for code blocks, terminal prompts, API parameters, and tokens.
2. **Single Brand Accent (Mint `#4DFFB4`)**:
   - Use mint (`#4DFFB4` / `emerald-400`) sparingly for key indicators: active tabs, focus rings, callout borders, HTTP 200 badges, and active quickstart steppers.
   - Do not use neon glow washes or heavy neon gradients.
3. **Zero Lock-In Component Contract**:
   - Author all `.mdx` files using standard component tags (`<Callout>`, `<Steps>`, `<Tabs>`, `<Tab>`, `<CodeGroup>`, `<CardGroup>`, `<Card>`, `<ParamField>`, `<ResponseField>`, `<Badge>`).
   - Map these component names to the underlying framework layer (Fumadocs primitives), ensuring 100% portability to Mintlify or Nextra without modifying `.mdx` content.

---

## Brand Assets

Official SVG assets are located in the `assets/` subdirectory:

| Asset | File Path | Usage |
| :--- | :--- | :--- |
| **Full Logo** | `assets/zorveus-logo.svg` | Header brand logo and open graph banner |
| **Mark Icon** | `assets/zorveus-mark.svg` | App icon and favicon |
| **Monogram** | `assets/zorveus-icon-only.svg` | Mobile header & tab indicators |
| **Wordmark** | `assets/zorveus-wordmark.svg` | Standalone brand typography |

---

## Required UI/UX Interactive Features

### 1. Interactive Quickstart "Key Inserter"
- **Location**: Top of Quickstart guides (`/getting-started/startup-quickstart`, `/getting-started/byok-quickstart`).
- **Behavior**: An interactive text input allowing developers to temporarily enter their test key (`zrv_...`).
- **Dynamic Update**: As the user types, all code blocks (`curl`, Python, JavaScript, TypeScript) on the page dynamically update in real time with their inserted key.

### 2. Multi-SDK Language Switcher & Persistent Preference
- **Location**: All code blocks and API request examples.
- **Languages**: `cURL`, `Python (OpenAI SDK)`, `JavaScript/TypeScript (OpenAI SDK)`, `Go`, `Rust`.
- **Persistence**: Selecting a language (e.g., Python) remembers the user's preference across all pages via `localStorage`.

### 3. Interactive API "Try-It-Out" Runner
- **Location**: API Reference endpoints (`/api-reference/*`).
- **Behavior**: A collapsible side panel or inline runner next to each endpoint where developers can:
  - Input query params, headers, and JSON body fields.
  - Click **Send Request** to test against `https://api.zorveus.com`.
  - Inspect HTTP status code, response headers, and syntax-highlighted JSON response.

### 4. Authentication Badges
- **Location**: Every API endpoint header and reference card.
- **Badges**:
  - `Inference Key` (`Authorization: Bearer zrv_...`)
  - `Service Key` (`Authorization: Bearer zrv_service_...`)
  - `Dashboard Session` (`Cookie: session=...` + `X-CSRF-Token`)
  - `OAuth Bearer` (`Authorization: Bearer zrv_oauth_...`)

### 5. Interactive OAuth PKCE & Request Sequence Diagrams
- **Location**: `/oauth/overview`, `/oauth/authorization-request`, `/concepts/architecture`.
- **Behavior**: Interactive sequence diagrams showing:
  - Request lifecycle: Client ➔ Zorveus Gateway ➔ Cap Check ➔ Provider ➔ Settle & Debit.
  - PKCE Authorization Code Exchange flow (`code_verifier` ➔ `code_challenge` ➔ Consent screen ➔ Token exchange).

### 6. Command Palette Search (`Cmd + K`)
- **Keyboard Shortcut**: `Cmd + K` or `/`.
- **Behavior**: Modal search indexing page titles, headings, code snippets, parameter fields, and error codes with instant jump previews.

### 7. Navigation & Page Ergonomics
- **Sticky Table of Contents (TOC)**: Right-hand column highlighting active section headers during scroll.
- **Copy & Header Deep Links**: One-click copy icons for code blocks and clickable `#` anchor links for every section heading.
- **Feedback & Edit Links**: Bottom of every page featuring helpfulness buttons (*"Was this page helpful? 👍 👎"*) and GitHub edit triggers.
