"use client";
import { useTranslations } from "next-intl";
import TlIndicatorCard from "./TlIndicatorCard";
import { useTlLive } from "./TlLiveContext";
import { STYLE_FILLS, styleSample } from "./tlMath";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 330;
const H = 170;
const BOTTOM = 34;
const TOP = 16;

/** Labeled bar chart (§31 #1): UTF-8 bytes of the plain text vs every style. */
export default function TlByteCost() {
  const t = useTranslations("tools.text-logo-generator.live.bytes");
  const { styles, plain, active, activeStyle, setActiveStyle, styleName, f } = useTlLive();
  const bars = [{ key: "plain", label: t("plain"), bytes: plain.utf8, fill: "fill-zinc-400 dark:fill-zinc-500", style: null }, ...styles.map((s, i) => ({ key: s.style, label: styleName(s.style), bytes: s.utf8, fill: STYLE_FILLS[i], style: s.style }))];
  const max = Math.max(...bars.map((b) => b.bytes), 1);
  const slot = W / bars.length;
  const bw = slot * 0.62;
  const by = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>;
  for (const g of active.glyphs) by[g.utf8Bytes]++;

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      <line x1={0} y1={H - BOTTOM} x2={W} y2={H - BOTTOM} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {bars.map((b, i) => {
        const h = ((H - BOTTOM - TOP) * b.bytes) / max;
        const x = i * slot + (slot - bw) / 2;
        const on = b.style === activeStyle;
        return (
          <g key={b.key} className={b.style ? "cursor-pointer" : undefined} onClick={b.style ? () => setActiveStyle(b.style!) : undefined}>
            <rect x={x} y={H - BOTTOM - h} width={bw} height={h} rx={3} className={b.fill} opacity={b.style && !on ? 0.55 : 1} style={{ transition: "y 400ms ease, height 400ms ease, opacity 200ms ease" }} />
            <text style={{ fontSize: svgPx(12) }} x={x + bw / 2} y={H - BOTTOM - h - 4} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
              {f(b.bytes)}
            </text>
            <title>{b.label}</title>
            <text style={{ fontSize: svgPx(12) }} x={x + bw / 2} y={H - BOTTOM + 13} textAnchor="middle" fontWeight={on ? 700 : 400} className="fill-zinc-700 dark:fill-zinc-200">
              {styleSample(b.style)}
            </text>
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={H - 6} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
    </svg>
  );

  return (
    <TlIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("four"), value: `${f(by[4])} × 4 = ${f(by[4] * 4)}` },
        { label: t("three"), value: `${f(by[3])} × 3 = ${f(by[3] * 3)}` },
        { label: t("twoOne"), value: f(by[2] * 2 + by[1]) },
        { label: t("total", { style: styleName(active.style) }), value: f(active.utf8), emphasize: true },
        { label: t("plain"), value: f(plain.utf8), note: t("ratio", { r: f(plain.utf8 ? active.utf8 / plain.utf8 : 0, 2) }) },
      ]}
    />
  );
}
