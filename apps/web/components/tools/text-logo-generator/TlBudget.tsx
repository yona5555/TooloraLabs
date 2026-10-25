"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import TlIndicatorCard from "./TlIndicatorCard";
import { useTlLive } from "./TlLiveContext";
import { STYLE_FILLS } from "./tlMath";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";
import { labelW } from "@/components/tool-ui/labelLayout";

const ROW = 22;
const MIN = 10;
const MAX = 160;

/** Character budget (interactive): drag the limit and see which styles still fit when a field counts code points or UTF-16 units. */
export default function TlBudget() {
  const t = useTranslations("tools.text-logo-generator.live.budget");
  const { styles, active, activeStyle, setActiveStyle, styleName, f } = useTlLive();
  // laid out at its on-screen width, the name column as wide as the longest style name at 12px, so
  // names never run off the left edge on a phone (§39)
  const [fitRef, W] = useFitWidth(330);
  const LEFT = Math.max(78, Math.ceil(Math.max(...styles.map((s) => labelW(styleName(s.style)))) + 10));
  const [limit, setLimit] = useState(30);
  const max = Math.max(limit * 1.25, ...styles.map((s) => s.utf16));
  const sx = (v: number) => LEFT + (v / max) * (W - LEFT - 8);
  const H = styles.length * ROW + 18;
  const perChar = active.characters ? active.utf16 / active.characters : 1;

  const indicator = (
    <div className="w-full max-w-sm space-y-2">
      <label className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
        <span className="shrink-0 font-semibold">{t("limit")}</span>
        <input type="range" min={MIN} max={MAX} value={limit} onChange={(e) => setLimit(Number(e.target.value))} aria-label={t("limit")} className="w-full accent-blue-600" />
        <span dir="ltr" className="w-8 shrink-0 text-end font-mono font-semibold">{f(limit)}</span>
      </label>
      <svg ref={fitRef} direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <rect x={sx(limit)} y={0} width={Math.max(0, W - sx(limit))} height={H - 14} className="fill-rose-100 dark:fill-rose-500/10" style={{ transition: "x 150ms ease" }} />
        {styles.map((s, i) => {
          const y = 2 + i * ROW;
          const on = s.style === activeStyle;
          const over = s.utf16 > limit;
          return (
            <g key={s.style} className="cursor-pointer" onClick={() => setActiveStyle(s.style)} opacity={on ? 1 : 0.6} style={{ transition: "opacity 200ms ease" }}>
              <text style={{ fontSize: svgPx(12) }} x={LEFT - 6} y={y + 12} textAnchor="end" fontWeight={on ? 700 : 500} className="fill-zinc-700 dark:fill-zinc-200">
                {styleName(s.style)}
              </text>
              <rect x={LEFT} y={y + 2} width={sx(s.utf16) - LEFT} height={7} rx={2} className={STYLE_FILLS[i]} style={{ transition: "width 400ms ease" }} />
              <rect x={LEFT} y={y + 11} width={sx(s.characters) - LEFT} height={5} rx={2} className="fill-zinc-400 dark:fill-zinc-500" style={{ transition: "width 400ms ease" }} />
              {over && (
                <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 12} textAnchor="end" fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
                  +{f(s.utf16 - limit)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={sx(limit)} y1={0} x2={sx(limit)} y2={H - 14} strokeWidth={2} className="stroke-rose-600 dark:stroke-rose-400" style={{ transition: "x1 150ms ease, x2 150ms ease" }} />
        <text style={{ fontSize: svgPx(12) }} x={sx(limit)} y={H - 3} textAnchor="middle" fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
          {f(limit)}
        </text>
      </svg>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t("legend")}</p>
    </div>
  );

  return (
    <TlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("limit"), value: f(limit) },
        { label: t("byChars", { style: styleName(active.style) }), value: active.characters <= limit ? t("fits", { n: f(limit - active.characters) }) : t("over", { n: f(active.characters - limit) }) },
        { label: t("byUnits", { style: styleName(active.style) }), value: active.utf16 <= limit ? t("fits", { n: f(limit - active.utf16) }) : t("over", { n: f(active.utf16 - limit) }), emphasize: true },
        { label: t("perChar"), value: f(perChar, 2), note: `${f(active.utf16)} ÷ ${f(active.characters)}` },
        { label: t("maxChars"), value: f(Math.floor(limit / perChar)), note: `${f(limit)} ÷ ${f(perChar, 2)}` },
      ]}
    />
  );
}
