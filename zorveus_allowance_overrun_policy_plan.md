# Allowance overrun policy implementation plan

## Purpose

This plan adds an app-connection setting that controls what happens when a model call can exceed its remaining virtual allowance.

The setting has three values:

```text
limit_output
allow_overrun
carry_overrun_forward
```

`limit_output` is the default. The selected policy affects virtual allowance only. It does not change provider billing, wallet billing, or BYOK platform fees.

## Product behavior

### Policy summary

| Policy | Current request | Excess virtual spend | Future allowance |
| --- | --- | --- | --- |
| `limit_output` | Reduce the provider output limit to the affordable amount | Record only unexpected provider variance as uncovered | No planned debt |
| `allow_overrun` | Let the request finish within its declared output limit | Record as uncovered virtual spend | Forgive the excess when new allowance becomes available |
| `carry_overrun_forward` | Let the request finish within its declared output limit | Record as uncovered virtual spend and allowance debt | Repay from later credits or base allowance when each becomes available |

All three policies require a finite provider output limit. If the client omits a limit, the gateway supplies a model-specific safe limit. This gateway-supplied limit bounds the provider request but does not become the client's estimated output usage.

When the client omits an output limit, `allow_overrun` and `carry_overrun_forward` reserve the smaller of the configured default amount and the estimated maximum cost of the bounded provider request. They reserve no more virtual allowance than is currently available. When the client supplies an output limit, Zorveus estimates the reservation from the input tokens and that explicit limit. `limit_output` always uses the effective provider limit to calculate the affordable output limit.

The request estimate and virtual allowance reservation are separate. Wallet-backed requests hold the request estimate. Virtual allowance reserves only the portion covered by remaining base allowance and available promotional credits.

### `limit_output`

For a text-generation request, Zorveus calculates the affordable output-token count:

```text
affordable output budget =
    remaining virtual allowance - estimated input cost - fixed request costs

affordable output tokens =
    floor(affordable output budget / output price per token)

applied output limit =
    min(client output limit, affordable output tokens, model output limit)
```

If the input and fixed costs consume the remaining allowance, Zorveus rejects the request before the provider call.

The gateway must preserve a client limit when it is lower than the calculated limit. When Zorveus lowers the limit, the provider can return its standard length finish reason.

Provider token counts can differ from local estimates. Settlement records any small remaining difference as uncovered virtual spend. The gateway must not discard a completed response.

### `allow_overrun`

The gateway sends the request with the client limit or the model-specific safe limit. Zorveus does not lower the output limit to match the remaining allowance.

Settlement consumes the remaining base allowance and currently available product-user credits. Zorveus records the rest as uncovered virtual spend.

The uncovered amount does not become debt. A later cap reset, cap increase, or credit grant provides its full new allowance. This policy intentionally forgives the overrun.

### `carry_overrun_forward`

The gateway handles the current request in the same way as `allow_overrun`. Settlement also creates an append-only allowance-debt entry for the uncovered amount.

Zorveus repays the oldest compatible debt when new allowance becomes available:

1. Apply a new product-user credit grant when Zorveus creates the grant.
2. Apply new base allowance when a cap period starts.
3. Keep any amount that the new allowance cannot repay for a later period or grant.

Credits already available at settlement are consumed before Zorveus creates debt. The system must not charge the same credit twice.

For a request without a product user, only later base allowance can repay the debt. A lifetime cap has no next period, so only a cap increase can add base allowance.

There is no separate carried-overrun limit. Debt is created only from the unexpected remainder of a completed request after current base allowance and credits have been used. The next request uses the normal allowance check, so outstanding debt cannot authorize additional spending.

### Example of carried debt

```text
Actual virtual spend:             $0.029272
Allowance available at settle:    $0.015743
Allowance debt created:           $0.013529

Later product-user credit grant:  $0.010000
Credit applied to debt:           $0.010000
Debt remaining:                   $0.003529

Next base cap:                    $0.020000
Base applied to debt:             $0.003529
Available base after repayment:   $0.016471
```

## Scope rules

The overrun policy applies only when all of these conditions are true:

- An applicable cap exists.
- The app connection's `credit_mode` requires enforcement for the request.
- The request can produce variable output or can otherwise exceed its estimate.

