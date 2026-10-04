# Cache-aware input pricing plan

## Status

Implemented on 2026-09-08

This plan extends the finance model in `docs/zorveus_finance_model_guide.md`. It does not change the meaning of wallets,
virtual allowance, promotional credits, or overrun policies.

## Problem

Zorveus currently stores total input tokens and output tokens. It prices every input token at the normal input rate when
it calculates cost from a pricing snapshot.

That calculation misses two provider price categories:

- Cache-read input tokens usually cost less than normal input tokens.
- Cache-creation input tokens can cost more than normal input tokens.

LiteLLM can include cache discounts in its computed response cost. Zorveus cannot rely on that value as its only source
of truth. The value is not present on every provider path, and Zorveus needs one durable calculation for wallet usage,
BYOK virtual spend, retries, and reconciliation.

The checked-in `model_prices_and_context_window.json` already contains cache prices. At the time of this plan, the catalog contains:

- 710 model entries with `cache_read_input_token_cost`
- 243 model entries with `cache_creation_input_token_cost`
- 124 model entries with `cache_creation_input_token_cost_above_1hr`
- 94 model entries with a cache price that changes above an input-token threshold

Regenerate these counts with:

```bash
jq '[to_entries[] | select(.value.cache_read_input_token_cost != null)] | length' model_prices_and_context_window.json
jq '[to_entries[] | select(.value.cache_creation_input_token_cost != null)] | length' model_prices_and_context_window.json
jq '[to_entries[] | select(.value.cache_creation_input_token_cost_above_1hr != null)] | length' model_prices_and_context_window.json
jq '[to_entries[] | select(any(.value | keys[]; test("cache_(read|creation).*above_[0-9]+k_tokens")))] | length' model_prices_and_context_window.json
```

## Required behavior

### Leave reservation unchanged

Cache pricing does not change reservation. The provider confirms a cache read or a cache creation only after the request
finishes. The current reservation estimate remains the temporary hold.

Keep these parts unchanged:

- `GatewayReserveCommand`, `ReserveFundsRequest`, and `ReserveFundsCommand`
- The default reservation amount
- Explicit output-token estimates
- `limit_output` calculations
- Wallet and promotional-credit reservation behavior

Settlement releases an unused hold when a cache read makes the final cost lower. The existing overrun policy handles a
cache creation or any other provider variance that makes the final cost higher.

### Settle from reported cache usage

The gateway must send the normalized input-token breakdown with every successful settlement:

```text
input_tokens
cache_read_input_tokens
cache_creation_input_tokens
cache_creation_1h_input_tokens
output_tokens
```

`input_tokens` remains the provider's total normalized input-token count. The cache fields identify the portions billed at cache prices.

The normalized `input_tokens` value must include normal input, cache reads, and cache creation exactly once. When a
provider's raw `input_tokens` field contains only uncached input, the gateway adds the cache categories to produce the
normalized total. When the raw field already contains the grand total, the gateway keeps it unchanged.

Calculate normal input tokens as:

```text
normal_input_tokens = max(
    0,
    input_tokens
    - cache_read_input_tokens
    - cache_creation_input_tokens
    - cache_creation_1h_input_tokens
)
```

Calculate settled virtual spend as:

```text
virtual spend =
    normal input cost
    + cache-read input cost
    + default cache-creation cost
    + one-hour cache-creation cost
    + output cost
```

Use the sell-price rules for virtual spend and wallet charges. Use the provider-price rules for provider cost when the provider cost is missing.

The same virtual-spend calculation applies to wallet and BYOK requests. BYOK still leaves the provider charge outside the Zorveus wallet.

### Fall back predictably

If the provider omits the cache-token breakdown, price every input token at the normal input rate.

If the cache-token breakdown is invalid, do not fail the completed request. Treat the breakdown as unavailable, price
every input token at the normal input rate, and create a reconciliation signal.

A breakdown is invalid when:

- Any cache-token count is negative.
- The sum of cache-read and cache-creation tokens exceeds `input_tokens`.
- The response reports an explicit cache duration other than the supported default or one-hour duration.

Never treat a missing cache price as zero. For cache reads, fall back to the normal input price. For cache creation,
use the higher of the normal input price and any compatible creation price in the snapshot. If no compatible creation
price exists, use the normal input price and record that exact pricing was unavailable.

## Normalize provider usage in the gateway

Add one typed cache-usage extractor in `zorveus/root/zorveus_gateway/hooks.py`. Do not add separate settlement logic for each API endpoint.

