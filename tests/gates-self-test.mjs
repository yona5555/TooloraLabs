// Gate canaries: every required or quality gate is run, as CI runs it, on a minimal deliberately broken fixture
// (tests/gates/) and must FAIL on it, naming the defect. A gate that passes its broken fixture fails this suite
// (CI job gates-self-test, required). Gate output is captured, never printed: a canary's expected ::error lines
// must not become annotations of the run (zero-warnings would read them).
//   npm run test:gates-self-test     needs: the fixture build (npm run build:desktop-lock; the desktop lock
//   canary starts its own server on 3109), PHONE_BASE=<a `next start` of the normal build> for the phone lock
//   canary, Playwright Chromium. Fixture servers use the dedicated ports 3111 (site) and 3112 (GitHub API mock).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BROKEN, CLEAN, PERF_BROKEN, PERF_CLEAN, startFixtureSite } from "./gates/fixture-site.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WEB = join(ROOT, "apps/web");
const FIX = join(ROOT, "tests/gates/fixtures");
const TMP = mkdtempSync(join(tmpdir(), "gates-"));
const SITE_PORT = 3111;
const API_PORT = 3112;
const quiet = (s) => s.replaceAll("::", ": :"); // shown only when a canary fails; never a workflow command

/** Runs a command with its output captured; the gate under test is the command itself, unchanged. */
function gate(cmd, args, { cwd = ROOT, env = {}, input } = {}) {
  const r = spawnSync(cmd, args, { cwd, env: { ...process.env, ...env }, input, encoding: "utf8", maxBuffer: 64 << 20 });
  return { status: r.status, out: quiet(`${r.stdout}\n${r.stderr}`) };
}
/** Same, asynchronously (a gate that talks to a fixture server running in this process). */
function gateAsync(cmd, args, { cwd = ROOT, env = {} } = {}) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { cwd, env: { ...process.env, ...env } });
    let out = "";
    c.stdout.on("data", (d) => (out += d));
    c.stderr.on("data", (d) => (out += d));
    c.on("close", (status) => resolve({ status, out: quiet(out) }));
  });
}
const failsWith = (r, re, what) => {
  assert.notEqual(r.status, 0, `${what}: the gate PASSED its broken fixture\n${r.out.slice(-3000)}`);
  assert.match(r.out, re, `${what}: the gate failed, but not on the fixture's defect\n${r.out.slice(-3000)}`);
};

let site;
before(async () => {
  site = await startFixtureSite(SITE_PORT).catch((e) => assert.fail(`port ${SITE_PORT} is not free for the fixture site (${e.code}); nothing was stopped`));
});
after(() => site?.close());

test("lint gate fails on an ESLint warning", () => {
  const r = gate("node", [join(ROOT, "scripts/run-no-warnings.mjs"), "npx", "eslint", "--max-warnings", "0", "--stdin", "--stdin-filename", "lib/gate-canary.ts"], { cwd: WEB, input: readFileSync(join(FIX, "lint-warning.ts"), "utf8") });
  failsWith(r, /'unused' is assigned a value but never used/, "lint gate");
});

test("warnings gate fails on a warning line in a passing command's output", () => {
  const r = gate("node", [join(ROOT, "scripts/run-no-warnings.mjs"), "node", "-e", `process.stdout.write(require("fs").readFileSync(${JSON.stringify(join(FIX, "warning-line.txt"))}, "utf8"))`]);
  failsWith(r, /1 warning or error line\(s\)/, "warnings gate");
});

