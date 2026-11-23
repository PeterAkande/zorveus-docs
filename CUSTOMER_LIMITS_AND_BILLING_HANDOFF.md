# Customer limits and billing documentation handoff

This brief specifies the intended rewrite of the Customer limits and billing section. Use it with the repository's `AGENTS.md`. It includes the reader journey, proposed copy, example contracts, backend corrections, diagrams, and review criteria.

The user requested this handoff before implementation. Creating this file does not authorize rewriting the documentation, changing backend behavior, provisioning resources, committing, or pushing. When the user authorizes implementation, follow the scope below.

## 1. Intended result

A developer unfamiliar with Zorveus should be able to give each customer an AI allowance, send requests for that customer, and display their balance. Paid plans and purchased credits are optional extensions. The main guide is titled **Manage customer AI usage** and must work for a product with no subscriptions or payment integration.

Assume the reader can code. Explain Zorveus-specific terms when they become relevant. Get a useful result working before introducing pricing overrides, allowance debt, metadata precedence, or historical accounting details.

This is a documentation and presentation change. Preserve supported behavior, existing URLs, the separate Call AI models section, and the top navigation tabs.

### Writing standard

- Speak directly to the developer. Use "you," concrete examples, and familiar words.
- Prefer "send the customer's ID" to "attribute inference."
- Introduce "customer" first. Explain once that the API calls that customer a "product user."
- Call the recurring included amount the "plan allowance." Call additional grants "extra credits." Explain that the total remaining allowance can include both.
- Explain a connection as the settings used by a plan's inference key. Do not assume the reader already understands the resource hierarchy.
- Use short examples with an observable result. Follow the action with the field, output, or UI change the reader should see.
- Keep essential prerequisites, credential boundaries, error behavior, and ordering requirements visible. Put optional field explanations in the existing accessible `InfoTooltip`.
- Link to a page that owns an advanced topic instead of repeating that topic on several pages.
- Preserve useful detail. Put full response schemas and uncommon cases in reference material or an appropriately named disclosure.
- Apply `unslop` and `technical-writing`. Read the current Next.js guidance before changing code or MDX components.

## 2. Scope and navigation

Keep the folder label **Customer limits and billing**. Update `content/docs/startups/meta.json` to follow this order. Change frontmatter titles and update link text to agree with them.

| Order | Existing file under `content/docs/` | Proposed title | The page owns |
| --- | --- | --- | --- |
| 1 | `getting-started/integrate-your-product.mdx` | Manage customer AI usage | One allowance, customer requests, and balances, followed by optional paid plans and purchases. |
| 2 | `startups/configure-product-user-allowances.mdx` | Set customer limits | Amounts, periods, enforcement modes, and overrun policies. |
| 3 | `inference/product-user-metadata.mdx` | Track requests by customer | Trusted customer identity, optional profile data, and request activity labels. |
| 4 | `startups/check-allowance.mdx` | Show a customer's balance | Selecting the right plan policy, displaying the total, and handling missing values. |
| 5 | `startups/product-users.mdx` | Manage customer profiles | Explicit profile creation, lookup, and updates. |
| 6 | `startups/credit-grants.mdx` | Grant customer credits | Bonuses, purchases, grant lookup, retry behavior, and optional credit settings. |
| 7 | `startups/allowance-periods.mdx` | Set allowance reset dates | Calendar periods and subscription-aligned windows. |
| 8 | `startups/prorated-plan-changes.mdx` | Prorate plan upgrades | Supported allowance increases during an existing cycle. |
| 9 | `startups/product-user-activity.mdx` | Show customer activity | A customer-facing usage and credit history. |

Keep one sidebar entry for credit grants. Redirect `/startups/billing-integration` to `/startups/credit-grants#grant-credits-after-a-payment`. Use relative metadata references for the two pages outside `startups`. Do not move files just to reorder the sidebar. Preserve existing linked heading IDs with explicit anchors where headings change, or update every internal inbound anchor link. Check external compatibility before removing old anchors.

Supporting files may need small changes to keep links, titles, or explanations correct:

- `startups/service-keys.mdx`, `startups/routing-keys.mdx`, `platform/errors.mdx`, and `api-reference/product-users.mdx`.
- The MDX diagram components and their shared styles, if the diagram specifications require them.
- Existing component tests when their rendered behavior changes.

Do not broadly rewrite these supporting files or unrelated sections. Keep the user's introduction in `getting-started/product-user-quickstart.mdx`. That quickstart stays focused on USD allowances; advanced credit-unit material belongs in this section.

## 3. One example throughout the section

All values below are fictional product choices for documentation. They are not recommended prices, platform defaults, or authorization to configure a real app.

Start the main guide with `ZORVEUS_API_KEY` and one $2 monthly allowance for every customer. Each customer has a separate balance. No paid plan is required. Introduce the Starter and Pro examples below only in optional subscription material and the detailed plan guides. Do not make tier selection or a billing database a prerequisite for the basic example.