No cap means unlimited allowance, so the policy has no effect.

For `enforce_if_present`, the policy applies only when the request has a product user. For `enforce`, the policy applies both with and without a product user.

User OAuth connections use `credit_mode="enforce"`. Their overrun policy applies whenever the OAuth connection has a cap.

Debt belongs to the same cap, app connection, and optional product user as the reservation. Product-user debt must not reduce another product user's allowance. Usage without a product user must not create debt for a named product user.

## Data model

### App connections

Add `overrun_policy` to `app_connections`:

```text
type: string
allowed values:
  limit_output
  allow_overrun
  carry_overrun_forward
default: limit_output
nullable: false
```

Expose the field through `AppConnectionData`, create commands, list responses, detail responses, and update responses.

### Reservation snapshots

Store these immutable decision fields on each reservation:

```text
overrun_policy
allowance_available_at_reservation
requested_max_output_tokens
applied_max_output_tokens
estimated_input_tokens
```

The reservation snapshot preserves the decision after someone changes the app connection.

### Usage snapshots

Store these settlement fields on each usage event:

```text
overrun_policy
requested_max_output_tokens
applied_max_output_tokens
overrun_reason
```

Keep `uncovered_virtual_spend` as the only stored and API-reported numeric amount. Present that field as **Allowance overrun** in user interfaces. Do not add a duplicate `allowance_overrun` amount.

Use these `overrun_reason` values:

```text
none
allowed_by_policy
provider_variance
track_only
```

### Append-only allowance debt

Add an allowance-debt ledger instead of storing a mutable negative credit balance.

Use one append-only ledger. Do not add a mutable debt-account table. The outstanding debt for a cap is the sum of its signed ledger entries. Repayment transactions lock compatible ledger entries before calculating the repayment.

Each entry contains:

```text
debt_entry_id
org_id
app_id
app_connection_id
product_end_user_id
cap_rule_id
cap_target_type
usage_event_id
credit_grant_id
entry_type
amount
currency
idempotency_key
created_at
```

Use signed amounts and these entry types:

```text
overrun_created
credit_repayment
base_repayment
admin_adjustment
```

`overrun_created` adds debt. Repayment entries use negative amounts and reduce debt. Reconciliation calculates each balance from the ledger sum.

Add unique constraints that prevent duplicate debt for one usage event and duplicate repayment for one source operation.

## Reservation API changes

Extend the internal reservation request with:

```text
requested_max_output_tokens
estimated_input_tokens
```

Extend the reservation response with:

```text
overrun_policy
allowance_available
applied_max_output_tokens
output_limit_changed
```

For `limit_output`, the reservation service calculates the affordable limit from the active pricing snapshot. It returns the applied limit to the gateway before any provider call.

Reject the request when the affordable output-token count is below the minimum for the API or provider. Reuse the product-user allowance error when a product user is present. Return the standard cap-exceeded error when no product user is present. If a client supplies a limit below that minimum, return the output-limit-unavailable error instead of increasing the client's limit.

For embeddings, calculate the maximum input cost and reject a request that does not fit the allowance. For audio, image generation, and other requests without a reliable hard cost limit, reject the request under `limit_output` before provider dispatch.

Add a separate error when Zorveus cannot translate allowance into a hard provider limit for text generation models:

```text
HTTP 409
code: zorveus_allowance_output_limit_unavailable
```

This error covers missing pricing dimensions and text providers without a usable hard output limit.

## Gateway changes

### Before reservation

The gateway performs these steps:

1. Read the client's output-token field.
2. Resolve the model's maximum output limit.
3. Supply a model-specific safe limit when the client omitted one.
4. Estimate input tokens on the server with the provider-compatible tokenizer.
5. Keep the client limit separate from a gateway-supplied safety limit.
6. Send the client limit, effective provider limit, and input estimate to the reservation API.

The existing request parser already recognizes `max_tokens`, `max_completion_tokens`, and `max_output_tokens`. Extend the model adapter to identify the correct writable field for each API and provider. Never use client-supplied Zorveus metadata as an enforcement input.

### After reservation

For `limit_output`, write `applied_max_output_tokens` into the provider request before dispatch.

Do not increase a client-supplied limit. Do not mutate the request for the other two policies, except to add a safe limit when none exists.

