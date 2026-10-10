// Scientific Notation Converter check: ladder drag (values read during drag), constants click, top crop.
// Usage: node apps/web/scripts/scientific-notation-check.mjs outDir [width]
import { chromium } from "playwright";
const [S, W = "1440"] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: Number(W), height: 900 } })).newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
await p.goto("http://localhost:3000/en/tools/scientific-notation-converter", { waitUntil: "load" });
await p.waitForTimeout(3000);
const read = () => p.evaluate(() => ({
  res: document.querySelector('[data-testid="sci-result"]')?.textContent,
  shift: document.querySelector('[data-testid="shift-caption"]')?.textContent,
  ladder: document.querySelector('[data-testid="ladder-readout"]')?.textContent,
  forms: [...document.querySelectorAll('[data-form]')].map((r) => r.textContent).join(" | "),
}));
console.log("LOAD", await read());
const th = p.locator('[data-testid="ladder-thumb"] circle').last();
await th.scrollIntoViewIfNeeded();
const bx = await th.boundingBox();
await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.mouse.down();
await p.mouse.move(bx.x - 90, bx.y + bx.height / 2, { steps: 8 });
console.log("DURING", await read());
await p.mouse.move(bx.x - 200, bx.y + bx.height / 2, { steps: 8 });
console.log("DURING2", await read());
await p.mouse.up();
await p.click('[data-constant="planck"]'); await p.waitForTimeout(2000);
console.log("PLANCK", await read());
await p.click('[data-constant="lightSpeed"]'); await p.waitForTimeout(2000);
await p.evaluate(() => window.scrollTo(0, 0));
const h = await p.evaluate(() => { const r = (s) => document.querySelector(s)?.getBoundingClientRect(); return { inp: r('[data-testid="constants"]')?.bottom, res: r('[data-tool-result]')?.bottom }; });
console.log("heights", h, errs);
await p.screenshot({ path: `${S}/sn-top-${W}.png`, fullPage: true });
await b.close();
