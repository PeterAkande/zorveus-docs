import fs from "node:fs";
import path from "node:path";

const schemaPath = process.argv[2];
const outputPath = process.argv[3];
if (!schemaPath || !outputPath) {
  throw new Error("Usage: node scripts/generate-api-reference.mjs <openapi.json> <output-directory>");
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const outputDirectory = path.resolve(outputPath);
if (outputDirectory === path.resolve("content/docs/api-reference")) {
  throw new Error("Generate drafts in a separate directory, then review them against the curated reference.");
}
fs.mkdirSync(outputDirectory, { recursive: true });
const methods = new Set(["get", "post", "put", "patch", "delete"]);
const publicOperations = new Map([
  ["/models", new Set(["get"])],
  ["/inference-keys/usage", new Set(["get"])],
  ["/oauth/authorize", new Set(["get"])],
  ["/oauth/token", new Set(["post"])],
  ["/oauth/revoke", new Set(["post"])],
  ["/product-users/by-external-id", new Set(["get", "put"])],
  ["/product-users/by-external-id/credit-summary", new Set(["get"])],
  ["/product-users/by-external-id/allowance-debt", new Set(["get"])],
  ["/product-users/by-external-id/credit-grants", new Set(["get", "post"])],
  ["/product-users/by-external-id/credit-grants/by-reference", new Set(["get"])],
]);
const backtick = String.fromCharCode(96);

const pageConfig = {
  oauth: {
    title: "OAuth API",
    description: "Authorization, code exchange, and token revocation for application clients.",
  },
  "product-users": {
    title: "Product users and credits API",
    description: "Service-key profile, allowance, credit, and grant operations by external user ID.",
  },
  usage: {
    title: "Key usage API",
    description: "Inspect the selected inference key's connection cap and spend.",
  },
  models: {
    title: "Public model catalog API",
    description: "Inspect model capabilities and route status.",
  },
};

function pageFor(route) {
  if (route.startsWith("/product-users/")) return "product-users";
  if (route === "/inference-keys/usage") return "usage";
  if (route === "/models") return "models";
  if (route.startsWith("/oauth/")) return "oauth";
  throw new Error("No application reference page for " + route);
}

function authFor(route) {
  if (route.startsWith("/product-users/")) return "service_key";
  if (route === "/inference-keys/usage") return "api_key";
  if (route === "/oauth/token" || route === "/oauth/revoke") return "oauth_client";
  return "none";
}

function authDescription(auth) {
  if (auth === "service_key") {
    return "Send a server-side service key in " + backtick + "Authorization: Bearer zrv_svc_..." + backtick;
  }
  if (auth === "api_key") {
    return "Send an inference key in " + backtick + "Authorization: Bearer zrv_..." + backtick;
  }
  if (auth === "oauth_client") {
    return "Send form fields as described in [Token exchange](/oauth/token-exchange) or [Revocation](/oauth/revocation). Confidential clients include their client secret. Public clients omit it";
  }
  return "This operation does not require an application API credential";
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
  const content = operation.requestBody?.content;
  const isForm = Boolean(content?.["application/x-www-form-urlencoded"]);
  const body = (content?.["application/json"] || content?.["application/x-www-form-urlencoded"])?.schema;
  if (!body) return "";
  const fields = fieldsFromSchema(body);
  const lines = [isForm ? "### Form fields" : "### JSON body", ""];
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
  const allowedMethods = publicOperations.get(route);
  if (!allowedMethods) continue;
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method) || !allowedMethods.has(method)) continue;
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
    "This generated draft covers application integration endpoints. Review it alongside the curated guides. Configure apps, connections, caps, provider credentials, and webhooks in the dashboard",
    "",
  ];

  for (const { route, method, operation } of operations) {
    const auth = authFor(route);
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

console.log("Generated " + Object.values(grouped).reduce((total, entries) => total + entries.length, 0) + " integration operations.");