Record the requested and applied values in gateway metadata so settlement and durable retries use the same decision.

### Streaming

Apply the output limit before opening the provider stream. Settle the actual usage after the stream closes.

If the client disconnects, preserve the existing durable settlement path. The overrun policy must not cause a second provider request.

## Debt repayment

### Repay from new product-user credits

When Zorveus creates a credit grant for a product user:

1. Lock outstanding debt and the new grant.
2. Apply the grant to the oldest compatible debt.
3. Append `credit_repayment` entries.
4. Append an `allowance_debt_repayment` entry to the existing product-user credit ledger for the consumed amount.
5. Leave only the unused grant amount available for future inference.

Match debt by organization, app, product user, currency, cap, and app connection. Repay the oldest compatible debt first.

### Repay from a new cap period

At the first reservation or usage calculation in a new period:

1. Lock the cap rule and its outstanding debt.
2. Apply the new period's base allowance to the oldest debt.
3. Append one idempotent `base_repayment` entry for that cap period.
4. Use only the remaining base allowance for the new request.

A scheduled job may materialize repayments earlier, but correctness must not depend on the job running.

### Change or remove a cap

Increasing a cap makes the added current-period base allowance available to repay debt. Decreasing a cap must not erase debt.

Removing a cap makes allowance unlimited. Keep historical debt entries for audit, but do not block inference while no cap exists.

Revoking an app connection preserves its debt history. A reactivated connection resumes the same debt unless an administrator records an adjustment.

## Wallet and BYOK behavior

Allowance overrun and wallet funding remain separate.

For wallet-funded usage, settlement debits the actual wallet charge. If the wallet cannot cover the amount above the reservation, keep the existing unfunded-wallet-liability behavior.

For BYOK usage, the provider bills the credential owner. `uncovered_virtual_spend` and allowance debt do not create a Zorveus wallet charge. An applicable BYOK platform fee still uses the organization wallet.

## Public app-connection API

Add `overrun_policy` to programmatic connection creation. Default it to `limit_output`.

Add a dashboard update route:

```text
PATCH /app-connections/{app_connection_id}/overrun-policy?org_id={org_id}

{
  "overrun_policy": "carry_overrun_forward"
}
```

Return the updated app connection. Write an audit event named `app_connection.overrun_policy.update` with the old and new values.

For user OAuth, show the setting during consent when the user selects a limited cap. Also allow the OAuth user and authorized organization managers to update it later.

Changing the setting affects only new reservations. It does not change held reservations, completed usage, or existing debt.

Product-user debt summaries are available to dashboard sessions and service keys with `product_users:read`:

```text
GET /product-users/{product_end_user_id}/allowance-debt?org_id={org_id}&currency=USD
GET /product-users/by-external-id/allowance-debt?app_id={app_id}&external_user_id={external_user_id}&currency=USD
```

Both routes return:

```json
{
  "outstanding_amount": "0.003529000000",
  "repaid_by_credits_total": "0.010000000000",
  "repaid_by_base_total": "0.000000000000",
  "currency": "USD",
  "oldest_debt_at": "2026-09-07T12:00:00Z"
}
```

## Frontend behavior

Add a setting named **When a request may exceed its allowance**.

Present these choices:

- **Limit response to available allowance**. Zorveus may shorten a text response. Zorveus rejects a request when it cannot enforce a hard cost limit.
- **Allow the overrun**. Zorveus lets the response finish and forgives the excess when new allowance becomes available.
- **Carry the overrun forward**. Zorveus deducts the excess from later credits or base allowance.

Require confirmation before enabling `carry_overrun_forward`. Explain that one completed request can exceed its estimate and that later allowance repays that remainder before it funds another request.

For usage rows, replace `uncovered` with **Allowance overrun**. Show the policy and reason in the detail panel.

For BYOK rows, state that the allowance overrun is not a Zorveus wallet charge. The provider can still bill the credential owner.

For carried debt, show:

```text
Outstanding allowance debt
Credits applied to debt
Base allowance applied to debt
Remaining allowance debt
```

## SDK behavior

SDKs do not calculate affordable tokens. The gateway owns that calculation so every client gets the same enforcement.