test("zero-warnings fails on a warning annotation and on a failed job; passes a clean run", () => {
  const env = { PATH: `${join(FIX, "bin")}:${process.env.PATH}`, GH_TOKEN: "canary", GITHUB_REPOSITORY: "o/r", GITHUB_RUN_ID: "1", HEAD_SHA: "abc", SELF: "zero-warnings" };
  failsWith(gate("bash", ["scripts/zero-warnings.sh"], { env: { ...env, GH_MOCK: "annotation", NEEDS_JSON: '{"build":{"result":"success"}}' } }), /\[warning\] src\/x\.ts:3 canary/, "zero-warnings (annotation)");
  failsWith(gate("bash", ["scripts/zero-warnings.sh"], { env: { ...env, GH_MOCK: "clean", NEEDS_JSON: '{"build":{"result":"failure"}}' } }), /Jobs not successful: build: failure/, "zero-warnings (failed job)");
  assert.equal(gate("bash", ["scripts/zero-warnings.sh"], { env: { ...env, GH_MOCK: "clean", NEEDS_JSON: '{"build":{"result":"success"}}' } }).status, 0, "zero-warnings must pass a clean run");
});

test("system font rule fails on system font declarations", () => {
  failsWith(gate("node", ["scripts/system-fonts.mjs", join(FIX, "system-font.tsx")]), /4 system font declaration/, "system font rule");
});