The extractor must read these LiteLLM-normalized shapes:

| Provider or API shape | Cache-read source | Cache-creation source |
| --- | --- | --- |
| OpenAI Chat Completions | `usage.prompt_tokens_details.cached_tokens` | Normalized cache-creation details when present |
| OpenAI Responses | `usage.input_tokens_details.cached_tokens` | Normalized cache-creation details when present |
| Anthropic Messages | `usage.cache_read_input_tokens` | `usage.cache_creation_input_tokens` and normalized duration details |
| LiteLLM normalized usage | `usage.prompt_tokens_details.cached_tokens` | `usage.prompt_tokens_details.cache_creation_token_details` |

Use public normalized fields first. Read LiteLLM compatibility fields only inside the gateway adapter.

Return one immutable value:

```python
@dataclass(frozen=True, slots=True)
class NormalizedTokenUsage:
    input_tokens: int | None
    cache_read_input_tokens: int
    cache_creation_input_tokens: int
    cache_creation_1h_input_tokens: int
    output_tokens: int | None
    cache_usage_breakdown_status: CacheUsageBreakdownStatus
```

Use `CacheUsageBreakdownStatus` values `reported`, `not_reported`, and `invalid`. A generic
`cache_creation_input_tokens` value maps to the default cache duration. Keep `invalid` distinct from
`not_reported` so reconciliation can identify malformed provider data without rejecting a completed request.

When duration details are present, normalize them as follows:

```text
cache_creation_input_tokens = ephemeral_5m_input_tokens
cache_creation_1h_input_tokens = ephemeral_1h_input_tokens
```

The provider's generic cache-creation total is then a validation value, not another token category to add. It should
equal the sum of the duration details. When duration details are absent, put the generic total in
`cache_creation_input_tokens` and use zero for `cache_creation_1h_input_tokens`.

The reservation API service must not import LiteLLM. The gateway owns provider response normalization.

## Store cache usage on usage events

Add these non-null token-count columns to `usage_events` with a server default of zero:

```text
cache_read_input_tokens
cache_creation_input_tokens
cache_creation_1h_input_tokens
```

Add `cache_usage_breakdown_status` with a `not_reported` server default. Keep `input_tokens` and `output_tokens`
unchanged. Existing rows receive zero cache-token counts and a `not_reported` status.

Expose the new fields through:

- `UsageEventCreateData`
- `UsageEventData`
- Wallet settlement commands
- BYOK external-usage commands
- Settlement retry payloads
- Usage-event API responses
- Usage exports and administrative reconciliation responses

Do not create a second usage table for cache tokens.

## Store cache prices on immutable pricing snapshots

Do not add one database column for every key in the model catalog. The catalog already contains threshold,
cache-duration, service-tier, and token-type variants.

Add two typed JSON fields to each pricing snapshot:

```text
provider_cache_pricing
sell_cache_pricing
```

Each field contains normalized cache-price rules. Store monetary values as decimal strings.

Use these enums throughout the parser, schema, and price resolver:

```text
CacheOperation
  read
  create

CacheDuration
  default
  one_hour

CacheServiceTier
  standard
  flex
  priority

CacheTokenType
  text
  audio

CacheUsageBreakdownStatus
  reported
  not_reported
  invalid
```

Represent one price as:

```text
operation
duration
service_tier
token_type
applies_above_input_tokens
price_per_million_tokens
```

`duration` applies only to cache creation. `default` represents the provider's base cache-creation duration.
LiteLLM's five-minute cache-creation tokens map to `default`.

`applies_above_input_tokens` is null for the base price. A catalog key ending in `above_200k_tokens`, for example,
stores `200000` and applies only when total input tokens are greater than 200,000.

The price resolver selects a rule in this order:

1. Match the cache operation and token type.
2. Match the request's service tier.
3. Match the cache duration for cache creation.
4. Select the matching rule with the highest `applies_above_input_tokens` value that is strictly lower than the
   request's total input-token count. Use the base rule when no threshold rule applies.
5. Fall back to the normal input price when no rule matches.

The normalized rule format must represent these catalog variants without preserving their key names in settlement code:

- `cache_read_input_token_cost`
- `cache_creation_input_token_cost`
- `cache_creation_input_token_cost_above_1hr`
- Input thresholds such as 200,000, 272,000, and 512,000 tokens
- `flex` and `priority` service tiers
- Audio cache-read and cache-creation prices

