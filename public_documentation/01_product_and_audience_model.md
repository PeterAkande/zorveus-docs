# Product and Audience Model

## Product Definition

Zorveus is an AI wallet, billing layer, and multi-provider inference gateway.
It sits between AI applications and model providers.

For startups, Zorveus provides one OpenAI-compatible API for model access,
provider credential routing, product-user attribution, usage accounting,
credits, wallets, and spending controls.

For wallet users, Zorveus provides one funded balance that can be connected to
multiple AI applications with per-app control and visibility.

For app developers, Zorveus provides an OAuth-style connection flow that lets
users authorize an app to use a selected Zorveus funding organization.

## One-Sentence Explanations

General:

> Zorveus is one wallet and control layer for using AI across products and providers.

Startup-focused:

> Zorveus lets startups add multi-provider AI, product-user metering, credits, and spending controls through one OpenAI-compatible API.

Developer-focused:

> Zorveus lets developers connect their apps to a user's AI wallet and call models with a scoped inference key.

## Audiences

### Startup Product Teams

This is the primary docs audience.

They need to understand:

- How an app groups inference and product users
- How to create and rotate inference keys
- How to identify a product user from request metadata
- How Zorveus creates product users inline
- How product-user credit grants work
- How startup members spend from an organization wallet
- How caps differ from credits
- How to add provider credentials
- How wallet-funded and BYOK billing differ
- How to inspect usage by app, model, provider, key, member, and product user

Their shortest successful path is:

```text
startup workspace
  -> app
  -> org-programmatic app connection
  -> inference key
  -> OpenAI-compatible request
  -> usage event
```

### OAuth App Developers

They build applications that users connect to Zorveus.

They need to understand app registration, client credentials, redirect URIs,
allowed scopes and models, test users, Authorization Code with PKCE, consent,
token exchange, inference, reauthorization, revocation, review, and aggregate
usage without connected-user identity disclosure.

Their shortest successful path is:

```text
developer app
  -> authorization URL
  -> Zorveus consent
  -> authorization code
  -> token exchange
  -> scoped inference key
  -> OpenAI-compatible request
```

### Wallet Users

They use Zorveus rather than integrating its API. They need task-focused help
for signup, verification, password recovery, organizations, wallet top-up,
promotions, connected apps, consent, caps, usage, members, sessions, and Bring
Your Own Key. These pages should not read like backend API reference.

### Internal Zorveus Operators

Internal administrators are not a public-docs audience. Their APIs and runbooks
remain in private operational documentation.

## Core Resource Model

### Organization

An organization is an ownership and funding boundary.

| Type | Meaning |
| --- | --- |
| `personal` | A user's personal wallet and connected apps |
| `startup` | A company's funded AI product workspace |
| `developer` | A team building OAuth-connectable apps |

The `internal` type is reserved for Zorveus operations and must not be presented
as a user-created workspace option.

### App

An app is a registered product identity. It defines identity, allowed models,
allowed scopes, OAuth settings, redirect URIs, test users, review state, and
consent cap policy. It is not itself a credential or connected wallet.

### App Connection

An app connection binds an app to the organization funding or authorizing its
usage.

| Connection type | Meaning |
| --- | --- |
| `org_programmatic` | A startup or organization creates a backend inference connection |
| `user_oauth` | A user approves an app through OAuth consent |

The connection owns policy such as allowed models, approved scopes, status,
credit mode, and an optional cap.

### Inference Key

An inference key authenticates requests to the OpenAI-compatible gateway. It
belongs to an app connection. The raw key is shown only when created or rotated.

### Service Key

A service key is a server-to-server management credential for an organization.
It can manage supported resources such as product users, credit grants, and
provider credentials. It is not used for inference and must never enter browser
code.

### Provider Credential

A provider credential is an organization-owned encrypted AI-provider secret.
Routing policy determines which app connections and model patterns may resolve
it.

### Product User

A product user is a startup's customer, not a Zorveus dashboard member. The
startup's `external_user_id` is the preferred integration identifier.

Requests may include name, email, and metadata. Zorveus can create or update the
product user inline when an external ID has not been seen before.

### Wallet

A wallet belongs to a spendable organization. Available balance can be spent;
reserved balance is held for in-flight inference. Internal and developer
organizations are not normal spendable wallet surfaces.

### Cap

A cap is a hard spending limit over a period. Relevant public targets include
organization, app connection/inference key, and product user. Reaching a cap
prevents new provider spend.

### Product-User Credit Grant

A credit grant allocates startup-funded value to a product user. Grants can
expire or be revoked. Zorveus does not need to understand the startup's Free,
Pro, Enterprise, referral, or promotional plan names; the startup translates
its own business rules into grants.

### Usage Event

A usage event records one inference outcome. It carries dimensions such as
organization, app, connection, model, provider, billing mode, product user,
member attribution, tokens, provider cost, and sell cost.

## Funding and Billing Modes

### Zorveus-Funded Wallet Usage

Zorveus reserves funds before calling the provider, settles actual usage after
the response, and debits the selected organization wallet. Provider cost and
sell cost are both meaningful.

### Bring Your Own Key

The organization provides the provider credential. Zorveus records tokens and
provider cost for visibility, but Zorveus sell cost and wallet debit are zero
unless another explicit fee model is introduced.

The docs must never describe BYOK as free. The provider still charges the
credential owner.

### Product-User Credits

When a connection enforces credits, the request must identify a product user
and that user must have sufficient applicable credit. Credits allocate the
startup's funded value; they do not replace provider routing or usage records.

## Inference Request Lifecycle

Every inference guide should use this mental model:

1. The client sends an OpenAI-compatible request with an inference key.
2. Zorveus resolves the app connection, organization, scopes, and model policy.
3. Optional metadata resolves the product user and runtime organization member.
4. Zorveus resolves an eligible organization credential or Zorveus credential.
5. Wallet, cap, or product-credit checks reserve the allowed amount.
6. The gateway calls the provider and streams or returns the response.
7. Zorveus records tokens and provider cost.
8. Wallet-funded requests settle sell cost; BYOK retains zero sell cost.
9. Usage appears in summaries, events, and time series.

## OAuth Privacy Model

The developer owns app configuration. The payer owns the connection, wallet,
caps, credentials, and usage identity.

Developer dashboards may show aggregate app adoption and usage. They must not
show connected-user lists, payer identities, members, product users, wallet
balances, or provider credentials.

## Terminology Rules

Use these terms consistently:

- `inference key` for gateway access
- `service key` for organization management automation
- `provider credential` for a stored provider secret resource
- `product user` for the startup's customer
- `organization member` for a dashboard team member
- `app connection` for a specific funding or authorization binding
- `provider cost` for estimated provider charge
- `sell cost` for amount billed by Zorveus
- `Bring Your Own Key (BYOK)` in full on first use

## Claims That Require Care

Do not claim that every LiteLLM-supported route or provider is production-ready
in Zorveus. Public capability claims require a working Zorveus test or verified
example.

Do not claim automatic currency conversion. Payment-provider currency support
and wallet currency conversion are separate concerns.

Do not present planned features such as marketplace discovery, dynamic client
registration, or product-user self-funded add-ons as available unless the
current backend and tests prove them.
