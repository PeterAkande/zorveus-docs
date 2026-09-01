import fs from "node:fs";
import path from "node:path";

const schemaPath = process.argv[2];
if (!schemaPath) {
  throw new Error("Usage: node scripts/generate-api-reference.mjs <openapi.json>");
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const outputDirectory = path.resolve("content/docs/api-reference");
const methods = new Set(["get", "post", "put", "patch", "delete"]);
const privatePrefixes = ["/admin/", "/internal/", "/payments/webhooks/"];
const backtick = String.fromCharCode(96);

const pageConfig = {
  authentication: {
    title: "Authentication and current user API",
    description: "Account, email verification, password, session, CSRF, and current-user operations.",
  },
  organizations: {
    title: "Organizations API",
    description: "Organizations, members, invitations, onboarding, service keys, and outbound webhooks.",
  },
  apps: {
    title: "Apps and connections API",
    description: "Apps, app connections, inference keys, model policies, caps, and connection lifecycle operations.",
  },
  oauth: {
    title: "OAuth API",
    description: "Authorization Code with PKCE, consent decisions, token exchange, and revocation operations.",
  },
  "product-users": {
    title: "Product users and credits API",
    description: "Product-user lookup, upsert, status, usage, caps, credit balances, grants, and revocation operations.",
  },
  "provider-credentials": {
    title: "Provider credentials API",
    description: "Provider discovery, credential creation, routing priority, connection access, rotation, and deletion.",
  },
  wallet: {
    title: "Wallet and payments API",
    description: "Wallet balances, ledger entries, top-up checkout, purchase status, and promotion redemption.",
  },
  caps: {
    title: "Caps API",
    description: "Create, list, replace, and delete organization, member, connection, and product-user caps.",
  },
  usage: {
    title: "Usage and dashboard API",
    description: "Usage events, summaries, time series, dashboard views, and inference-key spend.",
  },
  models: {
    title: "Models and health API",
    description: "Routable model discovery and service health operations.",
  },
  notifications: {
    title: "Notification settings API",
    description: "Read and update the current dashboard user's notification preferences.",
  },
};

function pageFor(route) {
  if (route.startsWith("/notification-settings")) return "notifications";
  if (route.startsWith("/product-users")) return "product-users";
  if (route.startsWith("/provider-credentials")) return "provider-credentials";
  if (route.startsWith("/wallet")) return "wallet";
  if (route.startsWith("/caps")) return "caps";
  if (route.startsWith("/dashboard-api") || route.startsWith("/inference-keys")) return "usage";
  if (route.startsWith("/models") || route.startsWith("/health")) return "models";
  if (route.startsWith("/oauth")) return "oauth";
  if (route.startsWith("/auth") || route === "/me") return "authentication";
  if (route.startsWith("/orgs") || route.startsWith("/onboarding")) return "organizations";
  if (route.startsWith("/apps") || route.startsWith("/app-connections")) return "apps";
  throw new Error("No API reference page for " + route);
}

function authFor(route, method) {
  if (route.startsWith("/health")) return "none";
  if (route.startsWith("/inference-keys")) return "inference_key";
  if (route.startsWith("/product-users/by-external-id")) return "service_key";
  if (route.startsWith("/provider-credentials/org-programmatic")) return "service_key";
  if (route === "/oauth/authorize") return "none";
  if (route === "/oauth/token" || route === "/oauth/revoke") return "oauth_client";
  if (route.startsWith("/oauth/authorization-requests")) return "dashboard_session";
  const publicAuthRoutes = new Set([
    "POST /auth/signup",
    "POST /auth/login",
    "POST /auth/email/verify",
    "POST /auth/email/resend-code",
    "POST /auth/password/forgot",
    "POST /auth/password/reset",
  ]);
  if (publicAuthRoutes.has(method + " " + route)) return "none";
  return "dashboard_session";
}

function authDescription(auth) {
  if (auth === "service_key") {
    return "Send an organization service key in " + backtick + "Authorization: Bearer zrv_svc_..." + backtick + ".";
  }
  if (auth === "inference_key") {
    return "Send an inference key in " + backtick + "Authorization: Bearer zrv_..." + backtick + ".";
  }
  if (auth === "dashboard_session") {
    return "Use the HTTP-only dashboard session cookie. State-changing requests also require " + backtick + "X-CSRF-Token" + backtick + " and an allowed " + backtick + "Origin" + backtick + ".";
  }
  if (auth === "oauth_client") {
    return "Send the form fields required by the OAuth client contract. Confidential clients include their client secret; public clients omit it.";
  }
  return "This operation does not require an existing Zorveus credential.";
}

function sentenceCase(value) {
  const cleaned = value
    .replace(/\bUri\b/g, "URI")
    .replace(/\bId\b/g, "ID")
    .replace(/\bCsrf\b/g, "CSRF")
    .replace(/\bOauth\b/g, "OAuth")
    .replace(/\s+Route$/, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase().replace(/\b(api|csrf|oauth|uri|id)\b/gi, (word) => word.toUpperCase());
}

function resolve(value) {
  if (!value) return {};
  if (value.$ref) {
    const name = value.$ref.split("/").at(-1);
    return { ...schema.components.schemas[name], schemaName: name };
  }
  if (value.allOf?.length === 1) return resolve(value.allOf[0]);
  return value;
}

function schemaType(value) {
  const item = resolve(value);
  if (item.anyOf) {
    const types = item.anyOf
      .filter((entry) => entry.type !== "null")
      .map(schemaType);
    return [...new Set(types)].join(" or ") || "null";
  }
  if (item.type === "array") return "array<" + schemaType(item.items) + ">";
  if (item.type) return item.type;
  if (item.properties) return "object";
  if (item.schemaName) return item.schemaName;
  return "unknown";
}

function constraints(value) {
  const item = resolve(value);
  const parts = [];
  if (item.enum) parts.push("Allowed values: " + item.enum.map((entry) => backtick + entry + backtick).join(", ") + ".");
  if (item.default !== undefined) parts.push("Default: " + backtick + String(item.default) + backtick + ".");
  if (item.minimum !== undefined) parts.push("Minimum: " + backtick + item.minimum + backtick + ".");
  if (item.maximum !== undefined) parts.push("Maximum: " + backtick + item.maximum + backtick + ".");
  if (item.minLength !== undefined) parts.push("Minimum length: " + backtick + item.minLength + backtick + ".");
  if (item.maxLength !== undefined) parts.push("Maximum length: " + backtick + item.maxLength + backtick + ".");
  return parts.join(" ");
}

function fieldDescription(name, value, location) {
  const item = resolve(value);
  if (item.description) return [item.description.trim(), constraints(item)].filter(Boolean).join(" ");
  const readable = name.replaceAll("_", " ");
  const base = location === "path"
    ? "Identifies the " + readable + " in the request path."
    : location === "query"
      ? "Filters or selects the request by " + readable + "."
      : location === "response"
        ? "Returns the " + readable + " value."
        : "Sets the " + readable + " value.";
  return (base + " " + constraints(item)).trim();
}

function fieldsFromSchema(value) {
  const item = resolve(value);
  if (!item.properties) return [];
  const required = new Set(item.required || []);
  return Object.entries(item.properties).map(([name, property]) => ({
    name,
    value: property,
    required: required.has(name),
  }));
}

function parameterBlock(parameter) {
  const value = parameter.schema || {};
  const required = parameter.required ? " required" : "";
  const defaultValue = resolve(value).default;
  const defaultProp = defaultValue === undefined ? "" : " default=" + JSON.stringify(String(defaultValue));
  return [
    "<ParamField name=" + JSON.stringify(parameter.name) + " type=" + JSON.stringify(schemaType(value)) + required + defaultProp + ">",
    "  " + fieldDescription(parameter.name, value, parameter.in),
    "</ParamField>",
  ].join("\n");
}

function requestBlock(operation) {
  const body = operation.requestBody?.content?.["application/json"]?.schema;
  if (!body) return "";
  const fields = fieldsFromSchema(body);
  const lines = ["### JSON body", ""];
  if (fields.length === 0) {
    lines.push("Request schema: " + backtick + (resolve(body).schemaName || schemaType(body)) + backtick + ".");
  } else {
    for (const field of fields) {
      lines.push(
        "<ParamField name=" + JSON.stringify(field.name) + " type=" + JSON.stringify(schemaType(field.value)) + (field.required ? " required" : "") + ">",
        "  " + fieldDescription(field.name, field.value, "body"),
        "</ParamField>",
        "",
      );
    }
  }
  return lines.join("\n").trim();
}

function responseBlock(operation) {
  const lines = ["### Responses", ""];
  for (const [status, response] of Object.entries(operation.responses || {})) {
    const responseSchema = response.content?.["application/json"]?.schema;
    lines.push("#### " + status + " " + (response.description || "Response"), "");
    if (!responseSchema) {
      lines.push("The response has no JSON body.", "");
      continue;
    }
    const fields = fieldsFromSchema(responseSchema);
    if (fields.length === 0) {
      lines.push("Response schema: " + backtick + (resolve(responseSchema).schemaName || schemaType(responseSchema)) + backtick + ".", "");
      continue;
    }
    for (const field of fields) {
      lines.push(
        "<ResponseField name=" + JSON.stringify(field.name) + " type=" + JSON.stringify(schemaType(field.value)) + (field.required ? " required" : "") + ">",
        "  " + fieldDescription(field.name, field.value, "response"),
        "</ResponseField>",
        "",
      );
    }
  }
  return lines.join("\n").trim();
}

const grouped = Object.fromEntries(Object.keys(pageConfig).map((name) => [name, []]));
for (const [route, pathItem] of Object.entries(schema.paths)) {
  if (privatePrefixes.some((prefix) => route.startsWith(prefix))) continue;
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method)) continue;
    grouped[pageFor(route)].push({ route, method: method.toUpperCase(), operation });
  }
}