Import audio cache rules so pricing snapshots do not lose catalog data. Select an audio rule only when normalized usage
identifies cached audio tokens separately. Until the gateway can provide that breakdown, use the existing normal input
fallback and record that exact pricing was unavailable. Do not infer that every cached token is an audio token merely
because the request contains audio.

### Service-tier selection

Normalize the request's pricing tier as `standard`, `flex`, or `priority` in the gateway. Carry it through the
settlement command, retry payloads, and usage events as `pricing_service_tier`. Do not add it to the reservation command.

At settlement, prefer the service tier reported by the provider. Otherwise, use the tier from the original request. If
neither value maps to a supported enum, do not apply a standard-tier cache discount. Price cache reads at the normal
input rate, price cache creation at the highest known compatible creation rate, and record a pricing fallback reason.

The catalog also has service-tier variants of normal input and output prices that are outside this cache-only change.
Provider-reported cost remains the authoritative provider cost for those requests. If it is absent, Zorveus calculates
the best available provider cost and emits a reconciliation signal instead of claiming that the fallback is exact.

Include both cache-pricing fields in `source_price_hash`. A cache-price change must create a new pricing snapshot.

## Catalog import

Extend `zorveus/services/pricing_catalog.py` to parse cache-price keys from `model_prices_and_context_window.json`.

The parser must:

1. Convert per-token prices to per-million-token decimal strings.
2. Map recognized key suffixes to enums and rule fields.
3. Reject duplicate normalized rules for one model.
4. Record unsupported cache-price keys in a validation error.
5. Include cache rules in the pricing snapshot hash.

Do not silently discard a cache-price key. A new upstream key must fail the catalog validation test until Zorveus maps
it or explicitly excludes it.

The sell cache price initially equals the provider cache price, matching the current normal input and output behavior.
A later pricing policy can add a cache-specific markup without changing historical snapshots.

## Settlement changes

Extend `GatewaySettleCommand` and `GatewayRecordExternalUsageCommand` with the normalized cache-token counts.
Also include `cache_usage_breakdown_status` and `pricing_service_tier` so retries use the original pricing facts.

Create one cache-aware price function in the API service. Both wallet settlement and BYOK external usage must call it.

The price function returns:

```text
normal_input_cost
cache_read_input_cost
cache_creation_input_cost
output_cost
total_cost
pricing_fallback_reason
```

Use a nullable `CachePricingFallbackReason` enum for `pricing_fallback_reason`. Include at least:

```text
invalid_token_breakdown
cache_read_price_missing
cache_creation_price_missing
cache_duration_unsupported
cached_audio_breakdown_unavailable
service_tier_unavailable
```

Do not use free-form reason strings. `not_reported` cache details are not an accounting error when no cache usage was
reported; the request simply uses normal input pricing.

Keep provider-reported cost as the preferred provider-cost value. When that value is absent, calculate provider cost
from the provider cache-price rules. Always calculate virtual spend from the immutable sell-price snapshot.

Keep `sell_cost` on the internal settlement request during the compatibility window. After this change,
`settle_reservation` does not treat the gateway's `sell_cost` as authoritative virtual spend. It calculates virtual
spend from the usage breakdown and the reservation's pricing snapshot. Zorveus can retain the reported value for
reconciliation, but it must not choose the final wallet debit.

This removes the current inconsistency where one path can inherit LiteLLM's cache-aware response cost while another
path recalculates every input token at the normal rate.

## API, SDK, and dashboard changes

Usage APIs must return the three cache-token counts, the breakdown status, the pricing service tier, and any pricing
fallback reason. Existing clients can ignore the new fields.

SDKs do not calculate cache prices. They expose the returned usage fields and preserve Zorveus error responses.

The dashboard usage detail view shows:

- Total input tokens
- Normal input tokens
- Cache-read input tokens
- Cache-creation input tokens
- Output tokens
- Cache savings when Zorveus has enough pricing data to calculate it

Calculate cache savings in the shared settlement calculator and store it on the usage event:

```text
cache savings =
    cost if cache-read tokens used the normal input price
    - actual cache-read cost
```

Do not calculate money in the frontend.

## Migration and compatibility

Use one additive migration:

1. Add the three cache-token columns to `usage_events` with zero defaults.
2. Add `cache_usage_breakdown_status`, `pricing_service_tier`, the nullable enum-backed pricing fallback reason, and `cache_savings`.
3. Add `provider_cache_pricing` and `sell_cache_pricing` to `pricing_snapshots` with empty-rule defaults.
4. Keep all existing price columns.
5. Do not rewrite historical usage costs.

