import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { clockAfterBuild, DAY_MS, hydrationProblems, isHydrationError, renderedAtOf, watchHydration } from "./hydration-guard.mjs";

test("React hydration errors are recognised, other errors are not", () => {
  for (const m of [
    "Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message",
    "Minified React error #423; visit https://react.dev/errors/423",
    "Minified React error #425",
    "Hydration failed because the server rendered text didn't match the client.",
    "Warning: Text content did not match. Server: \"2026-10-28\" Client: \"2026-10-31\"",
  ])
    assert.equal(isHydrationError(m), true, m);
  for (const m of ["Minified React error #185", "Failed to load resource: 404", "TypeError: x is undefined"]) assert.equal(isHydrationError(m), false, m);
});

test("the build time is read from the render clock in the RSC payload (escaped or not)", () => {
  assert.equal(renderedAtOf('self.__next_f.push([1,"{\\"renderedAt\\":1793145600000,\\"children\\":"])'), 1793145600000);
  assert.equal(renderedAtOf('{"renderedAt":1793145600000}'), 1793145600000);
  assert.equal(renderedAtOf("<html>no clock</html>"), null);
  assert.equal(clockAfterBuild(1793145600000).getTime(), 1793145600000 + 3 * DAY_MS);
});

// A real React 19 page: the server renders "today" at build time, the browser hydrates it on its own clock.
const web = createRequire(fileURLToPath(new URL("../apps/web/package.json", import.meta.url)));
const dom = createRequire(web.resolve("react-dom/package.json"));
const React = web("react");
const { renderToString } = web("react-dom/server");
// The packages export only their entry points, so the production files are read from each package folder.
const file = (req, pkg, path) => join(dirname(req.resolve(`${pkg}/package.json`)), path);
const sources = {
  react: file(web, "react", "cjs/react.production.js"),
  scheduler: file(dom, "scheduler", "cjs/scheduler.production.js"),
  "react-dom": file(web, "react-dom", "cjs/react-dom.production.js"),
  "react-dom/client": file(web, "react-dom", "cjs/react-dom-client.production.js"),
};
// A minimal CommonJS loader, so the production builds run in the page without a bundler.
const loader = `const defs = {${Object.entries(sources)
  .map(([name, file]) => `${JSON.stringify(name)}: function (module, exports, require) {\n${readFileSync(file, "utf8")}\n}`)
  .join(",\n")}};
const cache = {};
function require(name) {
  if (!cache[name]) { cache[name] = { exports: {} }; defs[name](cache[name], cache[name].exports, require); }
  return cache[name].exports;
}`;

const App = () => React.createElement("p", { id: "today" }, new Date().toISOString().slice(0, 10));
const BUILT_AT = Date.UTC(2026, 9, 28, 9, 0, 0);

async function visit(browser, visitClock) {
  // Server render at build time (this test process's clock is not faked, so the day is set explicitly).
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...a) {
      super(...(a.length ? a : [BUILT_AT]));
    }
  };
  const html = renderToString(React.createElement(App));
  globalThis.Date = RealDate;

  const page = await browser.newPage();
  const hydration = watchHydration(page);
  await page.clock.setFixedTime(visitClock);
  await page.route("http://hydration.test/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body><div id="root">${html}</div><script>${loader}
const React = require("react");
const App = () => React.createElement("p", { id: "today" }, new Date().toISOString().slice(0, 10));
require("react-dom/client").hydrateRoot(document.getElementById("root"), React.createElement(App));
</script></body></html>`,
    }),
  );
  await page.goto("http://hydration.test/");
  await page.waitForFunction(() => document.getElementById("today")?.textContent);
  await page.waitForTimeout(300);
  const shown = await page.textContent("#today");
  await page.close();
  return { problems: hydrationProblems("/en/tools/example", hydration()), shown };
}

test("a server/client date mismatch fails the guard; the same day passes", async () => {
  const browser = await chromium.launch();
  try {
    const mismatch = await visit(browser, clockAfterBuild(BUILT_AT));
    assert.equal(mismatch.problems.length > 0, true, "the build day + 3 days visit must report a hydration error");
    assert.match(mismatch.problems[0], /^\/en\/tools\/example: hydration error \(.*(#418|#423|#425|Hydration failed|did not match)/);
    assert.equal(mismatch.shown, "2026-10-31", "React re-rendered the page on the client clock");

    const sameDay = await visit(browser, new Date(BUILT_AT));
    assert.deepEqual(sameDay.problems, []);
    assert.equal(sameDay.shown, "2026-10-28");
  } finally {
    await browser.close();
  }
});
