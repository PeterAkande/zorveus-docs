# Zorveus finance model guide

## Status and scope

This guide defines the approved finance model for inference usage in Zorveus

Decision status: Approved on 2026-09-04

It is the source of truth for virtual spend, inference-key caps, product-user credits, organization wallets, Bring Your Own Key usage, wallet fallback, reservations, settlement, and reporting

This guide describes the required product behavior. Some current code does not yet match every rule. The implementation gaps section names those differences

Payment checkout, payment-provider webhooks, refunds, chargebacks, and currency conversion are separate payment-system concerns. They must preserve the wallet rules in this guide

## The three amounts in an inference request

An inference request can produce three different financial amounts. They answer different questions and must not be substituted for each other

| Amount | Question | Applies to wallet mode | Applies to BYOK |
| --- | --- | --- | --- |
| Virtual spend | How much of the inference allowance did this request use? | Yes | Yes |
| Wallet charge | How much does Zorveus deduct from the organization wallet? | Yes | No provider charge, but explicit platform fees can still apply |
| Provider cost | How much did the model provider charge for the request? | Recorded for cost and margin reporting | Recorded for cost reporting and BYOK fee calculation |

Virtual spend uses the same reference pricing for wallet and BYOK requests. Changing the funding source must not change how much product allowance the request consumes

Wallet-funded requests charge the organization wallet at the applicable Zorveus sell price. BYOK requests leave the provider charge outside Zorveus because the provider bills the credential owner directly

## Organization wallets

Every spendable organization has a wallet. Each wallet uses one currency

A wallet has two balances:

- `available_balance` can fund new wallet reservations and explicit fees
- `reserved_balance` holds money for requests that have started but have not reached a final accounting result

A wallet balance and a product user's virtual allowance are independent. A request can have enough virtual allowance but fail because the wallet cannot fund a wallet-routed call. A request can also have enough wallet funds but fail because its enforced virtual allowance is exhausted

BYOK provider usage does not reduce the wallet balance. A BYOK platform fee or a successful wallet fallback can reduce it

## Virtual spend

Virtual spend is the reference-priced value of AI usage. It counts every successfully completed wallet and BYOK request

Virtual spend is scoped before it is compared with a cap:

- When a request has a product user, spend is scoped to that product user and inference key
- When a request has no product user, spend is scoped to requests on that inference key that also have no product user
- Spend from one product user must not consume another product user's base allowance
- Spend with no product user must not consume a named product user's base allowance

Virtual spend is recorded even when no cap exists, the credit mode is `disabled`, or an enforced allowance has already been exceeded by a completed provider request

## Inference-key caps

An inference-key cap is the base virtual allowance for a period

A cap can use a daily, monthly, or lifetime period. Cap accounting considers both completed virtual spend and active virtual reservations

When a request has a product user, the inference-key cap applies separately to that product user. For example, a `$10` cap gives each product user their own `$10` base allowance on that key

When a request has no product user and the mode is `enforce`, the same cap applies to the combined spend of requests on that key that have no product user

### No cap means unlimited allowance

If no applicable cap exists, virtual allowance is unlimited in every credit mode

With unlimited allowance:

- Zorveus records virtual spend
- Zorveus does not block the request because of virtual allowance
- Zorveus does not consume product-user credits
- Wallet balance, provider routing, and BYOK fee rules still apply

Product-user credits extend a configured cap. They do not create a limit when no cap exists

## Product-user credits

Product-user credits are extra virtual allowance owned by one product user in one application

Credits can represent value bought inside the application's main product, promotional value, support adjustments, imported balances, or other grants created by the application

The application decides when a product user has bought extra AI credit and then creates the matching credit grant in Zorveus. This product-user purchase is separate from an organization wallet top-up

Credits are not organization wallet funds. Granting product-user credits does not add money to the organization wallet. Consuming them does not pay a model provider

An active credit grant has a remaining balance and can have an expiry time. Zorveus consumes eligible grants by earliest expiry first

### Allowance formula

When a cap exists, the remaining allowance is:

```text
remaining allowance = remaining base allowance + available product-user credits
```

The remaining base allowance is:

```text
remaining base allowance =
    max(0, cap amount - completed period virtual spend - active base reservations)
```

The admission check for an estimated request is:

```text
estimated request amount <= remaining base allowance + available credits
```

### Base allowance is consumed first