for (const [page, operations] of Object.entries(grouped)) {
  operations.sort((left, right) => left.route.localeCompare(right.route) || left.method.localeCompare(right.method));
  const config = pageConfig[page];
  const lines = [
    "---",
    "title: " + config.title,
    "description: " + config.description,
    "---",
    "",
    "This reference mirrors the current public FastAPI schema. Dashboard operations use the browser session and CSRF contract. Programmatic operations state when they require an inference key or service key.",
    "",
  ];

  for (const { route, method, operation } of operations) {
    const auth = authFor(route, method);
    lines.push(
      "## " + sentenceCase(operation.summary || method + " " + route),
      "",
      "<ApiEndpoint method=" + JSON.stringify(method) + " path=" + JSON.stringify(route) + " auth=" + JSON.stringify(auth) + " />",
      "",
      authDescription(auth),
      "",
    );

    const parameters = operation.parameters || [];
    if (parameters.length > 0) {
      lines.push("### Parameters", "");
      for (const parameter of parameters) lines.push(parameterBlock(parameter), "");
    }

    const request = requestBlock(operation);
    if (request) lines.push(request, "");
    lines.push(responseBlock(operation), "", "---", "");
  }

  fs.writeFileSync(path.join(outputDirectory, page + ".mdx"), lines.join("\n").trim() + "\n");
}

console.log("Generated " + Object.values(grouped).reduce((total, entries) => total + entries.length, 0) + " public operations.");