Expose applied-limit information through response headers or SDK response metadata:

```text
x-zorveus-overrun-policy
x-zorveus-requested-max-output-tokens
x-zorveus-applied-max-output-tokens
```

Document that `finish_reason="length"` can result from the connection's `limit_output` policy.

SDKs must preserve the existing allowance error codes. They should expose the new output-limit-unavailable error without replacing its structured fields.

## Concurrency and idempotency

The implementation must keep these guarantees:

- Concurrent reservations cannot spend the same remaining allowance.
- Concurrent credit grants cannot repay the same debt twice.
- A settlement retry cannot create a second debt entry.
- A period rollover cannot apply the same base allowance twice.
- Changing the app-connection policy cannot change an active reservation.
- Provider retries reuse the original applied token limit.

Lock rows in this order: the app connection, applicable cap rules, compatible allowance-debt entries, usable grants, and active reservations. Keep reservation, credit, debt, wallet, and usage mutations in one database transaction.

One usage event creates debt for the cap rule selected on its reservation. It must not create the same debt under multiple cap rules.

## Migration plan

1. Add the `overrun_policy` app-connection column with a `limit_output` default for new connections.
2. Backfill existing connections to `allow_overrun` to preserve current behavior.
3. Add the policy to pending OAuth authorization requests and authorization codes.
4. Add reservation and usage snapshot columns.
5. Create the append-only allowance-debt ledger and its indexes.
6. Add check constraints for policy and debt entry types.

The migration creates no debt for historical `uncovered_virtual_spend`. Historical uncovered values remain reporting data because the customer did not select carry-forward behavior when those events occurred.

## Delivery phases

### Phase 1: Persist and expose the policy — implemented

- Add the enum and database column.
- Update app-connection create, list, detail, and update APIs.
- Add audit logging.
- Add dashboard and OAuth consent controls.
- Label the setting as configured, not effective, until the runtime supports the selected policy.

### Phase 2: Limit output — implemented; rollout validation pending

- Add token inputs and outputs to the reservation contract.
- Calculate affordable output tokens.
- Apply limits across Chat Completions, Responses, and supported provider request formats.
- Add streaming and durable-retry coverage.
- Enable `limit_output` after provider compatibility tests pass.

The reservation and gateway implementation is complete. Unit and regression tests cover Chat Completions, Responses, streaming, retry reuse, unsupported request types, client-limit preservation, and allowance calculations. Keep the rollout gate closed until provider compatibility smoke tests pass in the deployment environment.

### Phase 3: Allow and report overruns — backend implemented

- Snapshot the policy on reservations and usage.
- Classify allowance overruns by reason.
- Update usage APIs and UI labels.
- Verify wallet and BYOK accounting remain separate.

The backend reuses `uncovered_virtual_spend` as the single monetary source of truth. Usage events now snapshot the policy, requested and applied output limits, and an enum-backed overrun reason. The dashboard application still needs to consume these fields and replace its **uncovered** label with **Allowance overrun**.

### Phase 4: Carry debt forward — backend implemented

- Add the allowance-debt ledger.
- Repay debt from new credits.
- Repay remaining debt at cap rollover.
- Add debt summaries and administrative reconciliation.
- Enable `carry_overrun_forward` after concurrency tests pass.

The backend creates one idempotent debt entry from the unexpected uncovered remainder of a completed request. New product-user grants repay compatible debt before their remaining balance becomes available. New cap-period allowance repays compatible debt before it funds a request. App-connection debt remains isolated by product user when the request includes one. Dashboard debt presentation, administrative reconciliation, and deployment concurrency validation remain rollout work.

## Test plan

### Reservation tests

- An omitted client output limit never reserves more than the configured default amount.
- A cheap bounded request reserves less than the configured default amount.
- A request may reserve the final positive allowance when that allowance is below the default amount.
- A gateway-supplied safety limit does not become estimated client output usage.
- An explicit client output limit uses token-based reservation pricing after applying the model limit.
- `limit_output` keeps a lower client limit.
- `limit_output` lowers an unaffordable client limit.
- `limit_output` rejects when input cost uses all allowance.
- No-cap requests remain unlimited.
- App-connection policy changes do not alter held reservations.
- User OAuth limited-cap requests use the configured policy.