Zorveus consumes the base allowance before product-user credits

For an estimated request, the credit reservation is:

```text
estimated credit reservation = max(0, estimated virtual spend - remaining base allowance)
```

Example:

```text
Cap amount:                    $10
Virtual spend before request:  $8
Remaining base allowance:      $2
Estimated request:             $4
Credits reserved:              $2
```

Zorveus must not reserve `$4` of product-user credits in this example. The first `$2` belongs to the base allowance

### Credit balance and credit usage

`available_credits` is the sum of remaining active, unexpired credit grants

`credits_consumed` is the amount removed from credit grants after the base allowance is exhausted

`credits.spent_this_month` reports credits consumed during the month. It does not report total virtual spend

When a user has no credits, `credits.spent_this_month` does not increase. Virtual spend continues to increase in the usage reports

## Credit modes

The app connection that owns an inference key has one `credit_mode`

User OAuth connections always use `enforce`. Organization programmatic connections default to `enforce_if_present` and can use any supported mode

| Mode | Request has a product user | Request has no product user |
| --- | --- | --- |
| `disabled` | Record virtual spend without enforcing the cap or consuming credits | Record virtual spend without enforcing the cap |
| `track_only` | Record virtual spend and allocate base allowance and credits without blocking | Record virtual spend without blocking for virtual allowance |
| `enforce_if_present` | Enforce the product user's allowance when a cap exists | Record virtual spend without enforcing the cap |
| `enforce` | Enforce the product user's allowance when a cap exists | Enforce the no-product-user allowance when a cap exists |

No mode enforces a virtual allowance when no applicable cap exists

### `disabled`

`disabled` turns off cap enforcement and product-user credit consumption for the inference key

Zorveus still records request identity, tokens, virtual spend, provider cost, wallet charge, funding mode, and other usage dimensions

### `track_only`

`track_only` calculates the same allocation as an enforced request but never blocks because the virtual allowance is insufficient

When a product user has a cap, Zorveus applies virtual spend in this order:

1. Remaining base allowance
2. Available product-user credits
3. Uncovered virtual spend

Uncovered virtual spend is the amount beyond both the cap and available credits. It remains visible in usage reporting and does not make a credit grant negative

When no product user is present, `track_only` records virtual spend without consuming product-user credits

### `enforce_if_present`

`enforce_if_present` is the default mode

When the request includes a valid product user and a cap exists, Zorveus enforces that product user's base allowance plus available credits

When the request has no product user, Zorveus does not enforce the inference-key cap. The request remains subject to wallet, provider, model, authorization, and BYOK fee rules

If the request supplies a product-user identifier that cannot be resolved, Zorveus returns an identity error. It must not treat an invalid identifier as an absent product user

### `enforce`

`enforce` applies cap enforcement whenever a cap exists

When a product user is present, Zorveus compares the request with that product user's allowance on the inference key

When no product user is present, Zorveus compares the request with the combined no-product-user spend on the inference key

Product-user credits never apply to a request without a product user because no product user owns the credits

## Reservation model

A reservation protects money and enforced allowances before Zorveus calls a provider

A request creates one reservation. The `reservation_source` field identifies
the planned provider funding source as `wallet` or `byok`. The reservation
records these amounts separately:

- `estimated_amount` is the estimated virtual spend.
- `wallet_reserved_amount` is the wallet hold. It covers the estimated wallet
  charge for a wallet request or the estimated platform fee for a BYOK request.
- `base_reserved_amount` is the part allocated to the base allowance.
- `reserved_credit_amount` is the promotional credit hold.
- `estimated_provider_cost` and `estimated_fee_amount` support BYOK fee
  calculation and settlement.

The reservation reserves promotional credits only for the estimated amount
above the remaining base allowance.

Active reservations count against the relevant wallet balance and virtual
allowance. This prevents concurrent requests from spending the same funds or
allowance.

Every reservation has an idempotency key. A retry returns the original
allocation or rejects a conflicting request. Settlement, release, expiry, and
cap accounting use the same reservation row for both funding sources.

## Successful wallet-funded requests

A wallet-funded request follows this lifecycle:

1. Zorveus resolves the organization, inference key, optional product user, cap, credit mode, and reference price
2. Zorveus calculates estimated virtual spend and estimated wallet charge
3. Zorveus checks the wallet's `available_balance`
4. Zorveus checks the virtual allowance when the mode requires enforcement
5. Zorveus reserves wallet funds and the required product-user credits
6. The gateway calls the provider with a Zorveus-managed credential
7. Zorveus calculates the actual wallet charge and actual virtual spend
8. Zorveus finalizes the wallet, virtual allowance, credits, usage event, and ledger entries in one database transaction

On success, Zorveus:

- Deducts the actual wallet charge
- Returns the unused wallet reservation to `available_balance`
- Applies actual virtual spend to the remaining base allowance first
- Consumes credits only for actual virtual spend above the base allowance
- Returns unused credit reservations
- Records provider cost, wallet charge, virtual spend, tokens, and attribution

### Cache-aware settlement

Cache pricing affects settlement, not reservation. Zorveus keeps the existing temporary hold because a provider confirms
cache reads and cache creation only after completing the request.

At settlement, Zorveus divides total input tokens into normal input, cache reads, default-duration cache creation, and
one-hour cache creation. It prices each category once from the immutable pricing snapshot, then adds output cost.
Wallet-funded and BYOK requests use the same sell-price calculation for virtual spend. If a provider cost is unavailable,
Zorveus uses the same token breakdown with provider prices.

If cache details are missing, Zorveus prices all input tokens at the normal input rate. If the details are invalid, it
still records the completed request, applies normal input pricing, and records the fallback reason for reconciliation.
Missing cache prices never make tokens free: cache reads fall back to the normal input price, and cache creation falls
back to the highest compatible creation price or the normal input price.

Usage events preserve the cache-token breakdown, pricing tier, fallback reason, and calculated cache savings. Cache
savings compare the cache-read cost with what those tokens would have cost at the normal input rate.

## Failed wallet-funded requests

If no provider attempt succeeds, Zorveus:

- Returns the complete wallet reservation to `available_balance`
- Returns the complete product-user credit reservation
- Records the final request failure and provider-attempt history
- Does not record successful virtual spend

A release failure creates durable retry work. The reservation remains visible until it reaches a final state

## Successful BYOK requests

Bring Your Own Key means the organization supplies the provider credential. The provider bills the credential owner directly

A BYOK request still produces virtual spend. It uses the same reference price as an equivalent wallet-funded request

When wallet fallback is disabled, a successful BYOK request:

- Records the full virtual spend
- Applies the base allowance and product-user credits according to the credit mode
- Records the provider cost for reporting
- Records a zero wallet provider charge
- Charges only an applicable BYOK platform fee

When wallet fallback is enabled and BYOK succeeds, finalization also releases the unused wallet fallback reservation

BYOK finalization must record usage, settle virtual allowance, settle credits, release wallet fallback, and charge the platform fee in one database transaction

If the gateway cannot finalize the request, it creates durable retry work before it considers accounting complete

## Wallet fallback

Zorveus adds a wallet-funded provider route only when `auto_fallback_to_wallet` is enabled for the BYOK routing policy

The routing order is:

1. The primary eligible BYOK credential
2. Other eligible BYOK credentials
3. The Zorveus-managed wallet route

Zorveus can continue to another credential after these failures:

- Provider rate limit
- Provider quota or billing exhaustion
- Invalid, expired, revoked, or unauthorized provider credential
- Provider timeout
- Provider outage or retryable server failure

Zorveus must not use wallet fallback after these failures:

- Invalid request parameters
- Unsupported model features
- Context-length errors
- Empty or malformed prompts
- Content-policy rejection
- Authorization failures caused by the Zorveus inference key or app policy

If the wallet route succeeds, the request becomes wallet-funded usage. Zorveus settles the wallet charge and virtual spend using the successful wallet response

If every route fails, Zorveus releases all wallet and product-user credit reservations

## BYOK platform fees

The BYOK free monthly threshold and fee percentage are Zorveus billing settings

The fee applies only to the part of BYOK provider cost above the threshold

For each request:

```text
feeable provider cost =
    max(0, monthly provider cost after request - threshold)
    - max(0, monthly provider cost before request - threshold)

platform fee = feeable provider cost * fee percentage
```

Example:

```text
Free monthly threshold:            $10,000
Monthly provider cost before call:  $9,999
Current provider cost:                  $2
Feeable provider cost:                  $1
Fee percentage:                          5%
Platform fee:                         $0.05
```

