"use client";
import { useTranslations } from "next-intl";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const W = 400;
const H = 122;
const X0 = 10;
const X1 = W - 10;
const ZONES = [
  { key: "opposed", from: -1, to: -0.5, cls: "fill-rose-500/80 dark:fill-rose-400/80" },
  { key: "diverging", from: -0.5, to: 0, cls: "fill-amber-400/80 dark:fill-amber-400/70" },
  { key: "converging", from: 0, to: 0.5, cls: "fill-sky-400/80 dark:fill-sky-400/70" },
  { key: "aligned", from: 0.5, to: 1, cls: "fill-emerald-500/80 dark:fill-emerald-400/80" },
] as const;

/** §31 #19 Zone Strip: cos θ on −1…1, split into four colored direction zones, your value marked. */
export default function VectorCosineZoneStrip() {
  const t = useTranslations("tools.vector-calculator.indicators.cosineZone");
  const tr = useTranslations("tools.vector-calculator.live3d");
  const { r, f, n, opt, na } = useVectorAnalysis();
  const x = (c: number) => X0 + ((c + 1) / 2) * (X1 - X0);
  const zone = r.cos === null ? null : ZONES.find((z) => r.cos! <= z.to) ?? ZONES[3];
  const mx = r.cos === null ? null : x(r.cos);

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div dir="ltr" className="max-w-full">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="block h-auto max-w-full">
            {mx !== null && (
              <>
                <text x={Math.min(Math.max(mx, 40), W - 40)} y={14} textAnchor="middle" className="fill-zinc-900 text-[12px] font-bold dark:fill-zinc-50">cos θ = {n(r.cos!, 3)}</text>
                <path d={`M ${mx - 7} 22 L ${mx + 7} 22 L ${mx} 32 Z`} className="fill-zinc-900 dark:fill-zinc-50" />
              </>
            )}
            {ZONES.map((z) => (
              <g key={z.key}>
                <rect x={x(z.from) + 1} y={36} width={x(z.to) - x(z.from) - 2} height={30} rx={5} className={z.cls} />
                {/* Zone names sit under the strip, so the value marker never crosses them. */}
                <text x={(x(z.from) + x(z.to)) / 2} y={82} textAnchor="middle" className={`text-[10px] font-bold ${zone?.key === z.key ? "fill-zinc-900 dark:fill-zinc-50" : "fill-zinc-500 dark:fill-zinc-400"}`}>{t(`zones.${z.key}`)}</text>
              </g>
            ))}
            {mx !== null && <line x1={mx} x2={mx} y1={33} y2={69} strokeWidth={3} className="stroke-zinc-900 dark:stroke-zinc-50" />}
            {[-1, -0.5, 0, 0.5, 1].map((c) => (
              <text key={c} x={x(c)} y={100} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{c}</text>
            ))}
            <text x={x(-1)} y={116} textAnchor="start" className="fill-zinc-400 text-[9px] dark:fill-zinc-500">180°</text>
            <text x={x(0)} y={116} textAnchor="middle" className="fill-zinc-400 text-[9px] dark:fill-zinc-500">90°</text>
            <text x={x(1)} y={116} textAnchor="end" className="fill-zinc-400 text-[9px] dark:fill-zinc-500">0°</text>
          </svg>
        </div>
      }
      rows={[
        { label: tr("rows.dot"), value: f(r.dot) },
        { label: "|A| × |B|", value: f(r.magA * r.magB) },
        { label: tr("rows.cos"), value: opt(r.cos, 4), emphasize: true },
        { label: t("zone"), value: zone ? t(`zones.${zone.key}`) : na },
        { label: tr("rows.relation"), value: tr(`relation.${r.relation}`) },
      ]}
    />
  );
}
