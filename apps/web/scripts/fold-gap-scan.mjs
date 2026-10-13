// Above-the-fold gap scan (§41): column bottom edges and vertical gaps between stacked blocks.
// Usage: node apps/web/scripts/fold-gap-scan.mjs slug[,slug] [width] [locale] [shotDir]
import { chromium } from "playwright";
const [slugs, W = "1440", locale = "en", shotDir] = process.argv.slice(2);
const b = await chromium.launch();
for (const slug of slugs.split(",")) {
  const ctx = await b.newContext({ viewport: { width: Number(W), height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(`http://localhost:3000/${locale}/tools/${slug}`, { waitUntil: "load" });
  await p.evaluate(() => localStorage.setItem("theme", "dark"));
  await p.reload({ waitUntil: "load" });
  await p.waitForTimeout(3000);
  const out = await p.evaluate(() => {
    const grid = document.querySelector("[data-tool-result]")?.parentElement;
    if (!grid) return { error: "no grid" };
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.height > 0 && r.width > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
    const cols = [...grid.children].filter(vis);
    const res = { gridBottom: Math.round(grid.getBoundingClientRect().bottom + scrollY), cols: [] };
    // Leaf "blocks" of a column: descend through single-wrapper divs until a node has >1 visible child.
    const blocks = (el) => { let e = el; while (e.children.length === 1 && e.children[0].tagName === "DIV") e = e.children[0]; const kids = [...e.children].filter(vis); return kids.length > 1 ? kids : [e]; };
    for (const c of cols) {
      const r = c.getBoundingClientRect();
      const bl = blocks(c).map((k) => k.getBoundingClientRect());
      const gaps = [];
      for (let i = 1; i < bl.length; i++) gaps.push(Math.round(bl[i].top - bl[i - 1].bottom));
      const contentBottom = Math.max(...bl.map((x) => x.bottom));
      res.cols.push({ cls: c.className.slice(0, 40), top: Math.round(r.top + scrollY), boxBottom: Math.round(r.bottom + scrollY), contentBottom: Math.round(contentBottom + scrollY), gapsBetween: gaps });
    }
    // Empty space inside cards: deepest SectionCard body: distance from last child bottom to body bottom.
    res.cardHoles = [...grid.querySelectorAll("[data-bp-panel]")].filter(vis).map((card) => {
      const body = card.children[card.children.length - 1];
      const kids = [...body.querySelectorAll(":scope > *")].filter(vis);
      const last = kids.length ? Math.max(...kids.map((k) => k.getBoundingClientRect().bottom)) : body.getBoundingClientRect().top;
      const pb = parseFloat(getComputedStyle(body).paddingBottom);
      return { id: card.id || card.querySelector("h2")?.textContent?.slice(0, 30), hole: Math.round(body.getBoundingClientRect().bottom - pb - last), bottom: Math.round(card.getBoundingClientRect().bottom + scrollY) };
    });
    return res;
  });
  console.log(slug, W, locale, JSON.stringify(out), errs.length ? "ERRORS " + errs.join(" | ").slice(0, 300) : "no-errors");
  if (shotDir) await p.screenshot({ path: `${shotDir}/${slug}-${locale}-${W}.png`, fullPage: true, clip: { x: 0, y: 0, width: Number(W), height: (out.gridBottom || 1400) + 40 } });
  await ctx.close();
}
await b.close();
