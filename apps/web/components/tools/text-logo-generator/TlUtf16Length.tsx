"use client";
import { useTranslations } from "next-intl";
import TlIndicatorCard from "./TlIndicatorCard";
import { useTlLive } from "./TlLiveContext";
import { STYLE_FILLS } from "./tlMath";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 330;
const LEFT = 78;
const ROW = 20;

/** Ranked horizontal bars (§31 #5): UTF-16 code units per style — what many character counters see — against the visible characters (dashed line). */
export default function TlUtf16Length() {
  const t = useTranslations("tools.text-logo-generator.live.utf16");
  const { styles, plain, active, activeStyle, setActiveStyle, styleName, f } = useTlLive();
  const ranked = styles.map((s, i) => ({ ...s, fill: STYLE_FILLS[i] })).sort((a, b) => b.utf16 - a.utf16);
  const max = Math.max(...ranked.map((s) => s.utf16), 1);
  const H = ranked.length * ROW + 22;
  const sx = (v: number) => LEFT + (v / max) * (W - LEFT - 34);

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {ranked.map((s, i) => {
        const y = 4 + i * ROW;
        const on = s.style === activeStyle;
        return (
          <g key={s.style} className="cursor-pointer" onClick={() => setActiveStyle(s.style)} opacity={on ? 1 : 0.6} style={{ transition: "opacity 200ms ease" }}>
            <text style={{ fontSize: svgPx(12) }} x={LEFT - 6} y={y + 11} textAnchor="end" fontWeight={on ? 700 : 500} className="fill-zinc-700 dark:fill-zinc-200">
              {styleName(s.style)}
            </text>
            <rect x={LEFT} y={y + 2} width={sx(s.utf16) - LEFT} height={ROW - 7} rx={3} className={s.fill} style={{ transition: "width 400ms ease" }} />
            <text style={{ fontSize: svgPx(12) }} x={sx(s.utf16) + 4} y={y + 12} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
              {f(s.utf16)}
            </text>
          </g>
        );
      })}
      <line x1={sx(plain.characters)} y1={2} x2={sx(plain.characters)} y2={H - 16} strokeDasharray="3 3" strokeWidth={1.5} className="stroke-zinc-900 dark:stroke-zinc-100" />
      <text style={{ fontSize: svgPx(12) }} x={sx(plain.characters)} y={H - 5} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
        {t("visible", { n: f(plain.characters) })}
      </text>
    </svg>
  );

  return (
    <TlIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("characters"), value: f(active.characters) },
        { label: t("pairs"), value: f(active.surrogates), note: t("pairsNote") },
        { label: t("units", { style: styleName(active.style) }), value: `${f(active.characters)} + ${f(active.surrogates)} = ${f(active.utf16)}`, emphasize: true },
        { label: t("extra"), value: `+${f(active.utf16 - active.characters)}` },
      ]}
    />
  );
}