Historical usage events keep zero cache-token counts because Zorveus cannot recover a trustworthy breakdown from total input tokens.

Old settlement retry payloads omit cache fields. Treat omitted fields as zero.

Existing pricing snapshots with no cache rules fall back to the normal input price.

## Implementation phases

### Phase 1: Pricing contracts and catalog import

- Add the cache-pricing enums and typed rule schemas.
- Add the pricing-snapshot JSON fields.
- Parse all recognized cache keys from the checked-in catalog.
- Include cache rules in `source_price_hash`.
- Add catalog validation that fails on an unknown cache-price key.

### Phase 2: Gateway usage normalization

- Add `NormalizedTokenUsage`.
- Extract cache-read and cache-creation counts from non-streaming responses.
- Extract the same counts from aggregated streaming usage.
- Send the normalized counts through wallet, BYOK, and retry commands.

### Phase 3: Cache-aware settlement

- Add usage-event cache-token columns and schemas.
- Add the shared cache-aware price calculation.
- Use it for wallet virtual spend and wallet charge calculation.
- Use it for BYOK virtual spend and provider-cost fallback.
- Record an enum-backed fallback reason when cache usage cannot be priced.

### Phase 4: Reporting and rollout

- Return cache usage and savings through usage APIs.
- Update the dashboard usage detail.
- Update SDK types and documentation.
- Add cache-pricing reconciliation metrics.
- Run real-provider smoke tests before enabling cache savings in the dashboard.

## Code change map

The references below name the current files and symbols. Symbol names are more stable than line numbers and make each
planned edit searchable.

| File | Current symbol | Planned change |
| --- | --- | --- |
| `model_prices_and_context_window.json` | Cache-price keys on model entries | Read the existing cache prices. Do not change the catalog file by hand. |
| `zorveus/services/pricing_catalog.py` | `pricing_catalog_snapshot_for_model`, `_cost_per_million_tokens`, `_source_price_hash` | Parse cache-price rules and include them in each snapshot hash. |
| `zorveus/schemas/reservation_schemas.py` | `PricingSnapshotData` | Add the typed provider and sell cache-price rule sets. |
| `zorveus/schemas/reservation_schemas.py` | `SettleReservationCommand`, `SettleReservationRequest` | Add normalized cache usage, breakdown status, and pricing service tier. |
| `zorveus/schemas/reservation_schemas.py` | `RecordExternalUsageCommand`, `RecordExternalUsageRequest` | Add the same settlement facts for BYOK usage. |
| `zorveus/schemas/reservation_schemas.py` | `UsageEventCreateData` | Carry the cache breakdown and pricing result into the immutable usage event. |
| `zorveus/database/orms/pricing_orm.py` | `PricingSnapshotORM` | Store immutable provider and sell cache-price rules as typed JSON. |
| `zorveus/database/orms/ledger_orm.py` | `UsageEventORM` | Store cache token counts, breakdown status, service tier, and fallback reason. |
| `zorveus/root/zorveus_gateway/hooks.py` | `_response_usage` | Replace the two-value dictionary with one typed normalized usage value. |
| `zorveus/root/zorveus_gateway/hooks.py` | `_finalize_successful_request` | Send cache usage with wallet settlement. |
| `zorveus/root/zorveus_gateway/hooks.py` | `_record_external_usage_if_needed` | Send cache usage with BYOK settlement. |
| `zorveus/root/zorveus_gateway/reservation_client.py` | `GatewaySettleCommand`, `GatewayRecordExternalUsageCommand` | Add cache settlement fields to internal API payloads and retries. |
| `zorveus/routers/internal_reservations_router.py` | `settle_reserved_funds`, `record_external_usage_event` | Map the new request fields into service commands. |
| `zorveus/services/reservation_service.py` | `settle_reservation`, `record_external_usage` | Calculate final wallet and BYOK virtual spend from actual cache usage. |
| `zorveus/services/reservation_service.py` | `_estimated_cost_from_tokens`, `_provider_cost_from_tokens` | Leave the reservation estimator unchanged. Add a separate cache-aware settlement calculator and share it between wallet and BYOK. |
| `zorveus/database/db_handlers/reservation_db_handler.py` | `_usage_event_orm`, `_usage_event_data` | Persist and reload the new usage-event fields. |
| `zorveus/database/db_handlers/usage_db_handler.py` | `_usage_event_data` | Return cache details through usage queries. |
| `zorveus/schemas/usage_schemas.py` | `UsageEventData`, `UsageEventResponse` | Expose cache usage, cache savings, and the fallback reason. |
| `zorveus/job_manager/outbox_worker.py` | `_retry_reservation_settlement`, `_retry_external_usage` | Verify that retry reconstruction preserves every cache field. Change the worker only if schema reconstruction needs it. |
| `zorveus/alembic/versions/` | New revision after `20260906_0038_allowance_debt_ledger.py` | Add the pricing-snapshot and usage-event columns. |

