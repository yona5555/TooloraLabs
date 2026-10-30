// System font rule: every font the site draws text with is self-hosted (apps/web/lib/fonts.ts), so a page
// renders with the same glyphs on macOS, Windows, Android and Linux. Every font-family value in the source
// (CSS font-family / --font-* tokens, JSX fontFamily, canvas .font, Tailwind font-[…]) may only name
// var(--…) stacks, inherit/initial/unset, or an interpolated (already resolved) value: any family name in it,
// a system one (Arial, ui-monospace, Menlo, …) or a generic one (sans-serif, monospace, system-ui), fails.
// Usage: node scripts/system-fonts.mjs [file or dir ...]   (default: the web app and the packages' source)
// Exits 1 with file:line for each finding; tests/system-fonts.test.mjs proves it on a broken fixture.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEFAULT_DIRS = ["apps/web/app", "apps/web/components", "apps/web/lib", "apps/web/hooks", "apps/web/data", "packages/core/src", "packages/sdk/src", "packages/tools/src"];
const EXT = /\.(css|tsx?|mts|mjs|jsx?)$/;

// [kind, pattern]; group 1 is the family value.
const DECLARATIONS = [
  ["css font-family", /font-family\s*:\s*((?:\$\{[^}]*\}|[^;}{])+)/g],
  ["css --font token", /--font-[\w-]+\s*:\s*((?:\$\{[^}]*\}|[^;}{])+)/g],
  ["jsx fontFamily", /fontFamily\s*[=:]\s*\{?\s*(?:[^"'`{}]*\?\s*)?(["'`][^"'`]*["'`](?:\s*:\s*["'`][^"'`]*["'`])?)/g],
  ["canvas font", /\.font\s*=\s*(`[^`]*`|"[^"]*"|'[^']*')/g],
  ["tailwind font-[…]", /\bfont-\[([^\]]+)\]/g],
];
const ALLOWED = /^(var\(--[\w-]+\)|inherit|initial|unset|revert|\$\{[^}]+\}|family-name:var\(--[\w-]+\))$/;

/** One finding per declaration whose family list names a font that is not a self-hosted var() stack. */
export function systemFontFindings(text, file = "<text>") {
  const findings = [];
  for (const [kind, re] of DECLARATIONS) {
    for (const m of text.matchAll(re)) {
      let value = m[1].trim();
      // quoted literals (possibly a ternary's two branches): check each
      const literals = [...value.matchAll(/["'`]([^"'`]*)["'`]/g)].map((q) => q[1]);
      for (let v of literals.length ? literals : [value]) {
        if (kind === "canvas font") v = v.replace(/^.*?\d[\w.%]*(?:px|em|rem|pt)\s+|^.*?\}px\s+/, ""); // drop style/weight/size
        v = v.replace(/!important/, "").trim();
        if (!v) continue;
        const bad = v.split(/,(?![^(]*\))/).map((t) => t.trim()).filter((t) => t && !ALLOWED.test(t));
        if (bad.length) {
          const line = text.slice(0, m.index).split("\n").length;
          findings.push(`${file}:${line}: ${kind} names ${bad.join(", ")} (use a self-hosted stack: var(--font-sans|mono|serif))`);
        }
      }
    }
  }
  return findings;
}

function* files(path) {
  if (statSync(path).isDirectory()) {
    for (const e of readdirSync(path)) if (e !== "node_modules" && !e.startsWith(".next")) yield* files(join(path, e));
  } else if (EXT.test(path)) yield path;
}

export function scan(paths = DEFAULT_DIRS.map((d) => join(ROOT, d))) {
  const findings = [];
  for (const p of paths) for (const f of files(p)) findings.push(...systemFontFindings(readFileSync(f, "utf8"), relative(ROOT, f)));
  return findings;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const findings = scan(process.argv.length > 2 ? process.argv.slice(2) : undefined);
  for (const f of findings) console.log(`::error title=System font::${f}`);
  if (findings.length) {
    console.error(`${findings.length} system font declaration(s); every family must be a self-hosted var(--font-…) stack (apps/web/lib/fonts.ts).`);
    process.exit(1);
  }
  console.log("system fonts: none (every font-family is a self-hosted var(--font-…) stack)");
}
