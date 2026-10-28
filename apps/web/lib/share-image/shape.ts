// Text for the share images, shaped by HarfBuzz: the same shaper Chromium uses. satori (next/og) has no
// shaper, so Arabic came out unjoined and Devanagari without its conjuncts; every locale now goes through
// this one path instead. The title is split into bidi runs (UAX #9, bidi-js), each run shaped with its own
// direction, the runs put in visual order (rule L2), and every glyph emitted as an SVG path from the exact
// font file, so the share image carries no text for satori to lay out. Like the browser, a character the
// locale's face lacks (Latin letters in a Hindi title) falls back to the next face in the chain.
// Pure Node (fs + wasm), no Next imports: scripts/share-text-gate.mts runs it directly.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Blob, Buffer, Direction, Face, Font, shape } from "harfbuzzjs";
import bidiFactory from "bidi-js";

const FONT_DIR = join(process.cwd(), "assets/fonts");
/** The site's own faces: IBM Plex Sans Arabic (ar), Noto Sans Devanagari (hi); the Latin locales use the
 *  Arial stack on the site, here Arimo, its metric-compatible open counterpart (Arial cannot be shipped). */
export const SHARE_FONT_FILES = {
  ar: "IBMPlexSansArabic-Bold.ttf",
  hi: "NotoSansDevanagari-Bold.ttf",
  latin: "Arimo-Bold.ttf",
} as const;

/** The face chain of a locale, first choice first (the browser's own fallback order on the site). */
export const shareFontFiles = (locale: string) =>
  (locale === "ar" ? [SHARE_FONT_FILES.ar, SHARE_FONT_FILES.latin] : locale === "hi" ? [SHARE_FONT_FILES.hi, SHARE_FONT_FILES.latin] : [SHARE_FONT_FILES.latin]).map((f) =>
    join(FONT_DIR, f),
  );

const bidi = bidiFactory();
type LoadedFont = { file: string; font: Font; upem: number; ascender: number; descender: number; covers: Set<number> };
const fonts = new Map<string, LoadedFont>();
function loadFont(file: string): LoadedFont {
  let f = fonts.get(file);
  if (!f) {
    const face = new Face(new Blob(readFileSync(file)));
    const font = new Font(face);
    const { ascender, descender } = font.hExtents();
    f = { file, font, upem: face.upem, ascender, descender, covers: new Set(face.collectUnicodes()) };
    fonts.set(file, f);
  }
  return f;
}

type Glyph = { font: LoadedFont; gid: number; x: number; y: number };
type Line = { glyphs: Glyph[]; width: number };

// Marks and joiners stay in the face of the character they attach to.
const ATTACHES = /[\p{M}\u200c\u200d]/u;

/** One line in visual order, in px at size px. Throws on a character no face in the chain has. */
function shapeLine(text: string, locale: string, chain: LoadedFont[], size: number): Line {
  const { levels } = bidi.getEmbeddingLevels(text, locale === "ar" ? "rtl" : "ltr");
  const faceOf: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i)!;
    const face = i > 0 && (ATTACHES.test(text[i]) || cp === 0x20) ? faceOf[i - 1] : chain.findIndex((f) => f.covers.has(cp));
    if (face < 0) throw new Error(`share image: no face in ${chain.map((f) => f.file).join(", ")} has "${text[i]}" (U+${cp.toString(16)}) in "${text}"`);
    faceOf[i] = face;
    if (cp > 0xffff) faceOf[++i] = face;
  }
  const runs: { start: number; end: number; level: number; face: number }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.level === levels[i] && last.face === faceOf[i]) last.end = i + 1;
    else runs.push({ start: i, end: i + 1, level: levels[i], face: faceOf[i] });
  }
  // L2: from the highest level down to the lowest odd one, reverse every sequence of runs at that level or above.
  const max = Math.max(...runs.map((r) => r.level));
  const minOdd = Math.min(...runs.map((r) => r.level).filter((l) => l % 2 === 1), max + 1);
  for (let level = max; level >= minOdd; level--) {
    for (let i = 0; i < runs.length; ) {
      if (runs[i].level < level) { i++; continue; }
      let j = i;
      while (j < runs.length && runs[j].level >= level) j++;
      runs.splice(i, j - i, ...runs.slice(i, j).reverse());
      i = j;
    }
  }
  const glyphs: Glyph[] = [];
  let x = 0;
  for (const run of runs) {
    const f = chain[run.face];
    const k = size / f.upem;
    const buffer = new Buffer();
    buffer.addText(text, run.start, run.end - run.start);
    buffer.setDirection(run.level % 2 ? Direction.RTL : Direction.LTR);
    buffer.setLanguage(locale);
    buffer.guessSegmentProperties();
    shape(f.font, buffer);
    const positions = buffer.getGlyphPositions();
    buffer.getGlyphInfos().forEach((info, i) => {
      if (info.codepoint === 0) throw new Error(`share image: ${f.file} has no glyph for "${text[info.cluster]}" in "${text}"`);
      const p = positions[i];
      glyphs.push({ font: f, gid: info.codepoint, x: x + p.xOffset * k, y: p.yOffset * k });
      x += p.xAdvance * k;
    });
  }
  return { glyphs, width: x };
}

export type ShapedTitle = { svg: string; width: number; height: number; fontSize: number };

/**
 * The title as an SVG (glyph paths only), wrapped at spaces to maxWidth px in at most maxLines lines; the font
 * size steps down from fontSize until it fits. Arabic lines align right, the others left.
 */
export function shapeTitle(
  text: string,
  locale: string,
  { fontSize, maxWidth, maxLines, color, lineHeight = 1.3 }: { fontSize: number; maxWidth: number; maxLines: number; color: string; lineHeight?: number },
): ShapedTitle {
  const chain = shareFontFiles(locale).map(loadFont);
  const { upem, ascender, descender } = chain[0];
  const words = text.split(" ");
  for (let size = fontSize; ; size -= 2) {
    const k = size / upem;
    const lines: Line[] = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && shapeLine(next, locale, chain, size).width > maxWidth) {
        lines.push(shapeLine(current, locale, chain, size));
        current = word;
      } else current = next;
    }
    lines.push(shapeLine(current, locale, chain, size));
    if (lines.length > maxLines || lines.some((l) => l.width > maxWidth)) {
      if (size <= 24) throw new Error(`share image: "${text}" does not fit ${maxLines} lines at 24px`);
      continue;
    }
    const step = size * lineHeight;
    const height = Math.ceil(step * (lines.length - 1) + (ascender - descender) * k);
    const paths: string[] = [];
    lines.forEach((line, n) => {
      const dx = locale === "ar" ? maxWidth - line.width : 0;
      const baseline = ascender * k + n * step;
      for (const g of line.glyphs) {
        const d = g.font.font.glyphToPath(g.gid);
        if (!d) continue;
        const gk = +(size / g.font.upem).toFixed(6);
        const tx = +(dx + g.x).toFixed(2);
        const ty = +(baseline - g.y).toFixed(2);
        paths.push(`<path transform="translate(${tx} ${ty}) scale(${gk} ${-gk})" d="${d}"/>`);
      }
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${height}" viewBox="0 0 ${maxWidth} ${height}"><g fill="${color}">${paths.join("")}</g></svg>`;
    return { svg, width: maxWidth, height, fontSize: size };
  }
}
