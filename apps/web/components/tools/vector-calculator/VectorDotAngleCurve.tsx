"use client";
import { useTranslations } from "next-intl";
import { dotVsAngleCurve } from "@tooloralabs/tools";
import VectorIndicatorCard from "./VectorIndicatorCard";
import { useVectorAnalysis } from "./VectorLiveContext";

const W = 340;
const H = 200;
const PAD = { l: 44, r: 12, t: 14, b: 30 };

/** §31 #7 Trend Line with Highlighted Reference Point: A·B = |A||B|cos θ over 0°–180°, your θ marked. */
export default function VectorDotAngleCurve() {
  const t = useTranslations("tools.vector-calculator.indicators.dotCurve");
  const tr = useTranslations("tools.vector-calculator.live3d.rows");
  const { r, f, n, deg, opt } = useVectorAnalysis();
  const peak = r.magA * r.magB;
  const span = Math.max(peak, 1e-9);
  const curve = dotVsAngleCurve(r.magA, r.magB, 60);
  const x = (d: number) => PAD.l + (d / 180) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + ((span - v) / (2 * span)) * (H - PAD.t - PAD.b);
  const path = curve.map((p, i) => `${i ? "L" : "M"} ${x(p.deg).toFixed(1)} ${y(p.dot).toFixed(1)}`).join(" ");
  const has = r.angleDeg !== null;
  const px = x(r.angleDeg ?? 0);
  const py = y(r.dot);
  const anchor = (r.angleDeg ?? 0) > 120 ? "end" : "start";

  return (
    <VectorIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={
        <div dir="ltr" className="max-w-full">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="block h-auto max-w-full">
            {[span, 0, -span].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className={v === 0 ? "stroke-zinc-400 dark:stroke-zinc-500" : "stroke-zinc-200 dark:stroke-zinc-700"} strokeDasharray={v === 0 ? undefined : "4 4"} />
                <text x={PAD.l - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{n(v, 2)}</text>
              </g>
            ))}
            {[0, 45, 90, 135, 180].map((d) => (
              <text key={d} x={x(d)} y={H - PAD.b + 16} textAnchor="middle" className="fill-zinc-500 text-[10px] dark:fill-zinc-400">{d}°</text>
            ))}
            <text x={W - PAD.r} y={H - 2} textAnchor="end" className="fill-zinc-400 text-[9px] dark:fill-zinc-500">{t("axisAngle")}</text>
            <path d={path} fill="none" strokeWidth={3} className="stroke-blue-500 dark:stroke-blue-400" />
            {has && (
              <>
                <line x1={px} x2={px} y1={y(span)} y2={y(-span)} strokeDasharray="3 3" className="stroke-amber-500" />
                <circle cx={px} cy={py} r={7} className="fill-amber-500 stroke-white dark:stroke-zinc-900" strokeWidth={2} />
                <text x={anchor === "end" ? px - 10 : px + 10} y={Math.max(PAD.t + 10, py - 10)} textAnchor={anchor} className="fill-amber-700 text-[11px] font-bold dark:fill-amber-300">
                  A·B = {n(r.dot, 2)}
                </text>
              </>
            )}
          </svg>
        </div>
      }
      rows={[
        { label: t("peak"), value: f(peak) },
        { label: tr("angleDeg"), value: deg(r.angleDeg) },
        { label: tr("cos"), value: opt(r.cos, 4) },
        { label: t("atRight"), value: f(0) },
        { label: t("current"), value: `${n(peak, 3)} × ${r.cos === null ? "0" : n(r.cos, 4)} = ${f(r.dot)}`, emphasize: true },
      ]}
    />
  );
}
