"use client";
import { useTranslations } from "next-intl";
import { relationKind } from "@tooloralabs/tools";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel } from "./GcfLcmLiveContext";

const W = 340;
const H = 96;
const PAD = 14;
const ZONES = [
  { key: "coprime", from: 0, to: 0.08, cls: "fill-zinc-300 dark:fill-zinc-600" },
  { key: "weak", from: 0.08, to: 0.34, cls: "fill-sky-300 dark:fill-sky-700" },
  { key: "strong", from: 0.34, to: 0.92, cls: "fill-blue-400 dark:fill-blue-600" },
  { key: "divides", from: 0.92, to: 1, cls: "fill-emerald-400 dark:fill-emerald-600" },
] as const;

/**
 * Type #19 (Zone Strip): how much of the smallest number the GCF covers (GCF ÷ min), from
 * "coprime" (only 1 is shared) to "divides" (the smallest number divides all the others).
 */
export default function GcfLcmRelationZoneStrip() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.zones");
  const tr = useTranslations("tools.gcf-lcm-calculator.live3d.relations");
  const { nums, result, f } = useGcfLcmModel();
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const kind = relationKind(nums);
  const ratio = result.gcf / min;
  const pos = kind === "coprime" ? 0.04 : kind === "divides" || kind === "equal" ? 0.96 : Math.min(0.9, Math.max(0.1, ratio));
  const zone = kind === "coprime" ? "coprime" : kind === "divides" || kind === "equal" ? "divides" : ratio < 0.34 ? "weak" : "strong";
  const x = (v: number) => PAD + v * (W - 2 * PAD);

  const strip = (
    <div className="w-full lg:w-[340px]">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} className="mx-auto block max-w-full" role="img" aria-label={t("title")}>
        {ZONES.map((z) => (
          <g key={z.key}>
            <rect x={x(z.from) + 1} y={34} width={x(z.to) - x(z.from) - 2} height={22} rx={4} className={z.cls} fillOpacity={z.key === zone ? 1 : 0.45} />
            <text x={(x(z.from) + x(z.to)) / 2} y={72} textAnchor="middle" className={`text-[10px] font-semibold ${z.key === zone ? "fill-zinc-900 dark:fill-white" : "fill-zinc-400"}`}>
              {t(`zone.${z.key}`)}
            </text>
          </g>
        ))}
        <text x={x(0)} y={88} className="fill-zinc-400 font-mono text-[9px]">1/min</text>
        <text x={x(1)} y={88} textAnchor="end" className="fill-zinc-400 font-mono text-[9px]">1</text>
        <polygon points={`${x(pos) - 7},18 ${x(pos) + 7},18 ${x(pos)},30`} className="fill-zinc-800 dark:fill-zinc-100" />
        <text x={Math.min(W - 60, Math.max(60, x(pos)))} y={13} textAnchor="middle" className="fill-zinc-800 font-mono text-[11px] font-bold dark:fill-zinc-100">
          {`${f(result.gcf)} / ${f(min)} = ${f(ratio, 3)}`}
        </text>
      </svg>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={strip}
      rows={[
        { label: "GCF", value: f(result.gcf) },
        { label: t("smallest"), value: f(min) },
        { label: "GCF ÷ min", value: `${f(ratio * 100, 1)}%` },
        { label: "LCM ÷ max", value: `× ${f(result.lcm / max)}` },
        { label: t("verdict"), value: tr(kind), emphasize: true },
      ]}
    />
  );
}
