"use client";
import { useTranslations } from "next-intl";
import TlIndicatorCard from "./TlIndicatorCard";
import { useTlLive } from "./TlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 330;
const LEFT = 78;
const ROW = 20;
const SEGMENTS = [
  { key: "offset", fill: "fill-blue-600 dark:fill-blue-400" },
  { key: "exception", fill: "fill-amber-500 dark:fill-amber-400" },
  { key: "unchanged", fill: "fill-rose-400 dark:fill-rose-400/80" },
  { key: "other", fill: "fill-zinc-300 dark:fill-zinc-600" },
] as const;

/** Stacked segmented bars (§31 #15): how each style handled every character of the text. */
export default function TlCoverage() {
  const t = useTranslations("tools.text-logo-generator.live.coverage");
  const { styles, active, activeStyle, setActiveStyle, styleName, f, pct } = useTlLive();
  const H = styles.length * ROW + 4;
  const parts = (s: (typeof styles)[number]) => ({ offset: s.mapped - s.exceptions, exception: s.exceptions, unchanged: s.unchanged, other: s.other });

  const indicator = (
    <div className="space-y-2">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {styles.map((s, i) => {
          const y = 2 + i * ROW;
          const p = parts(s);
          const on = s.style === activeStyle;
          let x = LEFT;
          return (
            <g key={s.style} className="cursor-pointer" onClick={() => setActiveStyle(s.style)} opacity={on ? 1 : 0.6} style={{ transition: "opacity 200ms ease" }}>
              <text style={{ fontSize: svgPx(12) }} x={LEFT - 6} y={y + 11} textAnchor="end" fontWeight={on ? 700 : 500} className="fill-zinc-700 dark:fill-zinc-200">
                {styleName(s.style)}
              </text>
              {SEGMENTS.map((seg) => {
                const w = s.characters ? ((W - LEFT - 2) * p[seg.key]) / s.characters : 0;
                const x0 = x;
                x += w;
                return <rect key={seg.key} x={x0} y={y + 2} width={w} height={ROW - 7} className={seg.fill} style={{ transition: "x 400ms ease, width 400ms ease" }} />;
              })}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
        {SEGMENTS.map((seg) => (
          <span key={seg.key} className="inline-flex items-center gap-1">
            <svg width={10} height={10} aria-hidden>
              <rect width={10} height={10} rx={2} className={seg.fill} />
            </svg>
            {t(seg.key)}
          </span>
        ))}
      </div>
    </div>
  );

  const p = parts(active);
  return (
    <TlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("offset"), value: f(p.offset) },
        { label: t("exception"), value: f(p.exception) },
        { label: t("unchanged"), value: f(p.unchanged), note: t("unchangedNote") },
        { label: t("other"), value: f(p.other) },
        { label: t("share", { style: styleName(active.style) }), value: pct(active.characters ? active.mapped / active.characters : 0), emphasize: true, note: `${f(active.mapped)} ÷ ${f(active.characters)}` },
      ]}
    />
  );
}
