// Client message split: every page ships only the `tools.<slug>` namespaces its
// client components read (lib/i18n/client-messages.ts). This script finds, for
// each tool slug, every `tools.<other>` namespace referenced by the files reachable
// through imports from its route entry, components/tools/<slug>/ and
// components/docs/<slug>/, and
// writes the closure to data/client-message-deps.json (`namespaces`) with the
// education subtrees each page's code names (`education`); "*" stands for the
// other pages and layouts. Runs before dev and build.
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

// Education keys a file names ("education.intro.diagram.title", `tools.x.education.chart.${k}`):
// each named subtree is kept. A key called through a translator bound to another namespace
// (tNav("education") with useTranslations("tools.x.nav")) is not one, nor is a
// getTranslations() namespace (the server-rendered article itself). A runtime namespace
// (useTranslations(ns), `tools.x.${key}`) or useMessages() could reach any key, so it keeps
// the whole article.
const educationPathsIn = (raw) => {
  const source = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
  // An identifier typed as a union of tool roots ("tools.a" | "tools.b") reads keys by literal like any root.
  const typedRoot = (name) => new RegExp(`\\b${name}\\??:\\s*"tools\\.[a-z0-9-]+"(?:\\s*\\|\\s*"tools\\.[a-z0-9-]+")*\\s*[;,}]`).test(source);
  const runtimeNamespace = [...source.matchAll(/useTranslations\(\s*([A-Za-z_$][\w$.]*)\s*\)/g)].some((m) => !typedRoot(m[1]));
  if (runtimeNamespace || /useTranslations\(\s*`(?:tools\.(?:[a-z0-9-]+|\$\{[^}]+\})\.)?\$\{|useMessages\(/.test(source)) {
    return ["education"];
  }
  const bound = new Map(
    [...source.matchAll(/(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*["'`]([^"'`$]+)["'`]\s*\)/g)].map((m) => [m[1], m[2]]),
  );
  const paths = [];
  for (const m of source.matchAll(/(?:(\w+)(?:\.(?:raw|rich|markup|has))?\(\s*)?["'`](?:tools\.[a-z0-9-]+\.)?(education(?:\.[A-Za-z0-9_]+)*)/g)) {
    if (m[1] === "getTranslations" || /getTranslations\(\s*\{\s*namespace:\s*$/.test(source.slice(Math.max(0, m.index - 40), m.index))) continue;
    const ns = m[1] && bound.get(m[1]);
    if (ns && !/^tools\.[a-z0-9-]+$/.test(ns) && !/^tools\.[a-z0-9-]+\.education(\.|$)/.test(ns)) continue;
    paths.push(ns && ns.includes(".education") ? ns.replace(/^tools\.[a-z0-9-]+\./, "") : m[2]);
  }
  return paths;
};

const fileInfo = new Map();
const info = (file) => {
  if (!fileInfo.has(file)) {
    const source = readFileSync(file, "utf8");
    const imports = [...source.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)]
      .map((m) => resolveImport(file, m[1]))
      .filter(Boolean);
    const namespaces = [...source.matchAll(/["'`]tools\.([a-z0-9-]+)/g)].map((m) => m[1]).filter((s) => slugs.includes(s));
    const code = EXTENSIONS.some((e) => file.endsWith(e));
    fileInfo.set(file, { imports, namespaces, educationPaths: code ? educationPathsIn(source) : [] });
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

// The `education` article (~2/3 of every tool's messages) is rendered by server
// components. A page's client provider keeps only the education subtrees named by
// the files it reaches (a server file may hand a key to a client component);
// "education" alone keeps the whole article.
const clientEducationPaths = (roots) => {
  const seen = new Set();
  const queue = [...roots];
  const paths = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    info(file).educationPaths.forEach((p) => paths.add(p));
    queue.push(...info(file).imports);
  }
  // Drop paths inside another kept path.
  return [...paths].sort().filter((p, i, all) => !all.some((q) => q !== p && p.startsWith(`${q}.`)));
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
const clientEducation = { "*": clientEducationPaths(pageRoots) };
for (const slug of slugs) {
  const roots = [
    join(web, "components/tools/entries", `${slug}.tsx`),
    ...listFiles(join(web, "components/tools", slug)),
    ...listFiles(join(web, "components/docs", slug)),
  ].filter(existsSync);
  const namespaces = reachableNamespaces(roots);
  namespaces.delete(slug);
  deps[slug] = [slug, ...[...namespaces].sort()];
  clientEducation[slug] = clientEducationPaths(roots);
}

const json = `${JSON.stringify({ namespaces: deps, education: clientEducation }, null, 2)}\n`;
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
console.log(
  `client-message-deps: ${slugs.length} tools, ${extra.length} with cross-tool namespaces, ${Object.values(clientEducation).filter((p) => p.includes("education")).length} keep their whole education article`,
);