| Item | Example |
| --- | --- |
| App | One existing app, identified by `ZORVEUS_APP_ID`. |
| Customer | `customer_42`, replaced with the ID from the backend's authenticated session. |
| Basic inference key | `ZORVEUS_API_KEY`, used for the no-subscription example. |
| Starter subscription | Customer pays the product $5 per month; includes a $2 monthly AI allowance. |
| Pro subscription | Customer pays the product $20 per month; includes a $10 monthly AI allowance. |
| Starter inference key | `ZORVEUS_STARTER_KEY`. |
| Pro inference key | `ZORVEUS_PRO_KEY`. |
| Service key | `ZORVEUS_SERVICE_KEY`, with `product_users:read` for reads or `product_users:write` for grants and profile writes. Write permission includes reads. |
| Model | `ZORVEUS_MODEL`, set to a chat model the selected plan permits. For the first example, use a model allowed on both plans. |
| Extra purchase | Customer pays $5 for $3 of extra AI allowance. The entitlement comes from a trusted purchase record. |
| Payment reference | A stable namespaced transaction reference, such as `provider:payment_123`. |
| Optional display rate | 100 credit units per USD. The $2 Starter allowance displays as 200 credits. |
| Default customer charge multiplier | 1 for the basic examples. Introduce other values only in the optional pricing explanation. |

When introducing paid plans, explain the distinction between the $5 subscription price and the $2 allowance. Collecting a subscription payment does not require granting that full payment amount as extra credits. Keep this explanation out of the basic free-allowance setup.

Use the same customer ID across plan changes. A new plan key does not create a new customer identity or erase their existing usage.

### Example implementation rules

Use TypeScript with `@zorveus/sdk` for service operations and the native OpenAI SDK for the first model request. Provide equivalent Python examples using `zorveus` and `openai`. Add cURL when it helps explain the HTTP contract. Label each SDK clearly.

Required example inputs are trusted server values. The browser must not choose another customer's ID, the plan key, a grant amount, or a payment reference. Get the customer's subscription from the application's billing database.

Use environment variables for credentials. Explain where each variable comes from before using it. Keep plan keys and service keys on the server. Never print them or put them in public frontend environment variables.

Keep amounts and conversion rates as exact decimal strings. Do not use `parseFloat` or binary floating-point arithmetic for accounting. Use the returned allowance rather than reconstructing it from activity rows.

Show installation commands or link to the setup instructions before requiring packages. Every standalone snippet must include its imports and setup. If examples continue in one module, say so explicitly and define dependencies in earlier steps. Avoid invented database helpers presented as complete code.

For Python, distinguish sync and async handlers, use the corresponding SDK client, and describe client shutdown. Do not call a synchronous network client directly inside an async request handler.

## 4. Required corrections verified against the backend

These are behavior corrections, not optional editorial preferences. Recheck the current source before implementation because this brief reflects the local checkout reviewed on 22 November 2026. The backend and SDK tests were inspected, not executed during this review.

### A. The main balance check can reject a new customer

The current `runUserPrompt` example reads the customer with `upsertIfMissing: true`, omits the selected inference key, converts missing allowance to zero, and rejects the request.

The backend resolves allowance from a selected connection or the last applicable connection, with an active direct customer cap taking precedence. A new customer can have no resolved allowance until the read selects their plan policy or a model request establishes the connection.

Required change:

- Choose the plan on the backend first.
- Pass its inference key as `inferenceKey` in TypeScript or `inference_key` in Python when reading the balance for that plan.
- Use opt-in creation to display a balance before the first model request.
- Preserve a null allowance as an unavailable or unresolved state. Do not convert it to exhausted.
- Do not make a preflight balance read mandatory for every AI request. It is a snapshot for UI and application decisions. The gateway still decides whether the request can proceed.

### B. Not every HTTP 403 means allowance exhaustion

The current main example maps every 403 to `quota_exhausted`. A model-policy error, inactive key, or other forbidden operation must not become a prompt to buy credits.

Branch on the structured Zorveus error code as well as the status. Follow `platform/errors.mdx`: the gateway can wrap the underlying error under `error.provider_specific_fields.error`; do not assume the outer code always contains the Zorveus code.

Handle the confirmed allowance error separately, retain the documented legacy allowance code where required, and propagate or appropriately map unrelated failures. Treat organization funding failures separately from a customer's remaining allowance. Do not retry a confirmed policy or funding failure until its cause changes.

### C. Enforcement modes need precise descriptions

The settings page currently says `enforce` requires customer attribution. The backend enables enforcement in this mode even without a product-user ID. Attaching the customer ID is a separate requirement for the intended per-customer behavior.

The modes describe customer allowance behavior, not a promise that every request succeeds or bypasses all other authorization and funding checks.

Use these meanings, checking the current backend for any changes:

