"use client";
import { useTranslations } from "next-intl";
import { accelerationZone, KINEMATICS_G0 } from "@tooloralabs/tools";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { r2, useKinModel } from "./KinLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 400;
const H = 150;
const L = 16;
const R = 384;
const Y = 58;
const BAND = 26;
const MAX = 30;
const GRAVITY = 9.8;
const ZONES = [
  { key: "gentle", from: 0, to: GRAVITY, cls: "fill-emerald-500/80 dark:fill-emerald-400/70" },
  { key: "strong", from: GRAVITY, to: 20, cls: "fill-amber-500/80 dark:fill-amber-400/70" },
  { key: "extreme", from: 20, to: MAX, cls: "fill-red-500/80 dark:fill-red-400/70" },
] as const;

/**
 * Type #19 (Zone Strip): the size of the live acceleration |a| on the calculator's own scale —
 * gentle below Earth's gravity, strong up to 20 m/s², extreme beyond — with the g mark and the
 * value in g.
 */
export default function KinAccelerationZones() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.zones");
  const tg = useTranslations("tools.kinematics-calculator.gauge");
  const { k, f } = useKinModel();
  if (!k) return <KinIndicatorUnavailable title={t("title")} />;

  const abs = Math.abs(k.a);
  const px = (v: number) => r2(L + (Math.min(MAX, Math.max(0, v)) / MAX) * (R - L));
  const zone = accelerationZone(k.a, GRAVITY);
  const mx = px(abs);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {ZONES.map((z) => (
        <g key={z.key}>
          <rect x={px(z.from)} y={Y} width={r2(px(z.to) - px(z.from))} height={BAND} className={z.cls} />
          <text style={{ fontSize: svgPx(12) }} x={r2((px(z.from) + px(z.to)) / 2)} y={Y + BAND + 30} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">{tg(z.key)}</text>
        </g>
      ))}
      {[0, GRAVITY, 20, MAX].map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={px(v)} y={Y + BAND + 14} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{f(v, 1)}</text>
      ))}
      <line x1={px(KINEMATICS_G0)} y1={Y - 6} x2={px(KINEMATICS_G0)} y2={Y + BAND + 3} strokeWidth={1.5} strokeDasharray="3 2" className="stroke-zinc-700 dark:stroke-zinc-200" />
      {/* marker for |a| */}
      <path d={`M${mx - 7},${Y - 16} L${mx + 7},${Y - 16} L${mx},${Y - 4} Z`} className="fill-blue-700 dark:fill-blue-300" />
      <text style={{ fontSize: svgPx(12) }} x={Math.min(R - 60, Math.max(L + 60, mx))} y={Y - 22} textAnchor="middle" fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {`|a| = ${f(abs)} m/s²${abs > MAX ? " →" : ""}`}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={R} y={H - 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">m/s²</text>
    </svg>
  );

  return (
    <KinIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("magnitude"), value: `|a| = ${f(abs)} m/s²` },
        { label: t("inG"), value: `${f(abs)} / ${KINEMATICS_G0} = ${f(Math.abs(k.gForce), 3)} g` },
        { label: t("to100"), value: Number.isFinite(k.timeTo100kmh) ? `27.78 / ${f(abs)} = ${f(k.timeTo100kmh)} s` : "∞" },
        { label: t("zone"), value: tg(zone), emphasize: true, note: t("zoneNote") },
      ]}
    />
  );
}
