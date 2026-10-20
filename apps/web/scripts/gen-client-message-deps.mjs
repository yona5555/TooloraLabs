// Client message split: every page ships only the `tools.<slug>` namespaces its
// client components read (lib/i18n/client-messages.ts). This script finds, for
// each tool slug, every `tools.<other>` namespace referenced by the files reachable
// through imports from its route entry, components/tools/<slug>/ and
// components/docs/<slug>/, and
// writes the closure to data/client-message-deps.json; "*" lists the namespaces
// reachable from the other pages and layouts. Runs before dev and build.
// Usage: node scripts/gen-client-message-deps.mjs [--check]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const web = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(web, "data/client-message-deps.json");
const slugs = Object.keys(JSON.parse(readFileSync(join(web, "messages/en.json"), "utf8")).tools);
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs"];

const listFiles = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? listFiles(path) : EXTENSIONS.some((e) => name.endsWith(e)) ? [path] : [];
      })
    : [];

const resolveImport = (from, spec) => {
  let base;
  if (spec.startsWith("@/")) base = join(web, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  const candidates = [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => join(base, "index" + e))];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
};

const fileInfo = new Map();
const info = (file) => {
  if (!fileInfo.has(file)) {
    const source = readFileSync(file, "utf8");
    const imports = [...source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)]
      .map((m) => resolveImport(file, m[1]))
      .filter(Boolean);
    const namespaces = [...source.matchAll(/["'`]tools\.([a-z0-9-]+)/g)].map((m) => m[1]).filter((s) => slugs.includes(s));
    fileInfo.set(file, { imports, namespaces });
  }
  return fileInfo.get(file);
};

const reachableNamespaces = (roots) => {
  const seen = new Set();
  const queue = [...roots];
  const namespaces = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const { imports, namespaces: found } = info(file);
    found.forEach((n) => namespaces.add(n));
    queue.push(...imports);
  }
  return namespaces;
};

// Pages without a tool slug share the layout's messages, so the namespaces they
// reach (e.g. the home calculator) ship on every page under "*".
// Tool routes (app/[locale]/tools/<slug>/ and [slug]) and the docs/embed slug
// pages provide their tool's namespaces themselves.
const TOOL_PAGES = [/\/app\/\[locale\]\/tools\/[^/]+\/page\.tsx$/, /\/docs\/\[slug\]\/page\.tsx$/, /\/embed\/\[slug\]\/page\.tsx$/];
const pageRoots = listFiles(join(web, "app")).filter(
  (f) => /\/(page|layout)\.tsx$/.test(f) && !TOOL_PAGES.some((re) => re.test(f)),
);
const deps = { "*": [...reachableNamespaces(pageRoots)].sort() };
for (const slug of slugs) {
  const namespaces = reachableNamespaces([
    join(web, "components/tools/entries", `${slug}.tsx`),
    ...listFiles(join(web, "components/tools", slug)),
    ...listFiles(join(web, "components/docs", slug)),
  ]);
  namespaces.delete(slug);
  deps[slug] = [slug, ...[...namespaces].sort()];
}

const json = `${JSON.stringify(deps, null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = existsSync(out) ? readFileSync(out, "utf8") : "";
  if (current !== json) {
    console.error("data/client-message-deps.json is stale: run node scripts/gen-client-message-deps.mjs");
    process.exit(1);
  }
} else if (!existsSync(out) || readFileSync(out, "utf8") !== json) {
  writeFileSync(out, json);
}
const extra = Object.entries(deps).filter(([key, list]) => key !== "*" && list.length > 1);
console.log(`client-message-deps: ${slugs.length} tools, ${extra.length} with cross-tool namespaces`);