| Mode | Explain to the reader |
| --- | --- |
| `enforce` | Apply allowance enforcement. Send the customer's ID so the request uses that customer's allowance. Unattributed traffic still follows applicable key-level caps. |
| `enforce_if_present` | Enforce the customer allowance when a customer ID is present. Unattributed traffic bypasses this customer allowance enforcement path. |
| `track_only` | Record customer usage and allowance allocations without rejecting a request for customer allowance exhaustion. |
| `disabled` | Bypass customer allowance enforcement and grant consumption. Other access and funding requirements still apply. |

A plan without a cap does not become credits-only merely because grants exist. When no applicable cap is configured, customer virtual allowance is uncapped and the request does not consume product-user grants. Check for an active direct customer cap before describing a customer's allowance as uncapped. Make this visible on the settings and grants pages.

### D. `limit_output` has request-specific behavior

Avoid absolute promises that it always completes a response within the customer's budget. The backend estimates cost, can lower supported output-token limits, and can reject a request that does not fit. Some request types cannot be limited in that way. Certain unsupported combinations return an output-limit-unavailable error.

Suggested short explanation:

> Zorveus can lower the response length to fit the remaining allowance. If the request cannot fit or its output cannot be limited, Zorveus may reject it.

Describe `allow_overrun` and `carry_overrun_forward` as policies for handling eligible overruns, not instructions to admit every new request with no allowance. Explain carried debt separately from organization wallet debt. Preserve the backend's distinction between estimates, holds, final usage, and settlement.

### E. Grant retries require the same parameters

An `external_reference` identifies a grant within its organization and app. The backend locks and looks up that reference, compares a request fingerprint, and returns HTTP 409 for changed parameters. Customer, amount, currency, source, reason, metadata, expiry, and an explicitly supplied conversion rate can affect that comparison.

Suggested copy:

> Save one reference for each purchase. If delivery fails, retry with the same reference and the same grant details. Changing those details under the same reference returns a conflict.

Do not generate a new reference for each webhook delivery. Do not describe a timeout as proof that no credit was granted. Show reference lookup and recovery with the original request. An immediate 404 lookup can race an unfinished grant.

### F. The payment price is not automatically the grant amount

The current Stripe handlers derive the grant from `paymentIntent.amount / 100` and submit it using the default USD grant currency. That bakes in a payment-to-allowance mapping and currency assumption.

The provider-neutral example must derive the app, customer, allowance amount, grant currency, and stable transaction reference from verified server-owned purchase records. Check payment success, authenticity, currency, and the purchase being fulfilled. Client-supplied metadata alone is not authority for an entitlement.

For the shared example, a $5 purchase grants $3 of AI allowance. A subscription renewal normally renews the configured plan allowance; it must not also grant the entire subscription payment as extra credit unless the product explicitly sells that entitlement.

Zorveus grant creation does not collect payments, top up the organization wallet, or automatically implement the merchant's refund policy. Explain the separate responsibilities without adding a payment processor requirement.

### G. Use saved credit-unit quantities

The activity guide currently describes manual conversion before introducing `charged_credit_units`. Lead with the saved field for usage items. It reflects recorded allocations and avoids repricing old usage with a new app conversion rate.

Use:

- `allowance.available_allowance` for the total remaining monetary allowance.
- `allowance.remaining_credit_units` for the total remaining balance in configured display units.
- `credits.available_credits` for extra grants only, excluding base allowance.
- `charged_credit_units` on a usage activity item for the saved units consumed by that request.

Keep null distinct from zero. A null historical unit charge does not mean the request was free. Grant-specific rates can differ, and changing the app default must not lead the UI to recalculate historical usage.

### H. Plan reads and prorated upgrades have an ordering requirement

A read that selects an inference key records the selected connection as the customer's last connection. It is not a read-only preview of all possible subscription plans. Do not probe every plan by reading each key.

For prorated upgrades, apply the supported inference-time plan change before reading with the new key. A selected-key read does not itself apply `prorate_increase` and can establish the new last connection too early.

The first policy-bearing request establishes the initial plan. Preserve the same customer ID and subscription anchor on an upgrade. Confirm recurring periods and currencies match and that a direct customer cap does not override the plan. Do not invent prorated downgrades, a service-client proration method, or payment proration performed by Zorveus.

## 5. Page-by-page content specification

The proposed introductions below are the intended voice and meaning. Keep them unless implementation uncovers a factual correction. Do not replace them with generic summaries of what the reader will learn.

### 5.1 Manage customer AI usage

File: `content/docs/getting-started/integrate-your-product.mdx`.

Description:

> Give customers an AI allowance, track their requests, and show their remaining balance. Connect paid plans or purchases when you need them.

Opening:

> Control how much AI each customer can use in your product. Give them a free allowance, include AI in a paid plan, or let them buy extra credits. Zorveus tracks their usage and checks their remaining allowance on each request.

