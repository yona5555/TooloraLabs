// Brand icons from the Σ mark (public/favicon.svg, a 16-unit grid so the 16px favicon lands on whole pixels):
// favicon PNGs + favicon.ico (rounded tile), apple-touch-icon and the manifest icons. The full-bleed variants
// (apple-touch-icon, icon-maskable-512) fill the square with the tile colour and keep the Σ inside the 80%
// maskable safe zone, since iOS and Android launchers apply their own mask.
//   node apps/web/scripts/brand-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const pub = new URL("../public/", import.meta.url);
const tile = readFileSync(new URL("favicon.svg", pub), "utf8");
const sigma = tile.match(/<path[^>]*\/>/)[0];
const blue = tile.match(/fill="(#[0-9a-f]{6})"/)[1];
const fullBleed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="${blue}"/><g transform="translate(2 2) scale(.75)">${sigma}</g></svg>`;

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: (72 * size) / 16 })
    .resize(size, size)
    .png({ compressionLevel: 9, palette: false })
    .withMetadata({})
    .toBuffer();

// ICO with embedded PNG images (Vista+ format, supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size % 256, e);
    header.writeUInt8(size % 256, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((im) => im.data)]);
}

const files = {
  "favicon-16x16.png": [tile, 16],
  "favicon-32x32.png": [tile, 32],
  "icon-192.png": [tile, 192],
  "icon-512.png": [tile, 512],
  "icon-maskable-512.png": [fullBleed, 512],
  "apple-touch-icon.png": [fullBleed, 180],
};
for (const [name, [svg, size]] of Object.entries(files)) writeFileSync(new URL(name, pub), await png(svg, size));
const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tile, size) })));
writeFileSync(new URL("../app/favicon.ico", import.meta.url), ico(icoImages));
console.log(`wrote ${Object.keys(files).length} PNGs + app/favicon.ico`);