Zorveus must not charge the percentage against the full `$2` in this example

When a request can incur a platform fee, Zorveus reserves an estimated fee from the organization wallet before calling the provider

If the wallet cannot cover the estimated fee, Zorveus rejects the request before the provider call

The organization wallet pays the platform fee. Product-user credits do not pay it, and the fee does not consume virtual allowance

## Actual usage above the estimate

A provider can complete a request whose actual cost exceeds the estimate. Zorveus cannot undo the provider work, so finalization must record the full result

For virtual spend, Zorveus:

1. Records the full actual virtual spend
2. Uses any remaining base allowance
3. Uses available product-user credits
4. Records the remaining amount as uncovered virtual spend
5. Blocks later requests when the mode enforces an exhausted allowance

For a wallet charge above the wallet reservation, Zorveus debits the extra amount from available wallet funds in the same transaction

If the wallet cannot cover the extra amount, Zorveus records an outstanding wallet liability and blocks new wallet-funded requests until the liability is resolved

An estimate overrun must not cause Zorveus to discard the usage event or retry the provider request

## One finalization transaction

Every successful provider request has one finalization operation

Depending on the successful route, finalization can include:

- Creating the usage event
- Settling or releasing the wallet reservation
- Applying actual virtual spend
- Settling or releasing product-user credits
- Charging a BYOK platform fee
- Writing append-only ledger entries

Zorveus commits these changes in one PostgreSQL transaction. If any required write fails, the transaction rolls back and durable retry work preserves the finalization command

Provider execution and database finalization cannot share one transaction. The durable retry closes that gap and makes eventual accounting mandatory

## Append-only ledgers

Zorveus uses append-only ledgers. This model is not formal double-entry accounting

Wallet ledger entries explain changes such as:

- Wallet top-up
- Reservation hold
- Reservation release
- Usage debit
- BYOK platform fee
- Refund debit
- Chargeback debit
- Administrative adjustment

Product-user credit ledger entries explain changes such as:

- Credit grant creation
- Credit reservation
- Credit settlement
- Credit release
- Credit expiry
- Credit revocation
- Administrative adjustment

Ledger rows are immutable. Corrections use compensating entries rather than updates or deletion

## Reporting definitions

Reports and APIs must keep these values separate:

| Field or concept | Meaning |
| --- | --- |
| Virtual spend | Full reference-priced AI usage in wallet and BYOK modes |
| Base allowance used | Virtual spend allocated to the configured cap |
| Credits consumed | Virtual spend allocated to product-user credit grants after the base allowance |
| Uncovered virtual spend | Virtual spend beyond the cap and available credits in a non-blocking or overrun case |
| Wallet charge | Amount deducted from the organization wallet for wallet-funded provider usage |
| BYOK platform fee | Explicit Zorveus fee charged for feeable BYOK provider cost |
| Provider cost | Provider charge paid by Zorveus or the BYOK credential owner |
| Margin | Zorveus wallet charge minus provider cost for wallet-funded usage |

Dashboards must not label provider cost as the user's virtual spend unless the reference-price policy defines them as equal

`credits.spent_this_month` means credits consumed. A separate virtual-spend metric reports the user's complete AI usage

## Cache details in usage logs

The usage-events API returns the cache facts recorded during settlement. The frontend presents these values. It does
not calculate cache prices or replace `virtual_spend`, `usage_cost`, `sell_cost`, or `provider_cost`.

Use this endpoint for the usage log:

```http
GET /dashboard-api/usage/events?org_id=org_123&limit=50&cursor=cur
```

Each usage event includes these cache fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `input_tokens` | integer or `null` | Total normalized input tokens. The total includes normal input, cache reads, and cache creation once. |
| `cache_read_input_tokens` | integer | Input tokens read from an existing provider cache. |
| `cache_creation_input_tokens` | integer | Input tokens written with the provider's default cache duration. |
| `cache_creation_1h_input_tokens` | integer | Input tokens written with a one-hour cache duration. |
| `cache_usage_breakdown_status` | enum | Whether the provider supplied a usable cache breakdown. |
| `pricing_service_tier` | enum | The provider processing tier used to select cache prices. |
| `cache_pricing_fallback_reason` | enum or `null` | Why Zorveus could not use an exact cache price. |
| `cache_savings` | decimal string | Reference-price allowance saved by cache reads compared with normal input pricing. |