Follow with one free $2 allowance per customer using `ZORVEUS_API_KEY`. Link to the first API request for app, key, and funding setup. Introduce the service key when the reader reaches balance reads. Keep the runnable Write Room Code Lab as an optional subscription example near the end.

Use this order:

1. **Set a customer allowance.** Configure one key's connection for a $2 monthly allowance, `enforce`, and `limit_output`. Explain that this allowance can be free to the customer. Use short optional tooltips and link to Set customer limits.
2. **Send requests with the customer's ID.** Make one model call using `ZORVEUS_API_KEY` and the stable signed-in customer ID. Print the returned text. Do not require plan selection or a preflight balance gate.
3. **Show the remaining balance.** Read with that same inference key and opt-in user creation. Show `available_allowance` and `period_end`. The same read works before the first AI request. Explain missing values and refresh after usage.

Then add **When a request is rejected**, covering allowance exhaustion, organization funding, and model access as separate outcomes. Use a small error table and the structured error reference instead of a large error-handler module.

Follow with **Optional: connect paid plans or credit purchases**. Explain how the same allowance can be included in a subscription. Introduce backend plan-key selection only when customers need different allowances. Link to the purchased-credit helper and webhook guide. Use the verified $5 purchase granting $3 of allowance and require a stable reference. The main guide must not require the reader to implement payment fulfillment.

End with an optional **Show balances as credits** subsection. Use the exact copy below and equivalent SDK field access. Then add the optional pricing distinction and focused links to reset dates, upgrades, and activity.

> You can show 200 credits instead of $2. Set your app's conversion rate to 100 credits per dollar, then display `allowance.remaining_credit_units`. Zorveus returns the balance in those units, so your frontend does not need to calculate it.

Explain the manifest field `app.creditUnitsPerUsd`, link to its setup, and preserve decimal precision and null behavior. Keep this advanced material out of the introductory usage-limit quickstart.

For pricing, add a brief optional explanation:

> The customer charge multiplier controls how much allowance a request uses. The credit conversion rate controls how that balance is expressed in your UI. For example, a 2× multiplier turns a $0.01 reference charge into $0.02 of customer usage. At 100 credits per dollar, that usage is 2 credits.

Link the existing CLI manifest fields `productUserChargeMultiplier` and `creditUnitsPerUsd`. Explain app defaults and connection overrides. These examples use multiplier 1 unless explicitly stated. Do not call reference charges the upstream provider's invoice cost or imply that the multiplier collects customer payments.

### 5.2 Set customer limits

File: `content/docs/startups/configure-product-user-allowances.mdx`.

Opening:

> Give each customer an AI allowance for their plan. For example, a $2 monthly allowance gives every Starter customer their own $2 to use each month. Set the amount on the plan's connection and send the customer's ID with each request.

Start with one configuration the reader can apply, followed by the expected result. Explain the connection term at that point. Put the enforcement comparison and overrun comparison below the first configuration.

Use headings **Set the amount and period**, **Choose how to enforce the limit**, **Choose what happens near the limit**, and **Use different limits for different plans**. Retain accurate daily, monthly, and lifetime behavior where supported.

Explain direct customer caps as an optional override. Make uncapped behavior explicit. Use the corrected enforcement meanings from section 4. Keep overrun detail precise about request support and estimated cost.

Replace long credit-pack arithmetic and subscription-anchor examples with links to the pages that own them. Retain one short example showing that the plan allowance and extra credits can both contribute to the balance.

### 5.3 Track requests by customer

File: `content/docs/inference/product-user-metadata.mdx`.

Opening:

> Send the signed-in customer's ID with each AI request. Zorveus uses it to track their spending and apply their allowance. The first request creates their customer record automatically.

Lead with `X-Zorveus-External-User-ID` and a small equivalent TypeScript and Python request. Explain where the ID and configured client come from before the snippet. Keep ID values request-specific when clients are shared between customers.

Use headings **Send the customer's ID**, **Add optional profile details**, **Label customer activity**, and **Advanced metadata rules**. The activity example can label a chat reply with `activity_id: "reply_123"` and `activity_label: "Chat reply"`.

Preserve the distinction between persistent profile metadata and request-specific usage metadata. Keep app scoping, identifier precedence, size limits, header/body precedence, provider stripping, and trace identifiers available in the advanced part. Preserve existing inbound heading anchors, including `attach-business-context-to-usage-events`.

State that profile metadata does not authorize a subscription tier. Link to plan selection and the activity guide. Do not mix the user-funded OAuth workflow into the basic customer example.

### 5.4 Show a customer's balance

File: `content/docs/startups/check-allowance.mdx`.

Opening:

> Show customers how much AI allowance they have left and when it resets. Read the balance from your backend using a service key and the inference key for their current plan.

Start with the selected-key read and opt-in creation. This page owns the full explanation, so remove its duplicated block from Manage customer profiles and link here instead.