### Settlement tests

- Provider variance records uncovered spend without dropping the response.
- `allow_overrun` creates no debt.
- `carry_overrun_forward` creates exactly one debt entry.
- Available credits settle before debt is created.
- BYOK overrun does not debit the Zorveus wallet.
- Wallet overrun preserves unfunded wallet liability accounting.

### Debt tests

- A later grant repays the oldest compatible debt first.
- A grant larger than the debt leaves the correct available balance.
- A grant smaller than the debt leaves the correct debt balance.
- A new period repays remaining debt once.
- Debt larger than one period leaves the unpaid remainder for a later period or credit grant.
- Product-user debt cannot affect another product user.
- No-product-user debt cannot affect a named product user.
- Settlement, grant, and rollover retries remain idempotent.
- Concurrent grants and reservations cannot double-spend allowance.

### Gateway tests

- Chat Completions uses `max_completion_tokens` or `max_tokens` as required by the model.
- Responses uses `max_output_tokens`.
- Streaming applies the limit before provider dispatch.
- A client disconnect still settles the same reservation.
- Provider fallback reuses the reserved limit.
- Client-supplied Zorveus metadata cannot lower the server's input estimate.
- Unsupported hard-limit text requests fail before provider dispatch under `limit_output`.
- Embedding requests under `limit_output` use their maximum input cost.
- Other requests without a reliable hard cost limit fail before provider dispatch under `limit_output`.

### API and UI tests

- App-connection responses expose `overrun_policy`.
- The update route enforces organization permissions.
- The update writes an audit event.
- The UI shows all three descriptions and confirmation copy.
- Usage rows say **Allowance overrun** instead of `uncovered`.
- BYOK details separate provider billing from Zorveus wallet billing.

## Observability and reconciliation

Add metrics for:

```text
reservations_output_limited_total
reservations_rejected_input_over_allowance_total
allowance_overrun_amount_total
allowance_debt_outstanding
allowance_debt_repaid_by_credits_total
allowance_debt_repaid_by_base_total
```

Tag metrics by policy, connection type, billing mode, model, and currency. Do not use product-user identifiers as metric labels.

Add reconciliation checks for:

- Usage events whose uncovered amount does not match their debt entry.
- Debt repayments without a matching grant or cap period.
- Negative outstanding debt.
- Applied output limits above either the client limit or the model limit.

## Acceptance criteria

The work is complete when:

- Every app connection stores one of the three policies.
- `limit_output` prevents planned allowance overruns for supported text models.
- `allow_overrun` records excess without creating debt.
- `carry_overrun_forward` repays excess from later credits and base allowance exactly once.
- The gateway never calls a text provider when strict limiting cannot be applied.
- Completed provider responses are never discarded because settlement exceeded an estimate.
- UI and SDK records explain the requested limit, applied limit, overrun amount, and repayment state.
- Wallet charges, BYOK provider charges, virtual allowance, and allowance debt remain separate.
- Full unit, integration, migration, concurrency, streaming, and retry tests pass.

## Confirmed decisions

1. **Whether `allow_overrun` forgives the overrun immediately or only at the next cap reset:**
   Forgiven immediately. Excess spend is recorded as `uncovered_virtual_spend`, but no debt is created. Newly available allowance (such as a credit grant or cap increase) immediately funds subsequent requests without retroactive deduction.

2. **Whether carried debt has a separate maximum:**
   No. Debt exists only because actual spend can exceed the estimate for one completed request. Current allowance is consumed first, and the normal allowance check prevents the next request when no spendable allowance remains.

3. **Whether organization developers can change a user OAuth connection's policy:**
   Both the authorizing OAuth user and authorized organization managers (owners and admins) can update the connection's overrun policy.

4. **Which model-specific output limit to inject when the client omits one:**
   The gateway reads a versioned safe limit from the model-capability catalog. The standard chat fallback is 4,096 tokens only when the catalog marks that fallback as compatible with the model.

5. **Which non-text request types support `limit_output` in the first release:**
   Embeddings use a maximum input-cost check. Audio, image generation, and other request types fail before provider dispatch when Zorveus cannot calculate and enforce a hard cost limit. Zorveus never changes `limit_output` to `allow_overrun` without the user's action.