The API returns monetary values as decimal strings. Parse them with a decimal-number library. Do not parse them with a
binary floating-point type before formatting.

Use these frontend types:

```typescript
type CacheUsageBreakdownStatus = "reported" | "not_reported" | "invalid";
type CacheServiceTier = "standard" | "flex" | "priority";
type CachePricingFallbackReason =
  | "invalid_token_breakdown"
  | "cache_read_price_missing"
  | "cache_creation_price_missing"
  | "cache_duration_unsupported"
  | "cached_audio_breakdown_unavailable"
  | "service_tier_unavailable";

interface UsageEventCacheDetails {
  input_tokens: number | null;
  output_tokens: number | null;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
  cache_creation_1h_input_tokens: number;
  cache_usage_breakdown_status: CacheUsageBreakdownStatus;
  pricing_service_tier: CacheServiceTier;
  cache_pricing_fallback_reason: CachePricingFallbackReason | null;
  cache_savings: string;
}
```

### Usage-log row

Keep the default table readable. Show these values in each row:

- Total input tokens
- Cache-read tokens when the breakdown status is `reported` and the value is greater than zero
- Output tokens
- Usage cost
- Billing mode
- Status

Show cache reads as secondary text or a badge under total input. For example:

```text
Input
10,000
8,000 cache read
```

Do not add cache-creation columns to the default table. Cache creation is less common and needs its duration to be
useful. Put the full breakdown in the usage-event detail view.

### Usage-event detail

Add an **Input details** section to the event detail view. When
`cache_usage_breakdown_status` is `reported`, show:

```text
Total input                         10,000
Normal input                         1,000
Cache read                           7,000
Cache creation, default duration     1,500
Cache creation, one hour               500
Output                               2,000
Service tier                      standard
AI allowance saved                  $0.01
```

Calculate normal input tokens only when the breakdown status is `reported`:

```text
normal input tokens = max(
    0,
    input tokens
    - cache read input tokens
    - default cache creation input tokens
    - one-hour cache creation input tokens
)
```

This token subtraction is a display calculation. The frontend must use the returned `cache_savings` value for money.

Label `cache_savings` as **AI allowance saved** or **Reference-price cache savings**. Do not label it as provider
savings. In BYOK mode, the provider controls the credential owner's invoice, and that invoice can use different prices.

Hide the savings row when `cache_savings` is zero. A zero value can mean that the request had no cache reads, the cache
read price matched the normal input price, or Zorveus used fallback pricing.

### Breakdown states

Render `cache_usage_breakdown_status` as follows:

| Status | Frontend behavior |
| --- | --- |
| `reported` | Show the complete input breakdown. Show a `No cache used` value when all three cache counts are zero. |
| `not_reported` | Show total input and output only. Show `Cache details not reported` in the detail view. Do not describe all input as normal input. |
| `invalid` | Show total input and output only. Show `Cache details unavailable because the provider returned an invalid breakdown`. Do not use the cache counts in charts or derived values. |

Old usage events have zero cache counts and a `not_reported` status. The frontend must not display those zero values as
proof that the request did not use a cache.

If `input_tokens` is `null`, show an unavailable value for total and normal input. The cache status can still explain why
the breakdown is absent.

### Pricing fallback reasons

When `cache_pricing_fallback_reason` is present, show a small warning in the detail view. The usage event remains valid
and billable. The warning explains how Zorveus priced it.

| API value | Display text |
| --- | --- |
| `invalid_token_breakdown` | The provider returned inconsistent cache-token totals. Zorveus used normal input pricing. |
| `cache_read_price_missing` | The pricing snapshot had no matching cache-read price. Zorveus used the normal input price. |
| `cache_creation_price_missing` | The pricing snapshot had no exact cache-creation price. Zorveus used safe fallback pricing. |
| `cache_duration_unsupported` | The provider reported a cache duration that Zorveus does not price separately. |
| `cached_audio_breakdown_unavailable` | Zorveus could not separate cached audio from cached text. |
| `service_tier_unavailable` | The provider service tier had no matching cache-price rule. |

Do not show a warning when `cache_pricing_fallback_reason` is `null`.

### Service tier and cache operation labels

Use these labels for `pricing_service_tier`:

| API value | Display label |
| --- | --- |
| `standard` | Standard |
| `flex` | Flex |
| `priority` | Priority |