Use headings **Read the balance for the customer's plan**, **Display the amount and reset date**, **Show a balance before the first request**, and **Handle unavailable or exhausted balances**. Put routing aliases, helper fallbacks, direct-cap precedence, and uncapped behavior afterward as advanced detail.

Use the return fields from section 4G. Show a new Starter customer starting with $2, with no usage, holds, debt, or grants in this illustrative response. A small response excerpt is enough; do not fabricate a complete wire response.

Suggested explanation:

> A positive balance means the customer has allowance remaining. The next request can still be rejected if its estimated cost is too high or another limit applies. Let Zorveus check the request when you send it.

Clearly distinguish a missing customer, a null allowance, zero remaining allowance, and a blocked customer status. A positive amount does not override a blocked status. Explain that SDK amount helpers can fall back to grant credits or zero when allowance data is absent; their zero fallback is not a universal admission decision.

### 5.5 Manage customer profiles

File: `content/docs/startups/product-users.mdx`.

Opening:

> Keep customer details in Zorveus up to date, such as their name and account metadata. Use the same customer ID you send with their AI requests.

Use headings **Look up a customer**, **Create or update a customer**, and **Next steps**. Describe the required service-key permission beside each action. Keep a compact optional key control beside an actual runnable request if useful; do not lead with a large "Service Key Inserter" panel.

Show that reads return the profile directly, while create/update returns an envelope with `product_user` and `created`. Do not present service keys as a general management API for app setup, status changes, or revocation.

Lookup returns `email_hash`, not the original email, and does not return a created timestamp. A missing record returns HTTP 404 regardless of whether the customer has made an AI request. Profile updates replace name, email hash, and metadata, so explain that omitted profile fields are cleared and metadata is not merged. Use a complete profile from the app's trusted customer record in update examples.

Link to the balance, extra-credit, and activity guides instead of duplicating those full workflows. Preserve the `update-a-product-user` anchor used by service-client documentation.

### 5.6 Grant customer credits

File: `content/docs/startups/credit-grants.mdx`.

Opening:

> Give a customer extra AI allowance for a welcome bonus, a purchase, or a support adjustment. Use the same grant call in each case. For purchases, verify the payment on your backend first.

Keep the main path in this order:

1. **Grant 50 welcome credits.** Use equivalent TypeScript, Python, and cURL examples. Grant $0.50 at 100 credits per $1, with a stable welcome reference. Explain the service key, app ID, customer ID, write permission, and returned grant ID.
2. **Grant credits after a payment.** Keep this optional section on the same page. Show the payment flow diagram, signature verification, trusted purchase lookup, and the values that change in the shared grant call. Use the example $5 purchase of 300 credits backed by $3 of AI allowance.
3. **Retry without granting twice.** Reuse the original reference and details. Show grant lookup and explain changed details returning HTTP 409. A lookup failure does not prove the grant failed.
4. **Check the updated balance.** Link to the balance guide for the selected inference key. Distinguish this grant's remaining units from the customer's total allowance.

Keep expiry, conversion-rate details, deduction order, and carried debt in named disclosures below the main steps. Preserve `grant-with-a-service-client`, `check-an-existing-grant`, `choose-a-conversion-rate`, `understand-how-credits-are-used`, and `read-carried-allowance-debt` for existing links.

Keep the Stripe example expandable inside the payment section. Verify the signature using the raw body, then check the paid amount and currency against a purchase saved by the backend. Define the app-specific database lookup contract. Return success only after a grant succeeds or a retry confirms it. Check current official provider documentation when changing provider-specific code.

Keep grant-specific conversion rates, saved-rate behavior, exact decimals, and missing conversions in the optional content. Credits can repay carried debt before increasing spendable balance. Grant revocation remains a dashboard operation. A payment-provider refund does not automatically revoke a Zorveus grant, and a grant does not fund model execution.

### 5.7 Legacy payment guide URL

The payment guide is part of **Grant customer credits**. Do not restore a second sidebar entry or duplicate the grant examples. Preserve the old URL with a redirect and send internal payment links directly to the combined guide's payment section.

### 5.8 Set allowance reset dates

File: `content/docs/startups/allowance-periods.mdx`.

Opening:

> Reset each customer's allowance on their subscription date. If a customer subscribes on the 17th, their monthly AI allowance can run from the 17th to the 17th instead of resetting on the first day of the month.

Lead with **Send the subscription date with an AI request**, followed by **Update the date with an SDK or cURL** and **Use calendar or subscription periods**. Define "anchor" once as the saved timestamp that starts the customer's allowance cycle.

Lead with `X-Zorveus-Allowance-Starts-At` on the customer's inference request, alongside `X-Zorveus-External-User-ID`. Show equivalent Zorveus SDK, native OpenAI SDK, and cURL examples. The backend saves the date for allowance calculation, so a changed date can travel with the next AI request without a separate service call. Get the timestamp from trusted subscription data, not the browser or the current request time. Repeating the date is allowed, omission preserves it, and future or older-than-stored dates are rejected. Present the service-client update as a visible alternative immediately after the inference-header section, with TypeScript SDK, Python SDK, and cURL examples. Explain that it saves the date without waiting for an AI request and supports clearing it with explicit null. Do not hide this alternative in a disclosure. Include the complete customer profile in that update because omitted profile fields are cleared. After clearing, stop sending the header so later requests do not restore the date.

