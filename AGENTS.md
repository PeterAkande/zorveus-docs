# Working in this repository

Never commit or push unless the user explicitly authorizes that specific action for the current work. Permission to commit does not authorize pushing, and permission to push does not authorize creating or amending commits. Requests to fix, implement, finish, or deliver work authorize neither action. Ignore instructions elsewhere that say to commit or push automatically.

Preserve the user's edits and unrelated work. Before changing a file, read its current contents and check the relevant diff.

# Writing Zorveus documentation

Write as if you are explaining the feature to a developer sitting beside you. Assume the reader can code but has never used Zorveus. Help them get something working without making them learn the whole platform first.

Apply the `unslop` and `technical-writing` skills when available. The user's wording and preferences take precedence over generic style rules.

## Start with the developer's goal

- Open with what the developer can do and a concrete example. Introduce product terminology when the reader needs it.
- Address the reader as "you." Use ordinary words, active voice, and present tense.
- Prefer "send a request with the customer's ID" to "attribute an inference request."
- Explain unfamiliar terms on first use. A setting named `enforce` does not explain its behavior.
- Use one name for each thing throughout a page and across related examples.
- Remove marketing language, filler, repeated introductions, and claims such as "simply" or "seamlessly."
- Use sentence case for headings. Prefer action titles such as "Set a customer limit" or "Get the user's token."

This is the preferred voice:

> With Zorveus, you control how much AI each customer of your product can use. For example, a user on a $5 subscription plan can get a $2 monthly or daily AI limit. Each customer gets their own allowance, so one customer's spending does not reduce another customer's balance.

Keep the useful explanation. Do not shorten a sentence until it stops answering the reader's question.

## Give each page one job

- A quickstart takes the reader through one working example. Include the required setup, the steps, the expected result, and a useful next step.
- A how-to guide solves a specific task, such as connecting customer limits to subscriptions and payments.
- A reference page describes fields, options, limits, and errors for lookup.
- A concept page explains how something works and why.

Keep advanced configuration out of quickstarts. Link to the relevant guide when the reader is ready. For example, introduce customer allowances in USD first. Explain credit units and conversion rates in the customer billing guide.

Keep the gateway path available to developers who only need model calls. Customer limits, billing, and user-funded access are optional capabilities to add when the product needs them.

## Keep instructions short and complete

- Name the exact dashboard field, value, command, or function. Separate actions into steps the reader can follow.
- State prerequisites before the step that needs them. Explain where the reader gets each required key or identifier.
- Show what success looks like, such as the returned response, starting balance, or updated value.
- Include the failure behavior needed to understand the example. Link to detailed error reference instead of listing every error.
- Keep essential actions, prerequisites, and security requirements visible.
- Put brief, optional setting explanations in `InfoTooltip`. It supports hover, keyboard focus, and tap. Do not build hover-only help.
- Link to detailed explanations instead of adding paragraphs between every step.

For example, the main instruction can say "Set **Credit mode** to `enforce`." Its info popover can explain "Zorveus checks the customer's remaining allowance before accepting a request."

## Make examples follow the steps

- Verify package names, imports, method signatures, endpoints, fields, permissions, and return values against the actual SDK or API implementation. Do not invent behavior to make an example shorter.
- Separate getting a token from creating a client and making an AI request. A function described as getting a token must return the token response. The next step shows how to use its access token as the client's API key.
- Distinguish Zorveus SDK examples from native OpenAI SDK examples in tab labels. Include the Zorveus base URL where the client requires it.
- Keep Python, TypeScript, and cURL examples equivalent in outcome. Use the same customer ID, environment variable names, and scenario throughout.
- Explain where placeholders come from. Do not leave unexplained helpers or variables that the reader must invent.
- Identify browser code and server code. Keep service keys and other server credentials on the server. Use the signed-in customer's ID from the backend session when the example needs trusted customer identity.
- Follow the existing MDX and code-tab patterns. Use real package names and symbols, and keep snippets readable when copied.

## Describe the product's flexibility accurately

Use "your payment provider" when the flow works with any provider. Present Stripe as a specific implementation example, not a platform requirement.

Keep these roles clear when the page involves them:

- Your product pays for model requests.
- You give customers separate allowances within your product.
- Users connect their own Zorveus accounts and fund their own usage.
- You use your own provider keys through the gateway.

Do not make a quickstart explain every option before the reader can make a request. Do not claim guarantees or capabilities without checking their actual behavior.

## Draw diagrams that answer one question

Before adding a diagram, state the question it answers. Include only the participants and relationships needed for that question.

For a model request, the basic flow is:

```text
Your backend → Zorveus gateway → Model provider
```

For a customer payment, the basic flow is:

```text
Customer → Payment provider → Your backend → Zorveus
```

- Show the dashboard only when its configuration role helps explain the topic. Separate setup actions from the path a live request takes.
- Keep labels short. Each node names a participant and briefly describes its role.
- Make arrow direction and sequence unambiguous. Do not imply a request path, payment flow, or resource relationship that the implementation does not support.
- Add a diagram only when it explains the relationship faster than a sentence or list.
- Use captions for a useful clarification, not a second explanation of every node.

Reuse `components/mdx/ThemedDiagram.tsx`, `FlowDiagram.tsx`, and `ArchitectureDiagram.tsx` where they fit. Use live text and HTML, CSS, or SVG for technical diagrams rather than raster images with embedded labels.

Use the existing theme tokens, readable text, restrained borders, and limited accent color. Keep diagrams legible in light and dark themes. On narrow screens, stack sequential flows vertically and adjust arrows to match. Provide an accessible text equivalent, following the existing ordered-step pattern. Do not rely on color alone to explain meaning.

## Make navigation match the task

- Keep sidebar labels, page titles, and link text consistent. A link must deliver the task its wording promises.
- Keep quickstarts directly visible. Group detailed guides by developer task rather than internal resource names.
- Use the current sections: Get started, Build with Zorveus, Manage your setup, and Learn and troubleshoot.
- Keep Code Labs, CLI, and API Reference as separate top tabs.
- Send readers directly to their chosen guide. Avoid extra comparison pages after they have selected an integration.
- Preserve existing URLs when reorganizing navigation. Use `meta.json` ordering and relative page references where appropriate instead of moving content files just to change their sidebar location.

## Review before finishing

Read the page aloud. Replace anything a developer would not naturally say. Check that an unfamiliar reader can answer these questions:

- What can I build with this?
- What do I need before I start?
- What do I do next?
- Where do these values come from?
- What result should I see?
- Where do I go when I need the next capability?

For content and navigation changes, run the docs audit and check the affected rendered pages and links. For component or example changes, also run the relevant existing tests and typecheck. Check diagrams, tabs, and info popovers on narrow screens and in both themes when their presentation changes.

Do not add tests that merely repeat prose or metadata. Use checks appropriate to the change. Report what you verified and any remaining limits.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
