"use client";
import { useTranslations } from "next-intl";
import { textLogoBases, textLogoBlockOf } from "@tooloralabs/tools";
import TlIndicatorCard from "./TlIndicatorCard";
import { hex, useTlLive } from "./TlLiveContext";

const MAX_TILES = 48;

/** Interactive glyph inspector (wow piece): click any character to see how the style computes its code point. */
export default function TlGlyphInspector() {
  const t = useTranslations("tools.text-logo-generator.live.inspector");
  const tb = useTranslations("tools.text-logo-generator.live.blocks");
  const { active, activeChar, setActiveChar, styleName, f } = useTlLive();
  const g = active.glyphs[activeChar];
  if (!g) return null;
  const bases = textLogoBases(active.style);
  const base = g.kind === "upper" ? bases.upper : g.kind === "lower" ? bases.lower : g.kind === "digit" ? bases.digit : null;
  const formula = !g.mapped
    ? t("kept")
    : g.exception
      ? t("exception", { cp: hex(g.styledCodePoint) })
      : `${hex(base ?? 0)} + ${f(g.offset ?? 0)} = ${hex(g.styledCodePoint)}`;

  const indicator = (
    <div className="w-full max-w-sm space-y-3">
      <div dir="ltr" className="flex flex-wrap gap-1">
        {active.glyphs.slice(0, MAX_TILES).map((x, i) => {
          const on = i === activeChar;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveChar(i)}
              className={`flex h-9 min-w-8 items-center justify-center rounded-md border px-1 text-lg transition-colors ${
                on
                  ? "border-amber-400 bg-amber-100 ring-2 ring-amber-400 dark:bg-amber-500/15"
                  : x.mapped
                    ? "border-zinc-200 hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-blue-500/10"
                    : "border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
              }`}
            >
              {x.source === " " ? "␣" : x.styled}
            </button>
          );
        })}
      </div>
      <div dir="ltr" className="flex items-center justify-center gap-4 rounded-xl bg-zinc-50 py-3 dark:bg-zinc-800/50">
        <div className="text-center">
          <div className="text-3xl text-zinc-500 dark:text-zinc-400">{g.source === " " ? "␣" : g.source}</div>
          <div className="font-mono text-xs text-zinc-500">{hex(g.sourceCodePoint)}</div>
        </div>
        <svg width={44} height={16} viewBox="0 0 44 16" aria-hidden>
          <path d="M2 8 H38 M32 3 L40 8 L32 13" fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
        </svg>
        <div className="text-center">
          <div key={`${active.style}-${activeChar}`} className="text-4xl text-blue-700 dark:text-blue-300" style={{ animation: "tl-pop 300ms ease both" }}>
            {g.source === " " ? "␣" : g.styled}
          </div>
          <div className="font-mono text-xs text-blue-700 dark:text-blue-300">{hex(g.styledCodePoint)}</div>
        </div>
      </div>
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">{t("hint")}</p>
      <style>{`@keyframes tl-pop { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );

  return (
    <TlIndicatorCard
      phoneRole="extra"
      title={t("title")}
      intro={t("intro", { style: styleName(active.style) })}
      indicator={indicator}
      rows={[
        { label: t("source"), value: `${g.source} · ${hex(g.sourceCodePoint)}` },
        { label: t("styled"), value: `${g.styled} · ${hex(g.styledCodePoint)}`, emphasize: true },
        { label: t("formula"), value: formula },
        { label: t("block"), value: tb(textLogoBlockOf(g.styledCodePoint)) },
        { label: t("utf16"), value: f(g.utf16Units) },
        { label: t("utf8"), value: f(g.utf8Bytes) },
      ]}
    />
  );
}