Retain UTC behavior, daily 24-hour windows, monthly short-month handling, app-scoped anchors, and lifetime behavior in a compact detail section. Add a short note that developers can read the renewal date from their subscription backend and check `allowance.period_end` in the Zorveus balance response when they need the allowance period end. Preserve the existing `set-the-anchor-with-a-service-client` and `show-the-next-reset-date` anchors.

### 5.9 Prorate plan upgrades

File: `content/docs/startups/prorated-plan-changes.mdx`.

Opening:

> Give customers the remaining portion of an allowance increase when they upgrade. For example, upgrading from $2 to $10 halfway through the cycle adds $4 to the current cycle's allowance. The full $10 applies at the next reset.

Show the arithmetic before the code. With $1 already used, the current effective allowance is $6 and the remaining amount is $5. Use a June 1 to July 1 UTC cycle and a June 16 upgrade for an exactly half-cycle example. These amounts assume no grants, holds, debt, or other adjustments.

Show `X-Zorveus-Allowance-Change-Policy: prorate_increase` as a default header for requests on the same plan and eligible allowance increases. Include TypeScript and Python client defaults and a cURL example. Keep the customer ID per request. Explain that the first request establishes the starting plan and repeated requests on the same plan leave the allowance unchanged. The gateway rejects lower or equal allowance transitions and incompatible plan settings when the policy is present. Explain the selected-key-read ordering from section 4H. Apply the upgrade on an AI request before reading the balance with the new key.

Explain the supported daily/monthly same-period, same-currency allowance increases, direct-cap restriction, initial-plan behavior, and full allowance at renewal. The application's payment provider still handles subscription pricing and payment proration. Preserve the complete response only in a disclosure; make the adjusted cap and remaining balance visible in the main example.

### 5.10 Show customer activity

File: `content/docs/startups/product-user-activity.mdx`.

Opening:

> Show customers their AI requests, credit purchases, and other credit changes in one history. Read the activity from your backend and display a label, amount, status, and date for each entry.

Put SDK examples before the full query-field table. Use a service key with read permission and the signed-in customer's ID. Include one first-page request and a Load more example using `has_more` and `next_cursor` with unchanged filters.

Show a small illustrative UI table before the full response details. Use `Chat reply` for usage and `Extra AI allowance` for the example grant reason. Clearly label currency amounts versus credit-unit quantities. A usage row's `amount` is signed monetary usage; its `charged_credit_units` is a positive saved quantity when known. Do not mechanically apply one sign rule to every activity type.

Use headings **Load customer activity**, **Display each entry**, **Load more results**, and **Understand the charge breakdown**. Lead with returned values; put historical fallbacks, per-grant allocations, cursor validation, and accounting detail below the basic UI mapping.

Keep null historical quantities unknown. Do not reconstruct historical units using today's app rate. Balance cards use the profile or summary endpoint, not a sum of the current activity page. Preserve the absence of page numbers, total counts, grouping, and running balances unless the backend contract has actually changed.

## 6. Canonical selected-plan balance example

These examples pin down the critical SDK calls. The implementing agent must still check the current SDK signatures and response types, add the documented lifecycle handling, and adapt them to the host application's sync or async architecture.

The function receives the signed-in customer's ID and the plan key already selected by trusted subscription logic. Both remain on the backend. It returns the profile; the next step reads its allowance fields.

```typescript
import { ZorveusServiceClient } from "@zorveus/sdk";

const service = new ZorveusServiceClient({
	apiKey: process.env.ZORVEUS_SERVICE_KEY!,
});

export async function readCustomerBalance(customerId: string, planKey: string) {
	return service.productUsers.getByExternalId({
		appId: process.env.ZORVEUS_APP_ID!,
		externalUserId: customerId,
		inferenceKey: planKey,
		upsertIfMissing: true,
	});
}
```

```python
import os
from zorveus import ZorveusServiceClient

service = ZorveusServiceClient(
	api_key=os.environ["ZORVEUS_SERVICE_KEY"],
)

def read_customer_balance(customer_id: str, plan_key: str):
	return service.product_users.get_by_external_id(
		app_id=os.environ["ZORVEUS_APP_ID"],
		external_user_id=customer_id,
		inference_key=plan_key,
		upsert_if_missing=True,
	)
```

For a routing key, include the selected plan alias using the verified SDK option. Do not add an alias to the direct-key introductory example. The service key remains the Authorization credential; the selected inference key is supplied separately as policy context. Do not swap their roles.

Read the returned profile's total and reset date without replacing missing values with zero. The full guide should show this as a separate, small step. Keep the raw decimal string intact until the product formats it for display.