Service tier belongs in the detail view. It explains price selection but does not change how the frontend calculates
token counts.

The API does not return a cache operation on a usage event. The token fields already describe what happened:

- `cache_read_input_tokens` means that the provider reused an existing cache.
- `cache_creation_input_tokens` means that the provider created a default-duration cache entry.
- `cache_creation_1h_input_tokens` means that the provider created a one-hour cache entry.

`CacheOperation` is an internal pricing-rule concept. The frontend does not need an operation enum.

### Example response

```json
{
  "events": [
    {
      "usage_event_id": "ue_123",
      "zorveus_request_id": "zreq_123",
      "app_id": "app_123",
      "app_connection_id": "aconn_123",
      "product_end_user_id": "peu_123",
      "external_user_id": null,
      "member_user_id": null,
      "org_member_id": null,
      "org_id": "org_123",
      "model": "anthropic/claude-sonnet-4-5",
      "provider": "anthropic",
      "provider_model": "claude-sonnet-4-5",
      "input_tokens": 10000,
      "output_tokens": 2000,
      "cache_read_input_tokens": 7000,
      "cache_creation_input_tokens": 1500,
      "cache_creation_1h_input_tokens": 500,
      "cache_usage_breakdown_status": "reported",
      "pricing_service_tier": "standard",
      "cache_pricing_fallback_reason": null,
      "cache_savings": "0.0105000000",
      "provider_cost": "0.0180000000",
      "sell_cost": "0.0000000000",
      "virtual_spend": "0.0250000000",
      "uncovered_virtual_spend": "0.0000000000",
      "overrun_policy": "allow_overrun",
      "overrun_reason": "none",
      "requested_max_output_tokens": null,
      "applied_max_output_tokens": null,
      "unfunded_wallet_charge": "0.0000000000",
      "usage_cost": "0.0250000000",
      "billing_mode": "byok_external",
      "provider_credential_id": "pc_123",
      "provider_credential_version_id": "pcv_123",
      "reservation_id": "res_123",
      "status": "succeeded",
      "latency_ms": 412,
      "created_at": "2026-09-08T12:00:00Z"
    }
  ],
  "next_cursor": null,
  "has_more": false,
  "limit": 50
}
```

The current usage-event query returns `external_user_id` as `null`. The frontend uses `product_end_user_id` for
product-user attribution until the query returns the external identifier.

Treat new enum values as unknown values instead of failing the complete usage log. Show the raw value in the detail view
and report it through frontend telemetry.

The current summary and timeseries APIs do not return cache totals. Do not sum one paginated event page and present it
as an organization-wide cache total. Add cache aggregates to the backend reporting APIs before adding cache totals or
cache-savings charts to the dashboard.

### Frontend acceptance checks

The usage-log work is complete when all of these checks pass:

- A reported cache read appears under the total input count in the table.
- The detail view accounts for every input token exactly once.
- A `not_reported` event does not describe all input as normal input.
- An `invalid` event does not use cache counts in a derived value.
- A cache-creation event shows both the token count and the duration.
- A fallback reason shows an informational warning without changing the event status.
- A BYOK event labels `cache_savings` as allowance savings, not provider-bill savings.
- A zero `cache_savings` value does not render an empty savings row.
- An unknown enum value does not break the usage-log page.
- Cursor pagination keeps the cache fields when the frontend appends the next page.

## Errors and client behavior

The public error contract distinguishes funding failures from policy failures:

| Condition | HTTP status | Meaning |
| --- | --- | --- |
| Insufficient organization wallet balance | `402 Payment Required` | The payer cannot fund the wallet charge or required fee |
| Enforced virtual allowance exhausted | `403 Forbidden` | The request exceeds the configured cap plus available credits |
| Invalid product-user identity | `403 Forbidden` | The supplied product user is not valid for the organization and app |
| Conflicting idempotent request | `409 Conflict` | The same idempotency key was reused with different request facts |
| Completed cost exceeds a reservation | No provider-facing error | Record the actual result and any uncovered amount |

An enforced product-user allowance denial returns
`zorveus_product_user_allowance_insufficient`. The error reports the estimated
request cost, the remaining base allowance, promotional credits, active
reservations, and the shortfall. Clients must use the error code and `params`
instead of matching the message

Error responses use stable machine-readable codes. Clients must not depend on message text

