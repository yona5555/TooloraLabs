"use client";
import { useTranslations } from "next-intl";
import { workAngleCurve } from "@tooloralabs/tools";
import EnergyIndicatorCard, { EnergyIndicatorUnavailable } from "./EnergyIndicatorCard";
import { useEnergyModel } from "./EnergyLiveContext";

const W = 340;
const H = 220;
const L = 46;
const R = 330;
const T = 22;
const B = 178;
const MID = (T + B) / 2;

/** Any angle folded onto 0…180° (cos is even and 360°-periodic). */
const fold = (deg: number) => Math.abs((((deg % 360) + 540) % 360) - 180);

/**
 * Type #7 (Trend Line with Highlighted Reference Point): W(θ) = F d cos θ from 0° to 180° for
 * your force and distance, positive work shaded green, negative red, the current angle as the
 * highlighted point and 90° (no work) marked.
 */
export default function EnergyWorkAngleTrend() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.angle");
  const { work: w, f } = useEnergyModel();
  if (w.alignedWork === 0) return <EnergyIndicatorUnavailable title={t("title")} />;

  const Wmax = Math.abs(w.alignedWork);
  const sx = (a: number) => L + (a / 180) * (R - L);
  const sy = (v: number) => MID - (v / Wmax) * (MID - T);
  const curve = workAngleCurve(w.force, w.distance, 61);
  const path = curve.map((p, i) => `${i ? "L" : "M"} ${sx(p.angle).toFixed(2)} ${sy(p.work).toFixed(2)}`).join(" ");
  const pos = curve.filter((p) => p.angle <= 90);
  const neg = curve.filter((p) => p.angle >= 90);
  const area = (pts: typeof curve) => `M ${sx(pts[0].angle)} ${MID} ${pts.map((p) => `L ${sx(p.angle).toFixed(2)} ${sy(p.work).toFixed(2)}`).join(" ")} L ${sx(pts[pts.length - 1].angle)} ${MID} z`;
  const posCls = w.alignedWork > 0 ? "fill-emerald-500/20 dark:fill-emerald-400/20" : "fill-red-500/20 dark:fill-red-400/20";
  const negCls = w.alignedWork > 0 ? "fill-red-500/20 dark:fill-red-400/20" : "fill-emerald-500/20 dark:fill-emerald-400/20";
  const a = fold(w.angleDegrees);
  const cx = sx(a);
  const cy = sy(w.work);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <path d={area(pos)} className={posCls} />
      <path d={area(neg)} className={negCls} />
      <line x1={L} y1={MID} x2={R} y2={MID} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <line x1={L} y1={T} x2={L} y2={B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {[0, 45, 90, 135, 180].map((d) => (
        <text key={d} x={sx(d)} y={B + 14} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {`${d}°`}
        </text>
      ))}
      {[1, 0, -1].map((k) => (
        <text key={k} x={L - 5} y={sy(k * Wmax) + 3} textAnchor="end" fontSize={9.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {f(k * w.alignedWork, 2)}
        </text>
      ))}
      <text x={R} y={B + 30} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {t("xLabel")}
      </text>
      <text x={L + 4} y={T - 8} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {t("yLabel")}
      </text>
      <path d={path} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      <line x1={sx(90)} y1={T} x2={sx(90)} y2={B} strokeDasharray="3 3" className="stroke-zinc-400 dark:stroke-zinc-500" />
      <circle cx={cx} cy={cy} r={7} className="fill-red-600 dark:fill-red-400" />
      <text x={cx > W / 2 ? cx - 10 : cx + 10} y={cy < MID ? cy + 18 : cy - 10} textAnchor={cx > W / 2 ? "end" : "start"} fontSize={11.5} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
        {`${f(a, 1)}° → ${f(w.work, 2)} J`}
      </text>
    </svg>
  );

  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "F d", value: `${f(w.force)} × ${f(w.distance)} = ${f(w.alignedWork)} J` },
        { label: `cos ${f(w.angleDegrees)}°`, value: f(w.share, 4) },
        { label: "W", value: `${f(w.alignedWork)} × ${f(w.share, 4)} = ${f(w.work)} J`, emphasize: true, note: t(w.sign) },
        { label: "W (90°)", value: "0 J", note: t("zeroAt") },
        { label: "W (180°)", value: `${f(-w.alignedWork)} J` },
      ]}
    />
  );
}