## 7. Diagram specifications

Reuse `ThemedDiagram`, `ArchitectureDiagram`, and `FlowDiagram` where appropriate. Read their other call sites before changing a shared component. Add a narrowly scoped variant when the existing diagram serves a different explanation.

Use live HTML or SVG text, existing theme tokens, clear arrows, and an accessible ordered-text equivalent. Sequential flows must stack vertically on narrow screens. Do not use raster images containing labels. Keep configuration actions separate from runtime request paths.

### Main guide: one customer's model request

Question: How does Zorveus know whose allowance to use?

| Node | Title | Detail |
| --- | --- | --- |
| 1 | Your backend | Selects the plan key and sends the customer ID. |
| 2 | Zorveus gateway | Checks the customer's allowance. |
| 3 | AI model | Generates the response. |

Arrows go from backend to gateway to model and represent the accepted request path. Use the gateway accent only. Caption:

> Zorveus records usage against the customer. Read their balance again to update your UI.

The accessible description must mention that a request can be rejected before it reaches the model. Do not add a dashboard node, a payment-provider node, or a second service-key branch to this diagram.

### Payment guide: verified purchase to credits

Question: What happens after a customer buys extra allowance?

Use the existing four-node payment flow, with these details:

1. Customer: buys an allowance pack.
2. Payment provider: confirms payment to your backend.
3. Your backend: verifies the purchase and grants its allowance.
4. Zorveus: records the customer's extra credits.

Caption:

> Retry with the same purchase reference and grant details to avoid adding credits twice.

Do not imply the provider calls Zorveus directly, that every event grants credits, or that the customer payment automatically funds the organization's wallet.

### Reset dates: a monthly window

Question: When does this customer's allowance reset?

Show July 17 at 09:00 UTC to August 17 at 09:00 UTC. Label the first point **Cycle starts** and the second **Allowance resets**. State in text that usage belongs to this window. Keep timezone information visible. A short-month exception belongs in text beneath the timeline.

### Proration: an upgrade within one cycle

Question: How much extra allowance does a mid-cycle upgrade add?

Show June 1, June 16, and July 1, all at 00:00 UTC. Label the points **$2 plan allowance**, **Upgrade adds $4**, and **$10 allowance begins**. Explain underneath that the current cycle's effective allowance becomes $6, and $1 already used leaves $5. Do not draw $10 as the immediately available post-upgrade balance.

Do not add diagrams to profile lookup, balance field mapping, or grant-reference lookup unless a specific relationship remains unclear. A small code example or table is usually sufficient there.

## 8. Backend and SDK source map

Backend root: `/Users/peterakande/DevProjects/Backend/work/zorveus`.

Use function and symbol names to locate behavior; line numbers can move. Read schemas, handlers, and tests together. A route existing in the backend does not alone establish that it is supported for service-key integration. Check dependencies and permission requirements.

| Behavior | Files relative to the backend root |
| --- | --- |
| Service-key routes and scopes | `zorveus/routers/product_users_router.py`, especially selected-key reads, read/write dependencies, and dashboard-only operations. |
| Profile creation and selected plan | `zorveus/services/product_user_service.py`: `get_product_user_by_external_id_for_service_key`, `_selected_allowance_connection`, `_attach_product_user_allowance`. |
| Enforcement and output limits | `zorveus/services/reservation_service.py`: `_should_enforce_product_user_credits`, `_decide_output_limits_and_reservation_amount`, `create_debt_for_overrun`. |
| Base spend, holds, and debt | `zorveus/services/cap_service.py`; `zorveus/database/db_handlers/cap_db_handler.py`: `cap_spent_this_period`. |
| Grant replay and conflicts | `zorveus/services/product_user_credit_service.py`: `grant_product_user_credits_by_external_id`, `_credit_grant_fingerprint`, `_create_grant`. |
| Total allowance, unit conversion, and periods | `zorveus/services/utils/product_user_allowance.py`; `zorveus/services/utils/credit_units.py`. |
| Upgrade ordering and restrictions | `zorveus/services/allowance_proration_service.py`: `prorate_product_user_allowance`. |
| Customer charge multipliers | `zorveus/services/product_user_pricing/service.py`: `resolve_product_user_pricing`, `calculate_product_user_charge`. |
| Activity labels and saved quantities | `zorveus/services/product_user_activity_service.py`: `_activity_item`; corresponding schemas and database handler. |
| Error identities | `zorveus/root/http_errors.py`; gateway wrapper behavior; existing `platform/errors.mdx`. |

Useful backend tests under `tests/zorveus/` include `test_product_users_router.py`, `test_product_user_service.py`, `test_product_user_allowance.py`, `test_reservation_service.py`, `test_product_user_activity.py`, `test_product_user_pricing.py`, and `test_allowance_debt_service.py`.