## Worked examples

### Product user within the base cap

```text
Mode: enforce_if_present
Base cap: $10
Virtual spend before request: $3
Available credits: $5
Actual virtual spend: $2

Result:
Base allowance used by request: $2
Credits consumed: $0
Virtual spend after request: $5
Remaining credits: $5
```

### Product user crosses the base cap

```text
Mode: enforce
Base cap: $10
Virtual spend before request: $9
Available credits: $5
Actual virtual spend: $3

Result:
Base allowance used by request: $1
Credits consumed: $2
Virtual spend after request: $12
Remaining credits: $3
```

### Enforced product user exhausts the combined allowance

```text
Mode: enforce_if_present
Base cap: $10
Virtual spend before request: $10
Available credits: $1
Estimated virtual spend: $2

Result:
Request rejected before the provider call
Reason: combined remaining allowance is $1
```

### No cap exists

```text
Mode: enforce
Base cap: none
Available credits: $5
Actual virtual spend: $20

Result:
Request allowed
Virtual spend recorded: $20
Credits consumed: $0
Remaining credits: $5
```

### `enforce_if_present` request without a product user

```text
Mode: enforce_if_present
Inference-key cap: $10
No-product-user spend before request: $50
Product user: absent

Result:
Virtual cap not enforced
Virtual spend still recorded
Wallet or BYOK funding rules still enforced
```

### `enforce` request without a product user

```text
Mode: enforce
Inference-key cap: $10
No-product-user spend before request: $8
Estimated virtual spend: $3

Result:
Request rejected before the provider call
Reason: projected no-product-user spend is $11
```

### `track_only` usage beyond allowance

```text
Mode: track_only
Base cap: $10
Virtual spend before request: $10
Available credits: $2
Actual virtual spend: $5

Result:
Request allowed
Credits consumed: $2
Uncovered virtual spend: $3
Full virtual spend recorded: $5
```

### BYOK succeeds while wallet fallback is reserved

```text
Provider route: BYOK
Wallet fallback: enabled and reserved
Virtual spend: $1
Provider cost: $0.60
Wallet provider charge: $0

Result in one finalization transaction:
Record $1 virtual spend
Apply the base allowance and credits
Release the complete wallet fallback reservation
Record $0.60 provider cost
Charge only an applicable BYOK platform fee
```

### Wallet fallback succeeds

```text
Primary BYOK credential: quota exhausted
Backup BYOK credential: timed out
Wallet fallback: enabled
Wallet fallback result: success

Result:
Settle the wallet charge
Record virtual spend at the reference price
Apply the base allowance and credits
Record both failed BYOK attempts and the successful wallet route
```

## Required invariants

The implementation must preserve these rules under retries, concurrency, worker failure, and process restarts:

- A wallet balance cannot spend the same available funds twice
- A product user's base allowance cannot be reserved twice
- A product-user credit grant cannot become negative
- Base allowance is always allocated before product-user credits
- No cap always means unlimited virtual allowance and zero credit consumption
- Wallet and BYOK requests use the same virtual-spend pricing
- A completed provider request always produces one final usage result
- A request cannot produce duplicate wallet or credit movements
- Every reservation eventually becomes settled, released, or visibly stuck
- A failed finalization always has durable retry work
- Wallet fallback runs only when `auto_fallback_to_wallet` is enabled
- Wallet fallback never converts an invalid request into wallet-funded usage
- Ledger corrections use compensating entries

## Current implementation gaps

The following gaps existed when this guide was written and require code changes or verification:

- Product-user credits can be reserved before the base cap is exhausted
- Wallet and BYOK usage do not yet use one explicit virtual-spend value
- Current cap handling can bypass the intended meanings of `enforce` and `enforce_if_present`
- `track_only` credit summaries do not expose uncovered virtual spend
- A completed request can fail settlement when actual wallet cost exceeds its reservation
- BYOK external-usage failure does not yet create durable retry work
- BYOK wallet release and external-usage accounting can occur in separate transactions
- The BYOK fee can apply to the full threshold-crossing request instead of only the feeable portion
- The current insufficient-wallet reservation error uses `403` instead of the approved `402`
- Some existing documentation describes the wallet ledger as double-entry or describes credits as the complete usage metric

Do not remove a gap from this list until the implementation, regression tests, and production-boundary verification all match the approved behavior
