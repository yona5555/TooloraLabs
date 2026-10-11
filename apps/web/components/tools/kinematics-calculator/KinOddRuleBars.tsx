"use client";
import { useTranslations } from "next-intl";
import KinIndicatorCard, { KinIndicatorUnavailable } from "./KinIndicatorCard";
import { r2, useKinModel } from "./KinLiveContext";

const W = 400;
const H = 230;
const L = 10;
const R = 390;
const T = 26;
const B = 196;

/**
 * Type #1 (Labeled Bar Chart): the displacement covered in each of eight equal time intervals.
 * Under constant acceleration consecutive bars always differ by the same a·Δt²; from rest they
 * follow Galileo's odd-number rule 1 : 3 : 5 : 7 …
 */
export default function KinOddRuleBars() {
  const t = useTranslations("tools.kinematics-calculator.education.lab.oddRule");
  const { k, f } = useKinModel();
  if (!k || k.span <= 0) return <KinIndicatorUnavailable title={t("title")} />;

  const d = k.intervalDx;
  const n = d.length;
  const dt = k.span / n;
  const lo = Math.min(0, ...d);
  const hi = Math.max(0, ...d);
  const py = (v: number) => r2(B - (hi - lo > 1e-12 ? ((v - lo) / (hi - lo)) * (B - T) : 0));
  const zero = py(0);
  const slot = (R - L) / n;
  const bw = slot * 0.64;
  const first = d[0];
  const ratio = (v: number) => (Math.abs(first) > 1e-12 ? v / first : NaN);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      <line x1={L} y1={zero} x2={R} y2={zero} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
      {d.map((v, i) => {
        const x = r2(L + slot * i + (slot - bw) / 2);
        const y = py(v);
        const top = Math.min(y, zero);
        const rt = ratio(v);
        return (
          <g key={i}>
            <rect x={x} y={top} width={r2(bw)} height={r2(Math.max(1, Math.abs(zero - y)))} rx={3} className={v < 0 ? "fill-amber-500 dark:fill-amber-400" : "fill-blue-600 dark:fill-blue-400"} />
            <text x={r2(x + bw / 2)} y={r2(v >= 0 ? top - 5 : top + Math.abs(zero - y) + 12)} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">{f(v, 1)}</text>
            <text x={r2(x + bw / 2)} y={B + 14} textAnchor="middle" fontSize={9.5} className="fill-zinc-500 dark:fill-zinc-400">{Number.isFinite(rt) ? `×${f(rt, 1)}` : "—"}</text>
          </g>
        );
      })}
      <text x={L} y={14} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{`Δx (m) · Δt = ${f(dt, 2)} s`}</text>
      <text x={R} y={B + 30} textAnchor="end" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{t("axis")}</text>
    </svg>
  );

  return (
    <KinIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("step"), value: `Δt = ${f(k.span)} / ${n} = ${f(dt, 3)} s` },
        { label: t("first"), value: `${f(k.v0)} × ${f(dt, 3)} + ½ × ${f(k.a)} × ${f(dt, 3)}² = ${f(first, 3)} m` },
        { label: t("last"), value: `${f(d[n - 1], 3)} m` },
        { label: t("difference"), value: `a Δt² = ${f(k.a)} × ${f(dt, 3)}² = ${f(k.a * dt * dt, 3)} m`, emphasize: true, note: t("differenceNote") },
      ]}
    />
  );
}