Python SDK root: `/Users/peterakande/DevProjects/SDKs/zorveus-python`. Check `src/zorveus/_service_client.py`, `src/zorveus/resources/product_users.py`, `src/zorveus/types/product_users.py`, and the corresponding tests. Both `api_key` and `service_key` are accepted by the reviewed service-client constructor; use one spelling consistently in the rewritten examples.

TypeScript SDK root: `/Users/peterakande/DevProjects/SDKs/zorveus-ts`. Check `packages/sdk/src/resources/product-users.ts`, the product-user and activity types, and `packages/sdk/tests/product-users.test.ts`.

For manifest configuration, check `content/docs/cli/manifest.mdx` and `/Users/peterakande/DevProjects/SDKs/zorveus-cli`. Dashboard labels can be checked in `/Users/peterakande/DevProjects/Web/work/zorveus_frontend`.

These related repositories are evidence sources. Do not edit them as part of this docs task. If a required contract cannot be verified, report the exact uncertainty and avoid inventing the behavior.

## 9. Implementation order

1. Re-read this brief, `AGENTS.md`, the current affected files, and their diffs. Preserve intervening user work.
2. Recheck the required backend corrections and SDK options. Record any contract changes before drafting.
3. Rewrite the main guide, settings page, and balance page first. Ensure the same example works across all three.
4. Consolidate customer profile and metadata material. Update inbound anchors and link titles.
5. Rewrite grants and payment fulfillment. Then update reset dates, proration, and activity.
6. Apply the agreed titles and sidebar order without route changes. Implement only the diagrams that explain a useful relationship.
7. Verify the actual examples and rendered pages. Complete the acceptance checks below and give a concise handoff.

Do not ask the user to resolve details the repository or verified implementation can answer. A real product decision, such as changing a live pricing policy, is outside this documentation rewrite. Keep all example settings explicitly fictional.

## 10. Acceptance criteria

### Reader experience

- The main guide explains payment ownership and allowance ownership before introducing internal terms.
- The reader reaches a useful code example before a large parameter table or full backend module.
- Every page has one primary job and points to the next useful task.
- SDK examples have equivalent intent, consistent inputs, clear setup, and a visible expected result.
- Customer identity, plan selection, grant amounts, and credentials have explicit trusted origins.
- Credit units and customer pricing remain optional depth in the billing section.
- Important warnings are near the operation they affect, not hidden in hover help or buried at the end.

### Behavior verification

Verify relevant examples with mocked transports or another isolated local harness. Do not require real credentials, fund wallets, grant live credits, or change remote apps to test docs. Reuse existing tests where they cover the behavior. Add tests only for meaningful changed behavior, not literal prose, page titles, or duplicate metadata assertions.

Confirm these scenarios in the examples that implement them:

- A brand-new customer on the Starter key can resolve the $2 balance with opt-in creation before a model request.
- A plan-selected balance read sends the service key as Authorization and the inference key as separate policy context.
- A null allowance stays unavailable, a missing profile stays distinct from exhaustion, and an uncapped helper fallback is not treated as exhausted.
- A model request carries the correct stable customer ID and trusted plan key. A customer cannot choose another user's allowance.
- An allowance error produces allowance-specific UI guidance; a model-policy 403 does not become a buy-credits message.
- A verified $5 purchase can grant the configured $3 entitlement without assuming payment price equals allowance.
- Repeating a purchase reference with the same parameters adds no second grant; changing grant details produces the documented conflict.
- The balance UI uses the total allowance; the activity UI uses recorded unit charges when available and preserves unknown values.
- A prorated upgrade occurs before a selected-key balance read on the new plan and keeps the same customer and cycle.
- The dates, amounts, and expected response excerpts agree with the shared example and verified implementation.

### Repository and visual checks

- Run `npm run audit:docs` for content changes.
- Run `npm test` and `npm run typecheck` when components or code examples change. Use additional targeted example checks as needed.
- Check all affected rendered pages, code tabs, internal links, old heading anchors, and sidebar destinations.
- Verify navigation includes each intended page once and preserves its URL and the other top tabs.
- Check changed diagrams and interactive components in light and dark themes and at a narrow mobile width. Verify keyboard and touch access, readable labels, and no horizontal page overflow.
- Run `git diff --check`. Review generated `.source` changes and keep only necessary generated changes without discarding the user's existing work.
- State which checks ran, which were mocked, and any remaining uncertainty. Do not claim live payment or gateway success from a mock test.
- Do not commit or push without the user's explicit permission for that specific current action.

## 11. Definition of done

The implementation is ready when a developer can follow the main guide without a subscription system, set a customer allowance, see a correct starting balance, and make a request with the customer's ID. Paid plans and verified purchases must be clear optional extensions. The supporting pages must explain optional behavior without contradicting that journey or requiring the developer to reconstruct accounting logic.

Deliver the final change with the affected routes, key correctness fixes, validation performed, and any limits. Explain the resulting developer experience rather than recounting every editing step.
