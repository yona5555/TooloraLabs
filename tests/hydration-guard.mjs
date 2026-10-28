// Hydration guard for the chart-text audit and the desktop and phone home locks. Tool pages are prerendered,
// so anything the server reads from the clock is the build day; when the visit day differs, React rejects the
// hydration (#418 text, #423 recovered root, #425 text content), re-renders the whole document on the client
// and drops the `dark` class ThemeInitScript set on <html>. Every page these checks load is watched for those
// errors, and the chart-text audit loads every tool with the browser clock set to build day + 3 days, so a
// server-rendered "today" fails by page and locale instead of reaching visitors.
// Pure helpers plus a Playwright page watcher; tests/hydration-guard.test.mjs proves a real mismatch fails it.

const HYDRATION = /Minified React error #(418|423|425)\b|Hydration failed|did not match|hydrat\w* (mismatch|error)|server rendered (HTML|text) didn't match/i;

export const isHydrationError = (text) => HYDRATION.test(String(text));

/**
 * Collects the hydration errors a page reports (uncaught page errors and console errors) from now on.
 * Returns a function that gives the messages so far (first line, at most 160 characters each).
 */
export function watchHydration(page) {
  const seen = [];
  const add = (text) => {
    if (isHydrationError(text)) seen.push(String(text).split("\n")[0].slice(0, 160));
  };
  page.on("pageerror", (e) => add(e.message));
  page.on("console", (m) => m.type() === "error" && add(m.text()));
  return () => [...seen];
}

/** One problem line per hydration error, naming the page (and locale, which is part of the path). */
export const hydrationProblems = (where, errors) => errors.map((e) => `${where}: hydration error (${e})`);

/**
 * The moment a tool page was rendered, from the render clock it sends in its RSC payload
 * (RenderClockProvider `renderedAt`): the build time for a prerendered page.
 */
export function renderedAtOf(html) {
  const m = /renderedAt\\?"\s*:\s*(\d{12,})/.exec(html);
  return m ? Number(m[1]) : null;
}

export const DAY_MS = 86_400_000;

/** Build time + `days`, the browser clock the audit uses so the visit day never equals the build day. */
export const clockAfterBuild = (renderedAt, days = 3) => new Date(renderedAt + days * DAY_MS);
