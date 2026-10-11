"use client";
import { useTranslations } from "next-intl";
import { ENERGY_REFERENCES } from "@tooloralabs/tools";
import EnergyIndicatorCard from "./EnergyIndicatorCard";
import { pow10, useEnergyModel } from "./EnergyLiveContext";

const W = 400;
const H = 230;
const X0 = 46;
const X1 = W - 46;
const AXIS = 100;
const ROWS = [72, 47, 22] as const;

const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-300));

/**
 * Type #10 (Log-Scale Magnitude Bar): the three computed energies (W, KE, PE) placed on a
 * powers-of-ten axis among six real reference energies. Reference labels sit in evenly spaced slots
 * on two alternating rows with leader lines; each live marker has its own row, so no two labels
 * can overlap at any value.
 */
export default function EnergyLogScale() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.scale");
  const { work, kinetic, potential, f } = useEnergyModel();

  const live = [
    { key: "W", v: work.work, cls: "fill-red-600 dark:fill-red-400", stroke: "stroke-red-600 dark:stroke-red-400" },
    { key: "KE", v: kinetic.kineticEnergy, cls: "fill-emerald-600 dark:fill-emerald-400", stroke: "stroke-emerald-600 dark:stroke-emerald-400" },
    { key: "PE", v: potential.potentialEnergy, cls: "fill-blue-600 dark:fill-blue-400", stroke: "stroke-blue-600 dark:stroke-blue-400" },
  ].filter((x) => x.v !== 0 && Number.isFinite(x.v));

  const all = [...ENERGY_REFERENCES.map((r) => lg(r.energy)), ...live.map((l) => lg(l.v))];
  const lo = Math.floor(Math.min(...all)) - 1;
  const hi = Math.ceil(Math.max(...all)) + 1;
  const sx = (e: number) => X0 + ((e - lo) / (hi - lo)) * (X1 - X0);
  const step = Math.max(1, Math.ceil((hi - lo) / 7));
  const ticks: number[] = [];
  for (let e = Math.ceil(lo / step) * step; e <= hi; e += step) ticks.push(e);
  const slotW = (X1 - X0) / ENERGY_REFERENCES.length;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <linearGradient id="energy-log-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect x={X0} y={AXIS - 5} width={X1 - X0} height={10} rx={5} fill="url(#energy-log-grad)" opacity={0.85} />
      {ticks.map((e) => (
        <line key={e} x1={sx(e)} y1={AXIS + 5} x2={sx(e)} y2={AXIS + 9} className="stroke-zinc-400 dark:stroke-zinc-500" />
      ))}
      <text x={X0 - 6} y={AXIS + 4} textAnchor="end" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {pow10(lo)}
      </text>
      <text x={X1 + 6} y={AXIS + 4} fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {pow10(hi)}
      </text>
      {ENERGY_REFERENCES.map((r, i) => {
        const x = sx(lg(r.energy));
        const lx = X0 + slotW * (i + 0.5);
        const ny = AXIS + (i % 2 === 0 ? 44 : 80);
        return (
          <g key={r.key}>
            <line x1={x} y1={AXIS + 5} x2={lx} y2={ny - 11} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
            <circle cx={x} cy={AXIS} r={3} className="fill-zinc-700 dark:fill-zinc-200" />
            <text x={lx} y={ny} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {t(`refs.${r.key}`)}
            </text>
            <text x={lx} y={ny + 12} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {`${f(r.energy, 1)} J`}
            </text>
          </g>
        );
      })}
      {live.map((l, i) => {
        const x = sx(lg(l.v));
        const y = ROWS[i];
        const lx = Math.max(70, Math.min(W - 70, x));
        return (
          <g key={l.key}>
            <line x1={x} y1={AXIS - 6} x2={lx} y2={y + 4} strokeWidth={1.5} className={l.stroke} />
            <path d={`M ${x - 5} ${AXIS - 13} L ${x + 5} ${AXIS - 13} L ${x} ${AXIS - 5} z`} className={l.cls} />
            <text x={lx} y={y} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className={l.cls}>
              {`${l.key} · ${f(l.v)} J`}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const nearest = (v: number) => [...ENERGY_REFERENCES].sort((a, b) => Math.abs(lg(a.energy) - lg(v)) - Math.abs(lg(b.energy) - lg(v)))[0];

  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...live.map((l) => ({ label: l.key, value: `${f(l.v)} J ≈ ${pow10(lg(l.v))}`, note: t("nearest", { ref: t(`refs.${nearest(l.v).key}`) }) })),
        ...(kinetic.kineticEnergy !== 0 && potential.potentialEnergy !== 0
          ? [{ label: "KE / PE", value: `${f(kinetic.kineticEnergy / potential.potentialEnergy)} ×`, emphasize: true }]
          : []),
        { label: t("span"), value: t("decades", { n: hi - lo }) },
      ]}
    />
  );
}
