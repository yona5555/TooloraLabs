"use client";
import { useTranslations } from "next-intl";
import { FORCE_REFERENCES } from "@tooloralabs/tools";
import ForceIndicatorCard from "./ForceIndicatorCard";
import { pow10, useForceModel } from "./ForceLiveContext";

const W = 400;
const H = 230;
const X0 = 46;
const X1 = W - 46;
const AXIS = 96;

const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-300));

/**
 * Type #10 (Log-Scale Magnitude Bar): both computed forces (F = ma and F = Gm₁m₂/r²) placed on a
 * powers-of-ten axis among six real reference forces. Reference labels sit in evenly spaced slots
 * with leader lines to their true position, and the two live markers use separate rows, so no two
 * labels can overlap at any value.
 */
export default function ForceLogScale() {
  const t = useTranslations("tools.force-calculator.education.lab.scale");
  const { secondLaw, gravitation, sl, gr, f } = useForceModel();

  const live = [
    sl ? { key: "secondLaw", label: `F = ma · ${f(secondLaw.force)} N`, v: secondLaw.force, cls: "fill-blue-600 dark:fill-blue-400", stroke: "stroke-blue-600 dark:stroke-blue-400" } : null,
    gr ? { key: "gravitation", label: `Gm₁m₂/r² · ${f(gravitation.force)} N`, v: gravitation.force, cls: "fill-red-600 dark:fill-red-400", stroke: "stroke-red-600 dark:stroke-red-400" } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null && x.v !== 0 && Number.isFinite(x.v));

  const all = [...FORCE_REFERENCES.map((r) => lg(r.force)), ...live.map((l) => lg(l.v))];
  const lo = Math.floor(Math.min(...all)) - 1;
  const hi = Math.ceil(Math.max(...all)) + 1;
  const sx = (e: number) => X0 + ((e - lo) / (hi - lo)) * (X1 - X0);
  const step = Math.max(1, Math.ceil((hi - lo) / 7));
  const ticks: number[] = [];
  for (let e = Math.ceil(lo / step) * step; e <= hi; e += step) ticks.push(e);

  const refs = [...FORCE_REFERENCES].sort((a, b) => a.force - b.force);
  const slotW = (X1 - X0) / refs.length;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <linearGradient id="force-log-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect x={X0} y={AXIS - 5} width={X1 - X0} height={10} rx={5} fill="url(#force-log-grad)" opacity={0.85} />
      {ticks.map((e) => (
        <line key={e} x1={sx(e)} y1={AXIS + 5} x2={sx(e)} y2={AXIS + 9} className="stroke-zinc-400 dark:stroke-zinc-500" />
      ))}
      <text x={X0 - 6} y={AXIS + 4} textAnchor="end" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {pow10(lo)}
      </text>
      <text x={X1 + 6} y={AXIS + 4} fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {pow10(hi)}
      </text>
      {/* reference forces: slot labels on two alternating rows, with leader lines */}
      {refs.map((r, i) => {
        const x = sx(lg(r.force));
        const lx = X0 + slotW * (i + 0.5);
        const ny = AXIS + (i % 2 === 0 ? 44 : 76);
        return (
          <g key={r.key}>
            <line x1={x} y1={AXIS + 5} x2={lx} y2={ny - 11} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
            <circle cx={x} cy={AXIS} r={3} className="fill-zinc-700 dark:fill-zinc-200" />
            <text x={lx} y={ny} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {t(`refs.${r.key}`)}
            </text>
            <text x={lx} y={ny + 12} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {`${f(r.force, 1)} N`}
            </text>
          </g>
        );
      })}
      {/* live forces, one row each */}
      {live.map((l, i) => {
        const x = sx(lg(l.v));
        const y = i === 0 ? 50 : 22;
        const lx = Math.max(70, Math.min(W - 70, x));
        return (
          <g key={l.key}>
            <line x1={x} y1={AXIS - 6} x2={lx} y2={y + 6} strokeWidth={1.5} className={l.stroke} />
            <path d={`M ${x - 5} ${AXIS - 13} L ${x + 5} ${AXIS - 13} L ${x} ${AXIS - 5} z`} className={l.cls} />
            <text x={lx} y={y} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className={l.cls}>
              {l.label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const ratio = sl && gr && gravitation.force !== 0 ? secondLaw.force / gravitation.force : null;
  const nearest = (v: number) => [...FORCE_REFERENCES].sort((a, b) => Math.abs(lg(a.force) - lg(v)) - Math.abs(lg(b.force) - lg(v)))[0];

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...(sl ? [{ label: "F = ma", value: `${f(secondLaw.force)} N ≈ ${pow10(lg(secondLaw.force))}`, note: t("nearest", { ref: t(`refs.${nearest(secondLaw.force).key}`) }) }] : []),
        ...(gr ? [{ label: "Gm₁m₂/r²", value: `${f(gravitation.force)} N ≈ ${pow10(lg(gravitation.force))}`, note: t("nearest", { ref: t(`refs.${nearest(gravitation.force).key}`) }) }] : []),
        ...(ratio !== null ? [{ label: t("ratio"), value: `${f(ratio)} ×`, emphasize: true }] : []),
        { label: t("span"), value: t("decades", { n: hi - lo }) },
      ]}
    />
  );
}
