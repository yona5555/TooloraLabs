// Route manifest: which indexable pages a change can affect, so PR runs of site-audit and perf-budget measure only
// those (CI job `affected`); main and the daily full run measure every page.
//   node scripts/route-manifest.mjs build <distDir> <out.json>
//     Every sitemap page (the build's own sitemap.xml, LOCALES default en,ar) -> a fingerprint: path -> content hash
//     of every file the page is made of: its prerendered .html + .rsc; every static chunk, stylesheet and font they
//     reference, followed through the chunks themselves (a lazy chunk named inside another chunk counts); the
//     public files (images) the page references; for a page rendered on request (no .html), its server bundle
//     (page.js + the server chunks of its .nft.json) and the fixture data it renders; and the gates (audit and
//     budget scripts, their tool versions). The build id is blanked: it changes on every build.
//   node scripts/route-manifest.mjs affected <base.json> <head.json> <out-pages.txt>
//     The pages whose fingerprint differs (a file added, removed or changed) or that are new; every page when
//     <base.json> does not exist (no manifest from main yet). A shared chunk that changes changes the fingerprint
//     of every page that loads it. Prints the count; writes one page path per line (the audits' PAGES file).
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16);

// Files whose change re-measures every page: the gates and the tool versions they run.
const GATE_FILES = ["apps/web/scripts/site-audit.mjs", "apps/web/scripts/perf-budget.mjs", "apps/web/scripts/perf-static.mjs", "tests/hydration-guard.mjs", "scripts/site-audit.sh", "scripts/perf-budget.sh", "scripts/perf-static.sh", "scripts/test-server.sh", "scripts/lib/require-base.mjs", "tests/fixtures/offline-fetch.mjs"];
const GATE_PACKAGES = ["playwright", "axe-core", "lighthouse", "chrome-launcher"];

function gatesHash(root) {
  const h = createHash("sha256");
  for (const f of GATE_FILES) h.update(`${f}\0${existsSync(join(root, f)) ? readFileSync(join(root, f)) : "missing"}\0`);
  const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8")).packages;
  for (const p of GATE_PACKAGES) h.update(`${p}@${lock[`node_modules/${p}`]?.version ?? lock[`apps/web/node_modules/${p}`]?.version}\0`);
  return h.digest("hex").slice(0, 16);
}

function dirHash(dir) {
  const h = createHash("sha256");
  const walk = (d) => {
    for (const e of readdirSync(d).sort()) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else h.update(`${relative(dir, p)}\0`).update(readFileSync(p)).update("\0");
    }
  };
  if (existsSync(dir)) walk(dir);
  return h.digest("hex").slice(0, 16);
}

