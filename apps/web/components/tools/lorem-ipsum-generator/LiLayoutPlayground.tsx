"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LOREM_COUNT_RANGE } from "@tooloralabs/tools";
import { RefreshCw } from "lucide-react";
import LiIndicatorCard from "./LiIndicatorCard";
import { charsPerLine, estimatedLines, GLYPH_EM, MEASURE } from "./liMath";
import { useLiLive } from "./LiLiveContext";

const FRAME = 340;
const MAX_WIDTH = 720;
const SCALE = FRAME / MAX_WIDTH;
const FRAME_H = 230;
const PARA_GAP = 0.75;

/**
 * Layout playground (wow piece): drag the count to regenerate the text live, and the font size,
 * line height and column width to typeset it in a scaled mock page. Click a paragraph to select it.
 */
export default function LiLayoutPlayground() {
  const t = useTranslations("tools.lorem-ipsum-generator.live.playground");
  const { analysis: a, countValue, setCount, regenerate, activeParagraph, selectParagraph, f } = useLiLive();
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [width, setWidth] = useState(560);

  const cpl = charsPerLine(width, fontSize);
  const lines = estimatedLines(a, cpl);
  const linePx = fontSize * lineHeight;
  const height = lines * linePx + Math.max(0, a.paragraphs.length - 1) * fontSize * PARA_GAP;
  const verdict = cpl < MEASURE.min ? "narrow" : cpl > MEASURE.max ? "wide" : "comfortable";
  const tone =
    verdict === "comfortable"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
      : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300";
  const count = Math.min(LOREM_COUNT_RANGE.max, Math.max(LOREM_COUNT_RANGE.min, Math.round(countValue) || 1));

  const slider = (label: string, value: string, input: ReactNode) => (
    <label className="block text-[11px] text-zinc-500 dark:text-zinc-400">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{value}</span>
      </span>
      {input}
    </label>
  );

  const indicator = (
    <div className="w-full sm:w-[340px]">
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/60" style={{ height: FRAME_H }}>
        <div
          className="origin-top-left p-3 text-zinc-800 rtl:origin-top-right dark:text-zinc-100"
          style={{ width: FRAME / SCALE, transform: `scale(${SCALE})` }}
        >
          <div className="mb-4 h-5 w-2/5 rounded bg-zinc-800 dark:bg-zinc-200" />
          <div
            className="border-x-2 border-dashed border-blue-300/70 dark:border-blue-500/40"
            style={{ width, fontSize, lineHeight, transition: "width 250ms ease, font-size 250ms ease" }}
          >
            {a.paragraphs.slice(0, 12).map((p) => {
              const on = activeParagraph === p.index;
              return (
                <p
                  key={p.index}
                  dir="auto"
                  onClick={() => selectParagraph(on ? null : p.index, true)}
                  className={`cursor-pointer rounded px-1 transition-colors ${on ? "bg-amber-100 dark:bg-amber-500/20" : "hover:bg-blue-50 dark:hover:bg-blue-500/10"}`}
                  style={{ marginBottom: `${PARA_GAP}em` }}
                >
                  {a.text.slice(p.start, p.end)}
                </p>
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-zinc-900" />
        <span dir="auto" className={`absolute end-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
          {t(`verdicts.${verdict}`)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {slider(
          t("count"),
          f(count),
          <input type="range" min={LOREM_COUNT_RANGE.min} max={LOREM_COUNT_RANGE.max} value={count} onChange={(e) => setCount(f(Number(e.target.value)))} className="w-full accent-blue-600" />,
        )}
        {slider(
          t("fontSize"),
          t("px", { n: f(fontSize) }),
          <input type="range" min={11} max={28} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-blue-600" />,
        )}
        {slider(
          t("width"),
          t("px", { n: f(width) }),
          <input type="range" min={200} max={MAX_WIDTH} step={10} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-blue-600" />,
        )}
        {slider(
          t("lineHeight"),
          f(lineHeight, 2),
          <input type="range" min={1.1} max={2.2} step={0.05} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full accent-blue-600" />,
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-amber-700 dark:text-amber-300">{t("hint")}</p>
        <button
          type="button"
          onClick={regenerate}
          aria-label={t("reroll")}
          title={t("reroll")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <LiIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("cpl"), value: `≈ ${f(cpl)}`, note: `${f(width)} ÷ (${f(fontSize)} × ${f(GLYPH_EM, 2)})` },
        { label: t("measure"), value: `${f(MEASURE.min)}–${f(MEASURE.max)}`, note: t("measureNote") },
        { label: t("lines"), value: `≈ ${f(lines)}`, note: t("linesNote", { paragraphs: f(a.paragraphs.length) }) },
        { label: t("linePx"), value: t("px", { n: f(linePx, 1) }), note: `${f(fontSize)} × ${f(lineHeight, 2)}` },
        { label: t("height"), value: t("px", { n: f(Math.round(height)) }), note: `${f(lines)} × ${f(linePx, 1)}` },
        { label: t("verdict"), value: t(`verdicts.${verdict}`), emphasize: true },
      ]}
    />
  );
}
