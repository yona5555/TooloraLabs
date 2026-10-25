"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { RESISTANCE_REFERENCES } from "@tooloralabs/tools";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { pow10, useOhmsModel } from "./OhmsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 400;
const H = 220;
const X0 = 46;
const X1 = W - 46;
const AXIS = 86;

const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-300));

/**
 * Type #10 (Log-Scale Magnitude Bar): your resistance on a powers-of-ten axis next to six everyday
 * resistances, from copper wire to glass. Reference labels sit in evenly spaced slots with leader
 * lines to their true position, so no two labels can overlap at any value.
 */
export default function OhmsResistanceScale() {
  const svgId = useId();
  const t = useTranslations("tools.ohms-law-calculator.education.lab.scale");
  const { a, f } = useOhmsModel();
  if (!a || a.resistance === 0) return <OhmsIndicatorUnavailable title={t("title")} />;

  const R = Math.abs(a.resistance);
  const all = [...RESISTANCE_REFERENCES.map((r) => lg(r.resistance)), lg(R)];
  const lo = Math.floor(Math.min(...all)) - 1;
  const hi = Math.ceil(Math.max(...all)) + 1;
  const sx = (e: number) => X0 + ((e - lo) / (hi - lo)) * (X1 - X0);
  const step = Math.max(1, Math.ceil((hi - lo) / 7));
  const ticks: number[] = [];
  for (let e = Math.ceil(lo / step) * step; e <= hi; e += step) ticks.push(e);
  const refs = RESISTANCE_REFERENCES;
  const slotW = (X1 - X0) / refs.length;
  const x = sx(lg(R));
  const lx = Math.max(80, Math.min(W - 80, x));
  const nearest = [...refs].sort((p, q) => Math.abs(lg(p.resistance) - lg(R)) - Math.abs(lg(q.resistance) - lg(R)))[0];
  const V = Math.abs(a.voltage);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <linearGradient id={`${svgId}ohms-log-grad`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x={X0} y={AXIS - 5} width={X1 - X0} height={10} rx={5} fill={`url(#${svgId}ohms-log-grad)`} opacity={0.85} />
      {ticks.map((e) => (
        <line key={e} x1={sx(e)} y1={AXIS + 5} x2={sx(e)} y2={AXIS + 9} className="stroke-zinc-400 dark:stroke-zinc-500" />
      ))}
      <text style={{ fontSize: svgPx(12) }} x={X0 - 6} y={AXIS + 4} textAnchor="end" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {pow10(lo)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={X1 + 6} y={AXIS + 4} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {pow10(hi)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={X0} y={AXIS - 14} className="fill-blue-600 dark:fill-blue-400">
        {t("conductors")}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={X1} y={AXIS - 14} textAnchor="end" className="fill-amber-600 dark:fill-amber-400">
        {t("insulators")}
      </text>
      {refs.map((r, i) => {
        const rx = sx(lg(r.resistance));
        const slx = X0 + slotW * (i + 0.5);
        const ny = AXIS + (i % 2 === 0 ? 44 : 84);
        return (
          <g key={r.key}>
            <line x1={rx} y1={AXIS + 5} x2={slx} y2={ny - 11} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
            <circle cx={rx} cy={AXIS} r={3} className="fill-zinc-700 dark:fill-zinc-200" />
            <text style={{ fontSize: svgPx(12) }} x={slx} y={ny} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {t(`refs.${r.key}`)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={slx} y={ny + 12} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {`${f(r.resistance, 2)} Ω`}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={slx} y={ny + 23} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-emerald-600 dark:fill-emerald-400">
              {`${f(V / r.resistance, 2)} A`}
            </text>
          </g>
        );
      })}
      <line x1={x} y1={AXIS - 6} x2={lx} y2={30} strokeWidth={1.5} className="stroke-red-600 dark:stroke-red-400" />
      <path d={`M ${x - 5} ${AXIS - 13} L ${x + 5} ${AXIS - 13} L ${x} ${AXIS - 5} z`} className="fill-red-600 dark:fill-red-400" />
      <text style={{ fontSize: svgPx(12) }} x={lx} y={24} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
        {`R = ${f(R)} Ω`}
      </text>
    </svg>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro", { voltage: f(V) })}
      indicator={svg}
      rows={[
        { label: "R", value: `${f(R)} Ω ≈ ${pow10(lg(R))} Ω`, emphasize: true, note: t("nearest", { ref: t(`refs.${nearest.key}`) }) },
        { label: t("ratio", { ref: t(`refs.${nearest.key}`) }), value: `${f(R / nearest.resistance)} ×` },
        { label: t("currentHere"), value: `${f(V)} / ${f(R)} = ${f(V / R)} A` },
        { label: t("span"), value: t("decades", { n: hi - lo }) },
      ]}
    />
  );
}
