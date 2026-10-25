"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const L = 36;
const R = 10;
const T = 14;
const B = 32;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): Base64 length against input bytes. The line
 * climbs in steps of four characters every three bytes, above the straight 4/3 line; the gap is padding.
 */
export default function B64GrowthSteps() {
  const t = useTranslations("tools.base64-tool.education.lab.growth");
  const { a, f } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const n = a.byteCount;
  const maxN = Math.max(12, Math.min(96, Math.ceil((n * 1.5) / 3) * 3));
  const maxY = 4 * Math.ceil(maxN / 3);
  const x = (v: number) => L + (v / maxN) * (W - L - R);
  const y = (v: number) => H - B - (v / maxY) * (H - B - T);
  const steps = Array.from({ length: maxN + 1 }, (_, k) => k)
    .map((k) => `${k ? "L" : "M"} ${x(k)} ${y(4 * Math.ceil(k / 3))}${k < maxN ? ` H ${x(k + 1)}` : ""}`)
    .join(" ");
  const shownN = Math.min(n, maxN);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, Math.round(maxY / 2), maxY].map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text style={{ fontSize: svgPx(12) }} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {v}
          </text>
        </g>
      ))}
      {[0, Math.round(maxN / 2), maxN].map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {v}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
      <line x1={x(0)} y1={y(0)} x2={x(maxN)} y2={y((maxN * 4) / 3)} strokeDasharray="4 4" className="stroke-zinc-400 dark:stroke-zinc-500" />
      <path d={steps} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      <circle cx={x(shownN)} cy={y(4 * Math.ceil(shownN / 3))} r={7} strokeWidth={2.5} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" />
      <text style={{ fontSize: svgPx(12) }} x={Math.min(x(shownN) + 10, W - 90)} y={Math.max(y(4 * Math.ceil(shownN / 3)) - 10, 14)} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
        {n > maxN ? t("youOff", { n: f(n), c: f(a.paddedLength) }) : t("you", { c: f(a.paddedLength) })}
      </text>
    </svg>
  );

  const nextFull = Math.ceil(n / 3) * 3;
  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("bytes"), value: f(n) },
        { label: t("exact"), value: f((n * 4) / 3, 2) },
        { label: t("actual"), value: f(a.paddedLength) },
        { label: t("free"), value: nextFull > n ? t("freeValue", { k: nextFull - n }) : "0" },
        { label: t("ratio"), value: f(a.paddedLength / Math.max(1, n), 3), emphasize: true },
      ]}
    />
  );
}
