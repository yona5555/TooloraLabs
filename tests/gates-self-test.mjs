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
import { BROKEN, CLEAN, DETERMINISM, PERF_BROKEN, PERF_CLEAN, STATIC_BROKEN, STATIC_CLEAN, startFixtureSite } from "./gates/fixture-site.mjs";

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
  assert.match(r.out, /\.nvmrc is outside this job's sparse checkout/);
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

test("site audit: two runs of a page with random content and a slow theme transition report identical findings", async () => {
  const audit = async (n) => {
    const out = join(TMP, `determinism-${n}.json`);
    await gateAsync("node", ["scripts/site-audit.mjs", DETERMINISM], { cwd: WEB, env: { BASE: `http://127.0.0.1:${SITE_PORT}`, LOCALES: "en", WIDTHS: "1440", OUT: out } });
    return JSON.parse(readFileSync(out, "utf8")).findings;
  };
  const first = await audit(1);
  assert.ok(first.some((f) => f.criterion === "small"), "the random rows must be measured");
  assert.ok(first.some((f) => f.detail?.text === "2030-01-16T12:00:00.000Z"), `the browser clock must be the fixed one, not one that moves with the build: ${JSON.stringify(first).slice(0, 600)}`);
  assert.ok(!first.some((f) => f.criterion === "a11y"), `the theme transition must be over before contrast is read: ${JSON.stringify(first).slice(0, 600)}`);
  assert.deepEqual(await audit(2), first);
});

test("deterministic budgets fail on a page over each budget, pass the clean one, and repeat exactly", async () => {
  const run = async (n) => {
    const out = join(TMP, `perf-static-${n}.json`);
    const r = await gateAsync("node", ["scripts/perf-static.mjs"], { cwd: WEB, env: { BASE: `http://127.0.0.1:${SITE_PORT}/static-canary`, LOCALES: "en", OUT: out } });
    return { r, pages: JSON.parse(readFileSync(out, "utf8")).pages };
  };
  const { r, pages } = await run(1);
  failsWith(r, /error title=perf-static/, "deterministic budgets");
  const at = (page) => pages.find((p) => p.page === page) ?? assert.fail(`not measured: ${page}`);
  for (const [page, [budget]] of Object.entries(STATIC_BROKEN)) assert.deepEqual(at(page).over, [budget], `${page}: ${JSON.stringify(at(page))}`);
  assert.deepEqual(at(STATIC_CLEAN).over, [], `the clean page must pass: ${JSON.stringify(at(STATIC_CLEAN))}`);
  assert.equal(at(STATIC_CLEAN).values.lcpInHtml, true);
  assert.deepEqual((await run(2)).pages, pages, "two runs must give identical values");
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

// scripts/ratchet.mjs: a required PR check on a ratcheted baseline file, not a hard zero-tolerance gate. Every
// scenario below writes its own run/baseline JSON to TMP; no server or build is involved.
function ratchet(args, env = {}) {
  return gate("node", ["scripts/ratchet.mjs", ...args], { env });
}
function writeJson(name, data) {
  const f = join(TMP, name);
  writeFileSync(f, JSON.stringify(data));
  return f;
}
function writeText(name, text) {
  const f = join(TMP, name);
  writeFileSync(f, text);
  return f;
}

test("site-audit ratchet: a count increase fails, a decrease passes, a new page with a finding fails", () => {
  const baseline = writeJson("ra-sa-baseline.json", { "/en/tools/a": { overlap: 0, clip: 0, small: 2, hydration: 0, console: 0, a11y: 0, link: 0, idle: 0 } });
  const measured = writeText("ra-sa-measured.txt", "/en/tools/a\n");

  const worse = writeJson("ra-sa-worse.json", { findings: Array(3).fill({ page: "/en/tools/a", criterion: "small" }), measured: ["/en/tools/a"] });
  failsWith(ratchet(["check", "site-audit", worse, baseline], { MEASURED: measured }), /\/en\/tools\/a: small 3 \(baseline 2\)/, "site-audit ratchet (increase)");

  const better = writeJson("ra-sa-better.json", { findings: [{ page: "/en/tools/a", criterion: "small" }], measured: ["/en/tools/a"] });
  assert.equal(ratchet(["check", "site-audit", better, baseline], { MEASURED: measured }).status, 0, "a decrease must pass");

  const newPage = writeJson("ra-sa-newpage.json", { findings: [{ page: "/en/tools/zzz-canary", criterion: "overlap" }], measured: ["/en/tools/zzz-canary"] });
  const newMeasured = writeText("ra-sa-newpage-measured.txt", "/en/tools/zzz-canary\n");
  failsWith(ratchet(["check", "site-audit", newPage, baseline], { MEASURED: newMeasured }), /\/en\/tools\/zzz-canary: new page \(no baseline\)/, "site-audit ratchet (new page)");
});

test("perf-budget ratchet: one more byte or request fails, an LCP element leaving the server HTML fails, equal or less passes", () => {
  const base = { jsBytes: 200000, cssBytes: 30000, blocking: 1, requests: 30, lcpInHtml: true };
  const baseline = writeJson("ra-pb-baseline.json", { "/en/tools/a": base });
  const measured = writeText("ra-pb-measured.txt", "/en/tools/a\n");
  const run = (name, values) => writeJson(name, { pages: [{ page: "/en/tools/a", values, over: [], error: null }] });
  for (const [k, v, re] of [["jsBytes", 200001, /jsBytes 200001 vs baseline 200000/], ["cssBytes", 30001, /cssBytes 30001 vs baseline 30000/], ["blocking", 2, /blocking 2 vs baseline 1/], ["requests", 31, /requests 31 vs baseline 30/], ["lcpInHtml", false, /lcpInHtml false vs baseline true/]])
    failsWith(ratchet(["check", "perf-budget", run(`ra-pb-${k}.json`, { ...base, [k]: v }), baseline], { MEASURED: measured }), re, `perf-budget ratchet (${k})`);
  failsWith(ratchet(["check", "perf-budget", run("ra-pb-stale.json", base), writeJson("ra-pb-stale-base.json", { "/en/tools/a": { lcp: 2000 } })], { MEASURED: measured }), /baseline entry has no jsBytes/, "perf-budget ratchet (old baseline format)");
  const same = ratchet(["check", "perf-budget", run("ra-pb-same.json", base), baseline], { MEASURED: measured });
  assert.equal(same.status, 0, same.out);
  const less = ratchet(["check", "perf-budget", run("ra-pb-less.json", { ...base, jsBytes: 190000 }), baseline], { MEASURED: measured });
  assert.equal(less.status, 0, less.out);
});

// Both ratchets compare the exact pages of a shard: results that cannot prove that are a failure, never a pass.
const CLEAN_COUNTS = { overlap: 0, clip: 0, small: 0, hydration: 0, console: 0, a11y: 0, link: 0, idle: 0 };
const VALUES = { jsBytes: 200000, cssBytes: 30000, blocking: 1, requests: 30, lcpInHtml: true };
const RATCHETS = {
  "site-audit": { baseline: { "/en/tools/a": CLEAN_COUNTS, "/en/tools/b": CLEAN_COUNTS }, run: (pages) => ({ findings: [], measured: pages }) },
  "perf-budget": { baseline: { "/en/tools/a": VALUES, "/en/tools/b": VALUES }, run: (pages) => ({ pages: pages.map((page) => ({ page, values: VALUES, over: [], error: null })) }) },
};
for (const [kind, { baseline, run }] of Object.entries(RATCHETS)) {
  const base = writeJson(`ps-${kind}-baseline.json`, baseline);
  const measured = writeText(`ps-${kind}-measured.txt`, "/en/tools/a\n/en/tools/b\n");
  const check = (file, env = { MEASURED: measured }) => ratchet(["check", kind, file, base], env);
  test(`${kind} ratchet: a missing results file fails`, () => {
    failsWith(check(join(TMP, `ps-${kind}-none.json`)), /results file .* is missing/, `${kind} ratchet (missing)`);
  });
  test(`${kind} ratchet: an unparsable results file fails`, () => {
    failsWith(check(writeText(`ps-${kind}-bad.json`, '{"findings": [')), /results file .* is unparsable/, `${kind} ratchet (unparsable)`);
    failsWith(check(writeJson(`ps-${kind}-shape.json`, { totals: {} })), /results file .* is unparsable/, `${kind} ratchet (no page list)`);
  });
  test(`${kind} ratchet: partial results fail, naming the unmeasured page`, () => {
    failsWith(check(writeJson(`ps-${kind}-partial.json`, run(["/en/tools/a"]))), /1 missing, 0 extra[\s\S]*missing: \/en\/tools\/b/, `${kind} ratchet (partial)`);
  });
  test(`${kind} ratchet: an unexpected extra page fails, naming it`, () => {
    failsWith(check(writeJson(`ps-${kind}-extra.json`, run(["/en/tools/a", "/en/tools/b", "/en/tools/c"]))), /0 missing, 1 extra[\s\S]*extra: \/en\/tools\/c/, `${kind} ratchet (extra)`);
  });
  test(`${kind} ratchet: no page list to compare with fails`, () => {
    failsWith(check(writeJson(`ps-${kind}-nolist.json`, run(["/en/tools/a", "/en/tools/b"])), { MEASURED: "" }), /no page list to compare with/, `${kind} ratchet (no MEASURED)`);
  });
  test(`${kind} ratchet: a correct shard with no regression passes`, () => {
    const r = check(writeJson(`ps-${kind}-ok.json`, run(["/en/tools/a", "/en/tools/b"])));
    assert.equal(r.status, 0, r.out);
  });
}

test("ratchet: a page with no baseline passes only with zero findings or within its full budget", () => {
  const measured = writeText("nb-measured.txt", "/en/tools/new\n");
  const empty = writeJson("nb-baseline.json", {});
  const clean = ratchet(["check", "site-audit", writeJson("nb-sa-clean.json", { findings: [], measured: ["/en/tools/new"] }), empty], { MEASURED: measured });
  assert.equal(clean.status, 0, clean.out);
  const within = ratchet(["check", "perf-budget", writeJson("nb-pb-ok.json", { pages: [{ page: "/en/tools/new", values: VALUES, over: [], error: null }] }), empty], { MEASURED: measured });
  assert.equal(within.status, 0, within.out);
  failsWith(ratchet(["check", "perf-budget", writeJson("nb-pb-over.json", { pages: [{ page: "/en/tools/new", values: VALUES, over: ["lcp"], error: null }] }), empty], { MEASURED: measured }), /new page \(no baseline\), over lcp/, "perf-budget ratchet (new page over budget)");
  failsWith(ratchet(["check", "perf-budget", writeJson("nb-pb-err.json", { pages: [{ page: "/en/tools/new", values: null, over: ["error"], error: "boom" }] }), empty], { MEASURED: measured }), /new page \(no baseline\), over error/, "perf-budget ratchet (new page not measured)");
});

test("shard page list: the same slice the gates take, without a second locale prefix", () => {
  const pages = writeText("sp-affected.txt", ["/en", "/ar", "/en/tools", "/ar/tools", "/en/docs", "/ar/docs"].join("\n") + "\n");
  const list = (kind, shard) => {
    const out = join(TMP, `sp-${kind}.txt`);
    const r = gate("node", ["scripts/expand-measured-pages.mjs", kind, pages, shard, out]);
    assert.equal(r.status, 0, r.out);
    return readFileSync(out, "utf8").split("\n").filter(Boolean);
  };
  assert.deepEqual(list("site-audit", "2/3"), ["/en/tools", "/ar/tools"], "site-audit shards locale-free paths");
  assert.deepEqual(list("perf-budget", "2/3"), ["/ar", "/en/docs"], "perf-budget shards locale-prefixed pages");
});

test("ratchet baseline check fails when a committed baseline value is raised", () => {
  const prev = writeJson("ra-base-prev.json", { "/en/tools/a": { overlap: 0, clip: 0, small: 2, hydration: 0, console: 0, a11y: 0, link: 0, idle: 0 } });
  const raised = writeJson("ra-base-raised.json", { "/en/tools/a": { overlap: 0, clip: 0, small: 5, hydration: 0, console: 0, a11y: 0, link: 0, idle: 0 } });
  failsWith(ratchet(["check-baseline", "site-audit", raised, prev]), /\/en\/tools\/a\.small: 2 -> 5/, "ratchet baseline check");
  const lowered = writeJson("ra-base-lowered.json", { "/en/tools/a": { overlap: 0, clip: 0, small: 0, hydration: 0, console: 0, a11y: 0, link: 0, idle: 0 } });
  assert.equal(ratchet(["check-baseline", "site-audit", lowered, prev]).status, 0, "lowering the baseline must pass");
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

test("cache policy fails on a PR run that saves a cache; passes this repository's workflows", () => {
  const r = gate("node", ["scripts/cache-policy.mjs", join(FIX, "workflow-pr-cache-save.yml")]);
  failsWith(r, /saves-on-pr step 1 .*a cache save without the guard/, "cache policy (save)");
  assert.match(r.out, /saves-on-pr step 2 .*actions\/cache saves from every ref/);
  assert.match(r.out, /saves-on-pr step 3 .*setup-node `cache` saves from every ref/);
  assert.match(r.out, /saves-on-pr step 4 .*package-manager-cache: false/);
  const ok = gate("node", ["scripts/cache-policy.mjs"]);
  assert.equal(ok.status, 0, ok.out);
});

test("a missing base manifest marks every page affected and says why; a valid one is used", () => {
  const env = { PATH: `${join(FIX, "bin")}:${process.env.PATH}`, GH_TOKEN: "canary", GITHUB_REPOSITORY: "o/r", GITHUB_STEP_SUMMARY: "" };
  const out = join(TMP, "base-manifest.json");
  const head = writeJson("bm-head.json", { locales: ["en"], routes: { "/en": { a: "1" }, "/en/tools": { a: "1" } } });
  const affected = () => {
    const pages = join(TMP, "bm-pages.txt");
    const r = gate("node", ["scripts/route-manifest.mjs", "affected", out, head, pages]);
    assert.equal(r.status, 0, r.out);
    return readFileSync(pages, "utf8").split("\n").filter(Boolean);
  };
  const fetchBase = (mock, zip) => gate("bash", ["scripts/base-route-manifest.sh", out], { env: { ...env, GH_MOCK: mock, GH_MOCK_ZIP: zip ?? "" } });
  const zipOf = (name, body) => {
    const dir = mkdtempSync(join(TMP, name));
    writeFileSync(join(dir, "route-manifest.json"), body);
    assert.equal(spawnSync("zip", ["-q", "m.zip", "route-manifest.json"], { cwd: dir }).status, 0, "zip must be installed");
    return join(dir, "m.zip");
  };
  for (const [mock, why, zip] of [["no-run", /main has no successful CI run/], ["no-artifact", /no unexpired route-manifest artifact/], ["manifest", /not a readable zip/, writeText("bm-junk.zip", "not a zip")], ["manifest", /holds no valid manifest/, zipOf("bm-bad", "{}")]]) {
    const r = fetchBase(mock, zip);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, why);
    assert.match(r.out, /Every page is marked affected/);
    assert.deepEqual(affected(), ["/en", "/en/tools"], `${why}: every page must be affected`);
  }
  const r = fetchBase("manifest", zipOf("bm-ok", JSON.stringify({ locales: ["en"], routes: { "/en": { a: "1" }, "/en/tools": { a: "0" } } })));
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(affected(), ["/en/tools"], "a valid base manifest must narrow the pages");
});

test("share-images fails on a sitemap page without og:image", async () => {
  // Not "node --test ...": a node:test file run as a CHILD of this already-running `node --test` process hits
  // Node's recursive-run guard ("run() is being called recursively within a test file") and silently skips,
  // passing any fixture. Plain `node <file>` still auto-runs node:test's queued tests at exit and reports the
  // same pass/fail via its exit code and TAP output - just outside that CLI-flag-triggered guard.
  const r = await gateAsync("node", ["tests/share-images.test.mjs"], { env: { BASE: `http://127.0.0.1:${SITE_PORT}/share-canary` } });
  failsWith(r, /\/share-canary\/en\/no-image: no og:image/, "share-images");
});

// The locks compare against a copy of their committed baseline with one dimension changed: the lock must fail
// and name that value (whatever else it reports). The color-lock canary variant (tampering a captured color
// too) lands with the desktop/home-phone color-capture change (PR B), not with this generic gate infra.
function tamper(file, mutate) {
  const b = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
  const expected = mutate(b);
  const copy = join(TMP, file.split("/").pop());
  writeFileSync(copy, JSON.stringify(b));
  return { copy, expected };
}

test("desktop lock fails on a changed card dimension", () => {
  const { copy, expected } = tamper(`tests/baselines/desktop${process.platform === "linux" ? ".linux" : ""}.json`, (b) => {
    const v = b["/en/tools/bmi-calculator"];
    v.cards[0][3] += 40; // width
    return [new RegExp(`/en/tools/bmi-calculator cards #0 .*: w ${"\\d"}.* \\(approved ${v.cards[0][3]}\\)`)];
  });
  const r = gate("node", ["tests/desktop-lock.mjs", "--only", "bmi-calculator", "--baseline", copy]);
  for (const re of expected) failsWith(r, re, "desktop lock");
});

test("phone lock fails on a changed header dimension", () => {
  assert.ok(process.env.PHONE_BASE, "PHONE_BASE (a `next start` of the normal build on a free port) is required: the phone lock canary cannot be skipped");
  const { copy, expected } = tamper(`tests/baselines/home-phone${process.platform === "linux" ? ".linux" : ""}.json`, (b) => {
    const h = b["en@390"].regions.header[0];
    h.h += 30;
    return [new RegExp(`en@390 header #0 <header>: h \\d.* \\(approved ${h.h}\\)`)];
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