These reservation symbols are explicit non-targets:

- `GatewayReserveCommand` in `zorveus/root/zorveus_gateway/reservation_client.py`
- `ReserveFundsRequest` and `ReserveFundsCommand` in `zorveus/schemas/reservation_schemas.py`
- `reserve_funds` and the reservation calls to `_estimated_cost_from_tokens` in
  `zorveus/services/reservation_service.py`

## Test plan

### Catalog tests

- A model with no cache prices creates an empty cache-pricing rule set.
- A base cache-read price maps to a standard text read rule.
- Default and one-hour cache-creation prices remain separate.
- Threshold rules select the highest applicable threshold.
- Flex and priority prices do not affect standard requests.
- An unknown cache-price key fails validation.
- Cache-price changes produce a different `source_price_hash`.

### Gateway tests

- Chat Completions reads `prompt_tokens_details.cached_tokens`.
- Responses reads `input_tokens_details.cached_tokens`.
- Anthropic reads cache-read and cache-creation counts.
- A provider total that excludes cache tokens is converted to the normalized grand total.
- A provider total that already includes cache tokens is not increased again.
- Duration details replace the generic cache-creation total instead of being added to it.
- Streaming and non-streaming responses produce the same normalized counts.
- Missing details produce zero cache-token counts.
- Invalid details produce an unusable-breakdown result instead of an exception.
- Retry payloads preserve cache-token counts.

### Pricing tests

- Normal, cache-read, cache-creation, and output costs sum exactly.
- Cache-read tokens are not also charged at the normal input rate.
- Cache-creation tokens are not also charged at the normal input rate.
- A missing cache price falls back to the normal input price.
- One-hour creation tokens use the one-hour price.
- Threshold and service-tier rules select the expected price.
- A threshold price does not apply when the token count equals the `above` boundary.
- An unknown service tier never receives a standard-tier cache discount.
- Invalid token counts use full normal input pricing and record a fallback reason.
- A free model remains free.

### Accounting tests

- Wallet settlement releases the cache-read discount from the hold.
- Wallet settlement charges cache creation at the creation rate.
- BYOK virtual spend uses sell cache prices.
- BYOK provider-cost fallback uses provider cache prices.
- Product-user allowance consumes cache-aware virtual spend.
- `allow_overrun` records only the cache-aware uncovered amount.
- `carry_overrun_forward` creates debt only from the cache-aware uncovered amount.
- Idempotent settlement does not count cache tokens twice.

## Observability and reconciliation

Add these metrics:

```text
cache_read_input_tokens_total
cache_creation_input_tokens_total
cache_savings_amount_total
cache_pricing_fallback_total
cache_usage_breakdown_invalid_total
```

Tag the metrics by provider, model, billing mode, currency, and fallback reason. Do not use organization or product-user identifiers as metric labels.

Add reconciliation checks for:

- Cache-token subtotals greater than total input tokens.
- Usage events with cache tokens but no matching cache-price rule.
- Provider-reported cost that differs materially from calculated provider cost.
- Wallet and BYOK requests that calculate different virtual spend for the same token breakdown and pricing snapshot.

## Acceptance criteria

The work is complete when:

- Reservation amounts and output-limit decisions remain unchanged.
- Settlement prices cache-read and cache-creation tokens once.
- Wallet and BYOK use the same cache-aware virtual-spend calculation.
- Missing cache data falls back to normal input pricing.
- Every recognized cache-price catalog key maps to a typed rule.
- Usage events preserve the cache-token breakdown for retries and audits.
- Pricing snapshots preserve the cache prices used for historical settlement.
- Completed provider responses are not lost because cache metadata is missing or invalid.
- Unit, migration, streaming, retry, concurrency, and real-provider compatibility tests pass.
