import fs from "node:fs";
import path from "node:path";

const root = path.resolve("content/docs");
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".mdx")) files.push(fullPath);
  }
}

walk(root);

const routes = new Set(
  files.map((file) => {
    const relative = path.relative(root, file).replaceAll(path.sep, "/").replace(/\.mdx$/, "");
    return relative === "index" ? "/" : `/${relative}`;
  }),
);

const errors = [];
const stalePatterns = [
  ["old service-key prefix", /zrv_(?:service|sk)_/g],
  ["old management prefix", /\/api\/v1\//g],
  ["old product-user prefix", /\/api\/v1\/product-users/g],
];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file);
  let inFence = false;

  for (const [index, line] of source.split("\n").entries()) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && /^# /.test(line)) {
      errors.push(`${relative}:${index + 1}: duplicate body H1`);
    }
  }

  for (const [label, pattern] of stalePatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) errors.push(`${relative}: ${label}`);
  }

  const linkPattern = /(?:href=|\]\()["']?(\/[A-Za-z0-9_./-]+)/g;
  for (const match of source.matchAll(linkPattern)) {
    const target = match[1].replace(/\/$/, "") || "/";
    if (target.startsWith("/v1/") || target.startsWith("/api/")) continue;
    if (!routes.has(target)) errors.push(`${relative}: missing internal route ${target}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Audited ${files.length} MDX files.`);