test("workflow shell rule fails on a workflow without pipefail that pipes a gate", () => {
  const r = gate("node", ["scripts/workflow-shell.mjs", join(FIX, "workflow-no-pipefail.yml")]);
  failsWith(r, /no top-level defaults\.run\.shell: bash/, "workflow shell rule");
  assert.match(r.out, /a gate's output is piped/);
});

test("site audit fails on every broken page (overlap, SVG clip, HTML clip, <12px, hydration, console, contrast, link, idle animation loop) and passes the clean one", async () => {
  const out = join(TMP, "site-audit.json");
  const r = await gateAsync("node", ["scripts/site-audit.mjs"], { cwd: WEB, env: { BASE: `http://127.0.0.1:${SITE_PORT}`, LOCALES: "en", WIDTHS: "1440", THEMES: "light", JOBS: "2", OUT: out } });
  failsWith(r, /::error title=site-audit|error title=site-audit/, "site audit");
  const { findings } = JSON.parse(readFileSync(out, "utf8"));
  for (const [path, [criterion]] of Object.entries(BROKEN)) {
    const hit = findings.filter((f) => f.criterion === criterion && f.page === `/en${path}`);
    assert.ok(hit.length > 0, `site audit did not report ${criterion} on /en${path}: ${JSON.stringify(findings.filter((f) => f.page === `/en${path}`)).slice(0, 600)}`);
  }
  const clean = findings.filter((f) => f.page === `/en${CLEAN}`);
  assert.deepEqual(clean, [], "the clean control page must have no finding");
});

test("performance budgets fail on a page over each budget (LCP, TBT, CLS, Performance, JS) and pass the clean one", async () => {
  const out = join(TMP, "perf-budget.json");
  const r = await gateAsync("node", ["scripts/perf-budget.mjs"], { cwd: WEB, env: { BASE: `http://127.0.0.1:${SITE_PORT}/perf-canary`, LOCALES: "en", OUT: out } });
  failsWith(r, /error title=perf-budget/, "perf budget");
  const { pages } = JSON.parse(readFileSync(out, "utf8"));
  const at = (page) => pages.find((p) => p.page === page) ?? assert.fail(`perf budget did not measure ${page}`);
  for (const [page, [budgets]] of Object.entries(PERF_BROKEN))
    for (const k of budgets) assert.ok(at(page).over.includes(k), `perf budget did not report ${page} over ${k}: ${JSON.stringify(at(page).median)}`);
  assert.deepEqual(at(PERF_CLEAN).over, [], `the clean control page must be within every budget: ${JSON.stringify(at(PERF_CLEAN).median)}`);
});

// A minimal Next.js build: tools a and b load the shared chunk, c does not; a's chunk lazy-loads another chunk; the
// live page has no prerendered HTML (its server bundle counts). Every build gets a new build id, like next build.
function fakeBuild(dir, { lazyA = "lazy a v1", shared = "shared v1", liveSsr = "live v1" } = {}) {
  const id = `id-${Math.random().toString(36).slice(2)}`;
  const put = (f, body) => {
    mkdirSync(dirname(join(dir, f)), { recursive: true });
    writeFileSync(join(dir, f), body);
  };
  put("BUILD_ID", id);
  put("server/app-paths-manifest.json", JSON.stringify({ "/[locale]/tools/[slug]/page": "app/[locale]/tools/[slug]/page.js", "/[locale]/tools/a/page": "app/[locale]/tools/a/page.js" }));
  put("server/app/sitemap.xml.body", `<urlset>${["a", "b", "c", "live"].map((t) => `<loc>https://x.test/en/tools/${t}</loc>`).join("")}</urlset>`);
  const html = (chunks) => `<html><script>self.b="${id}"</script>${chunks.map((c) => `<script src="/_next/static/chunks/${c}"></script>`).join("")}</html>`;
  put("server/app/en/tools/a.html", html(["a1.js", "shared.js"]));
  put("server/app/en/tools/b.html", html(["b1.js", "shared.js"]));
  put("server/app/en/tools/c.html", html(["c1.js"]));
  for (const t of ["a", "b", "c"]) put(`server/app/en/tools/${t}.rsc`, `0:{"b":"${id}"}`);
  put("static/chunks/a1.js", `import("static/chunks/lazy-a.js")`);
  put("static/chunks/lazy-a.js", lazyA);
  put("static/chunks/b1.js", "b1");
  put("static/chunks/c1.js", "c1");
  put("static/chunks/shared.js", shared);
  put("server/app/[locale]/tools/[slug]/page.js", "page");
  put("server/app/[locale]/tools/[slug]/page.js.nft.json", JSON.stringify({ files: ["../../../../chunks/ssr/live.js"] }));
  put("server/chunks/ssr/live.js", liveSsr);
  return dir;
}

test("affected pages: an unchanged route is skipped, a tool change marks only its routes, a shared change marks every route using it", () => {
  const manifest = (name, opts) => {
    const out = join(TMP, `${name}.json`);
    const r = gate("node", ["scripts/route-manifest.mjs", "build", fakeBuild(join(TMP, `build-${name}`), opts), out], { env: { LOCALES: "en" } });
    assert.equal(r.status, 0, r.out);
    return out;
  };
  const affected = (base, head) => {
    const out = join(TMP, "pages.txt");
    const r = gate("node", ["scripts/route-manifest.mjs", "affected", base, head, out]);
    assert.equal(r.status, 0, r.out);
    return readFileSync(out, "utf8").split("\n").filter(Boolean).sort();
  };
  const main = manifest("main");
  assert.deepEqual(affected(main, manifest("same")), [], "a rebuild of the same code (new build id) must mark no route");
  assert.deepEqual(affected(main, manifest("tool", { lazyA: "lazy a v2" })), ["/en/tools/a"], "a change in tool a's lazy chunk must mark only tool a");
  assert.deepEqual(affected(main, manifest("shared", { shared: "shared v2" })), ["/en/tools/a", "/en/tools/b"], "a change in the shared chunk must mark every route that loads it, and only those");
  assert.deepEqual(affected(main, manifest("live", { liveSsr: "live v2" })), ["/en/tools/live"], "a change in a request-rendered page's server bundle must mark that page");
  assert.deepEqual(affected(join(TMP, "no-such-manifest.json"), main), ["/en/tools/a", "/en/tools/b", "/en/tools/c", "/en/tools/live"], "without a main manifest every route is affected");
});

test("share-images fails on a sitemap page without og:image", async () => {
  const r = await gateAsync("node", ["--test", "tests/share-images.test.mjs"], { env: { BASE: `http://127.0.0.1:${SITE_PORT}/share-canary` } });
  failsWith(r, /\/share-canary\/en\/no-image: no og:image/, "share-images");
});

// The locks compare against a copy of their committed baseline with one dimension and one color changed: the
// lock must fail and name exactly those two values (whatever else it reports).
function tamper(file, mutate) {
  const b = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
  const expected = mutate(b);
  const copy = join(TMP, file.split("/").pop());
  writeFileSync(copy, JSON.stringify(b));
  return { copy, expected };
}

test("desktop lock + color lock fail on a changed card dimension and a changed card color", () => {
  const { copy, expected } = tamper(`tests/baselines/desktop${process.platform === "linux" ? ".linux" : ""}.json`, (b) => {
    const v = b["/en/tools/bmi-calculator"];
    v.cards[0][3] += 40; // width
    const part = Object.keys(v.colors.cards[0])[0];
    v.colors.cards[0][part].light[0] = "rgb(1, 2, 3)";
    return [new RegExp(`/en/tools/bmi-calculator cards #0 .*: w ${"\\d"}.* \\(approved ${v.cards[0][3]}\\)`), /\/en\/tools\/bmi-calculator cards #0 .* light background-color: .* \(approved rgb\(1, 2, 3\)\)/];
  });
  const r = gate("node", ["tests/desktop-lock.mjs", "--only", "bmi-calculator", "--baseline", copy]);
  for (const re of expected) failsWith(r, re, "desktop lock");
});

test("phone lock + color lock fail on a changed header dimension and a changed header color", () => {
  assert.ok(process.env.PHONE_BASE, "PHONE_BASE (a `next start` of the normal build on a free port) is required: the phone lock canary cannot be skipped");
  const { copy, expected } = tamper(`tests/baselines/home-phone${process.platform === "linux" ? ".linux" : ""}.json`, (b) => {
    const h = b["en@390"].regions.header[0];
    h.h += 30;
    h.colors.light[0] = "rgb(1, 2, 3)";
    return [new RegExp(`en@390 header #0 <header>: h \\d.* \\(approved ${h.h}\\)`), /en@390 header #0 <header> light background-color: .* \(approved rgb\(1, 2, 3\)\)/];
  });
  const r = gate("node", ["tests/home-phone-regression.mjs", "--base", process.env.PHONE_BASE, "--baseline", copy]);
  for (const re of expected) failsWith(r, re, "phone lock");
});

test("main-health opens an issue for a failed run on main", async () => {
  const writes = [];
  const api = createServer((req, res) => {
    let body = "";
    req.on("data", (d) => (body += d));
    req.on("end", () => {
      const url = new URL(req.url, "http://x");
      const json = (status, data) => res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(data));
      if (req.method !== "GET") writes.push({ method: req.method, path: url.pathname, body: body && JSON.parse(body) });
      if (req.method === "GET" && /\/actions\/runs\/\d+\/jobs$/.test(url.pathname)) return json(200, { jobs: [{ id: 9, name: "build", conclusion: "failure" }] });
      if (req.method === "GET" && /\/annotations$/.test(url.pathname)) return json(200, []);
      if (req.method === "GET" && url.pathname.endsWith("/issues")) return json(200, []);
      if (req.method === "GET" && url.pathname.includes("/labels/")) return json(200, { name: "main-health" });
      if (req.method === "POST" && url.pathname.endsWith("/issues")) return json(201, { number: 1 });
      json(404, { message: `canary mock: ${req.method} ${url.pathname}` });
    });
  });
  await new Promise((resolve, reject) => api.once("error", () => reject(new Error(`port ${API_PORT} is not free for the GitHub API mock`))).listen(API_PORT, "127.0.0.1", resolve));
  try {
    const event = join(TMP, "event.json");
    writeFileSync(event, JSON.stringify({ workflow_run: { id: 5, run_number: 3, workflow_id: 7, name: "CI", head_branch: "main", head_sha: "abc", conclusion: "failure", html_url: "https://example.test/run/5" } }));
    const r = await gateAsync("node", ["scripts/main-health.mjs"], { env: { GITHUB_API_URL: `http://127.0.0.1:${API_PORT}`, GITHUB_EVENT_PATH: event, GITHUB_TOKEN: "canary", GITHUB_REPOSITORY: "o/r" } });
    assert.equal(r.status, 0, r.out);
    const opened = writes.find((w) => w.method === "POST" && w.path === "/repos/o/r/issues");
    assert.ok(opened, `main-health did not open an issue for a failed run: ${JSON.stringify(writes)}\n${r.out}`);
    assert.equal(opened.body.title, "main-health: CI");
    assert.match(opened.body.body, /Failing jobs: build \(failure\)/);
  } finally {
    api.close();
  }
});
