"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import { prefixGap } from "@tooloralabs/tools";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW } from "@/components/tool-ui/labelLayout";

const W = 340;
const H = 210;
const L = 36;
const R = 14;
const T = 14;
const B = 32;
const PREFIX = ["", "kilo", "mega", "giga", "tera", "peta"];

/**
 * Type #7 (Trend Line with Highlighted Reference Point): how much bigger a binary unit is than its
 * decimal namesake at each prefix — 2.4 % at kilo, growing to 12.6 % at peta. The point is your size's level.
 */
export default function FsGapTrend() {
  const t = useTranslations("tools.file-size-converter.education.lab.gapTrend");
  const { a, f } = useFsModel();
  if (!a) return <FsIndicatorUnavailable title={t("title")} />;

  const max = prefixGap(5) * 1.1;
  const x = (k: number) => L + ((k - 1) / 4) * (W - L - R);
  const y = (g: number) => Math.round((H - B - (g / max) * (H - B - T)) * 100) / 100;
  const pts = [1, 2, 3, 4, 5].map((k) => ({ k, g: prefixGap(k) }));
  const k = Math.max(1, a.decimalLevel);

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, 5, 10].map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text style={{ fontSize: svgPx(12) }} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {v}%
          </text>
        </g>
      ))}
      <path d={pts.map((p, i) => `${i ? "L" : "M"} ${x(p.k)} ${y(p.g)}`).join(" ")} fill="none" strokeWidth={2.5} className="stroke-amber-500" />
      {pts.map((p) => (
        <g key={p.k}>
          <circle
            cx={x(p.k)}
            cy={y(p.g)}
            r={p.k === k ? 8 : 4}
            strokeWidth={p.k === k ? 2.5 : 0}
            className={p.k === k ? "fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" : "fill-amber-500"}
          />
          <text style={{ fontSize: svgPx(12) }} x={Math.min(x(p.k), W - (labelW(`${f(p.g, 1)}%`) / 2) * 1.15 - 2)} y={y(p.g) - 12} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
            {f(p.g, 1)}%
          </text>
          <text style={{ fontSize: svgPx(12) }} x={x(p.k)} y={H - B + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
            {PREFIX[p.k]}
          </text>
        </g>
      ))}
    </FitSvg>
  );

  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("level"), value: PREFIX[k] },
        { label: t("formula"), value: `1.024^${k} − 1` },
        { label: t("kilo"), value: `${f(prefixGap(1), 2)}%` },
        { label: t("peta"), value: `${f(prefixGap(5), 2)}%` },
        { label: t("yours"), value: `${f(prefixGap(k), 3)}%`, emphasize: true },
      ]}
    />
  );
}
