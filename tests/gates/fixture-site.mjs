// Fixture site for the gate canaries (tests/gates-self-test.mjs): one deliberately broken page per site-audit
// criterion plus a clean control page, a sitemap that lists them, and a share-image sitemap whose second page
// has no og:image. Every page sends a render clock (renderedAt) like a real tool page, so the audit's
// hydration guard runs on it. The hydration page is a real React 19 server render hydrated in the browser.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const BUILT_AT = Date.UTC(2026, 9, 28, 9, 0, 0);

const web = createRequire(fileURLToPath(new URL("../../apps/web/package.json", import.meta.url)));
const dom = createRequire(web.resolve("react-dom/package.json"));
const React = web("react");
const { renderToString } = web("react-dom/server");
const file = (req, pkg, path) => join(dirname(req.resolve(`${pkg}/package.json`)), path);
const sources = {
  react: file(web, "react", "cjs/react.production.js"),
  scheduler: file(dom, "scheduler", "cjs/scheduler.production.js"),
  "react-dom": file(web, "react-dom", "cjs/react-dom.production.js"),
  "react-dom/client": file(web, "react-dom", "cjs/react-dom-client.production.js"),
};
const loader = `const defs = {${Object.entries(sources)
  .map(([name, f]) => `${JSON.stringify(name)}: function (module, exports, require) {\n${readFileSync(f, "utf8")}\n}`)
  .join(",\n")}};
const cache = {};
function require(name) {
  if (!cache[name]) { cache[name] = { exports: {} }; defs[name](cache[name], cache[name].exports, require); }
  return cache[name].exports;
}`;

// "Today" rendered at build time on the server, hydrated on the visitor's clock (the audit: build + 3 days).
function hydrationBody() {
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...a) {
      super(...(a.length ? a : [BUILT_AT]));
    }
  };
  const App = () => React.createElement("p", { id: "today" }, new Date().toISOString().slice(0, 10));
  const html = renderToString(React.createElement(App));
  globalThis.Date = RealDate;
  return `<div id="root">${html}</div><script>${loader}
const React = require("react");
const App = () => React.createElement("p", { id: "today" }, new Date().toISOString().slice(0, 10));
require("react-dom/client").hydrateRoot(document.getElementById("root"), React.createElement(App));
</script>`;
}

/** Path (locale-free) -> [criterion the audit must report, page body]. */
export const BROKEN = {
  "/overlap": ["overlap", `<svg width="300" height="120" viewBox="0 0 300 120"><text x="100" y="60" font-size="16">Revenue</text><text x="110" y="62" font-size="16">Profit</text></svg>`],
  "/svg-clip": ["clip", `<svg width="300" height="120" viewBox="0 0 300 120"><text x="250" y="60" font-size="16">Cut-off label</text></svg>`],
  "/html-clip": ["clip", `<div style="width:90px;overflow:hidden;white-space:nowrap;font-size:16px"><span>This sentence is cut by its box</span></div>`],
  "/small-text": ["small", `<p style="font-size:10px">Ten pixel caption</p>`],
  "/hydration": ["hydration", hydrationBody()],
  "/console-error": ["console", `<p style="font-size:16px">Page with an error</p><script>console.error("canary: a console error")</script>`],
  "/contrast": ["a11y", `<p style="font-size:16px;color:#c8c8c8;background:#ffffff">Pale grey text on white</p>`],
  "/broken-link": ["link", `<p style="font-size:16px"><a href="/en/no-such-page">A link to nowhere</a></p>`],
};
export const CLEAN = "/clean";

const page = (title, body, head = "") =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>${head}<script>self.__clock={"renderedAt":${BUILT_AT}}</script></head><body style="font-family:inherit;margin:16px"><main>${body}</main></body></html>`;

export function startFixtureSite(port) {
  const pages = { [CLEAN]: page("Clean", `<h1 style="font-size:24px">Clean page</h1><p style="font-size:16px">Readable text, nothing broken.</p>`) };
  for (const [path, [, body]] of Object.entries(BROKEN)) pages[path] = page(path.slice(1), body);
  const loc = (p) => `<url><loc>https://fixture.test/en${p}</loc></url>`;
  const shareHead = (key) => `<meta property="og:image" content="https://fixture.test/share/en/${key}.png"><meta name="twitter:image" content="https://fixture.test/share/en/${key}.png">`;
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    const send = (status, type, body) => res.writeHead(status, { "content-type": type }).end(body);
    if (url.pathname === "/sitemap.xml") return send(200, "application/xml", `<urlset>${[CLEAN, ...Object.keys(BROKEN)].map(loc).join("")}</urlset>`);
    // share-images canary: /share-canary is its BASE; the second page has no og:image / twitter:image
    if (url.pathname === "/share-canary/sitemap.xml") return send(200, "application/xml", `<urlset>${loc("/with-image")}${loc("/no-image")}</urlset>`);
    if (url.pathname === "/share-canary/en/with-image") return send(200, "text/html", page("With image", "<p>ok</p>", shareHead("with-image")));
    if (url.pathname === "/share-canary/en/no-image") return send(200, "text/html", page("No image", "<p>missing</p>"));
    if (url.pathname === "/share-canary/share/en/with-image.png") return send(200, "image/png", png);
    const html = url.pathname.startsWith("/en/") && pages[url.pathname.slice(3)];
    if (html) return send(200, "text/html; charset=utf-8", html);
    return send(404, "text/html", page("Not found", "<p>404</p>"));
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}