export function buildManifest(dist, { root = ROOT, publicDir = join(root, "apps/web/public"), fixturesDir = join(root, "tests/fixtures/live"), locales = (process.env.LOCALES ?? "en,ar").split(",") } = {}) {
  const buildId = existsSync(join(dist, "BUILD_ID")) ? readFileSync(join(dist, "BUILD_ID"), "utf8").trim() : null;
  const read = (f) => {
    const b = readFileSync(f);
    return buildId ? Buffer.from(b.toString("latin1").replaceAll(buildId, "BUILD_ID"), "latin1") : b;
  };
  const cache = new Map(); // file -> { hash, refs }
  const fileInfo = (f) => {
    if (!cache.has(f)) {
      const b = read(f);
      const text = b.toString("latin1");
      const refs = new Set();
      for (const m of text.matchAll(/static\/(?:chunks|media|css)\/[\w.~\-]+/g)) refs.add(join(dist, m[0]));
      if (f.endsWith(".css")) for (const m of text.matchAll(/\.\.\/media\/([\w.~\-]+)/g)) refs.add(join(dist, "static/media", m[1]));
      for (const m of text.matchAll(/["'(]\/(?!_next\/)([\w.~\-/%]+\.(?:svg|png|webp|jpe?g|gif|ico|avif|woff2?))/g)) refs.add(join(publicDir, decodeURIComponent(m[1])));
      cache.set(f, { hash: sha(b), refs: [...refs].filter((r) => existsSync(r) && statSync(r).isFile()) });
    }
    return cache.get(f);
  };
  // every file reachable from the page's own files
  const closure = (start) => {
    const out = {};
    const queue = [...start];
    while (queue.length) {
      const f = queue.shift();
      const key = f.startsWith(dist) ? relative(dist, f) : `public/${relative(publicDir, f)}`;
      if (key in out) continue;
      const info = fileInfo(f);
      out[key] = info.hash;
      queue.push(...info.refs);
    }
    return out;
  };
  const appPaths = JSON.parse(readFileSync(join(dist, "server/app-paths-manifest.json"), "utf8"));
  const patterns = Object.entries(appPaths)
    .filter(([route]) => route.endsWith("/page"))
    .map(([route, file]) => ({ re: new RegExp(`^${route.slice(0, -"/page".length).replace(/\[\.\.\.\w+\]/g, ".+").replace(/\[\w+\]/g, "[^/]+")}$`), file, dynamic: (route.match(/\[/g) ?? []).length }))
    .sort((a, b) => a.dynamic - b.dynamic); // a static segment wins over a [param]
  const gates = gatesHash(root);
  const fixtures = dirHash(fixturesDir);

  const sitemap = readFileSync(join(dist, "server/app/sitemap.xml.body"), "utf8");
  const pages = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))].filter((p) => locales.includes(p.split("/")[1]));
  const routes = {};
  for (const page of pages) {
    const base = join(dist, "server/app", page === "/" ? "index" : page);
    const own = [`${base}.html`, `${base}.rsc`].filter(existsSync);
    const fp = own.length ? closure(own) : {};
    if (!existsSync(`${base}.html`)) {
      // rendered on request: its server bundle and the fixture data it renders
      const pattern = patterns.find((p) => p.re.test(page)) ?? null;
      if (!pattern) throw new Error(`route-manifest: ${page} has no prerendered HTML and matches no app route`);
      const pageJs = join(dist, "server", pattern.file);
      const traced = JSON.parse(readFileSync(`${pageJs}.nft.json`, "utf8")).files.map((f) => resolve(dirname(pageJs), f)).filter((f) => f.startsWith(dist) && existsSync(f));
      Object.assign(fp, closure([pageJs, ...traced]));
      fp["fixtures:tests/fixtures/live"] = fixtures;
    }
    fp["gates"] = gates;
    routes[page] = fp;
  }
  return { locales, routes };
}

export function affectedPages(base, head) {
  if (!base) return Object.keys(head.routes);
  return Object.entries(head.routes)
    .filter(([page, fp]) => {
      const old = base.routes[page];
      if (!old) return true;
      const keys = new Set([...Object.keys(old), ...Object.keys(fp)]);
      return [...keys].some((k) => old[k] !== fp[k]);
    })
    .map(([page]) => page);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, a, b, c] = process.argv.slice(2);
  if (cmd === "build") {
    const m = buildManifest(resolve(a));
    writeFileSync(b, JSON.stringify(m) + "\n");
    console.log(`route-manifest: ${Object.keys(m.routes).length} pages (${m.locales}) -> ${b}`);
  } else if (cmd === "affected") {
    const base = existsSync(a) ? JSON.parse(readFileSync(a, "utf8")) : null;
    const head = JSON.parse(readFileSync(b, "utf8"));
    const pages = affectedPages(base, head);
    writeFileSync(c, pages.map((p) => p + "\n").join(""));
    console.log(`route-manifest: ${pages.length} of ${Object.keys(head.routes).length} pages affected${base ? "" : " (no base manifest: every page)"} -> ${c}`);
  } else {
    console.error("usage: route-manifest.mjs build <distDir> <out.json> | affected <base.json> <head.json> <out-pages.txt>");
    process.exit(2);
  }
}
