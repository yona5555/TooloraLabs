"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";
import { circleDistanceForOverlap } from "@tooloralabs/tools";
import ProbabilityIndicatorCard, { REGION_FILL } from "./ProbabilityIndicatorCard";
import { MODE_FIELDS, useProbabilityLive, useProbabilityModel, type ProbabilityFields } from "./ProbabilityLiveContext";

const W = 320;
const H = 210;
const PAD = 10;
const RMAX = 92;

/**
 * The page's "wow" piece: sliders for the current mode's own inputs rewrite the calculator fields
 * live, and an area-proportional Venn diagram (circle areas ∝ P(A), P(B); lens area ∝ P(A∩B),
 * the centre distance solved numerically) redraws on every move. The Result, the 3D grid and
 * every other indicator follow the same sliders.
 */
export default function ProbabilityVennLab() {
  const t = useTranslations("tools.probability-calculator.education.lab.venn");
  const tf = useTranslations("tools.probability-calculator.form.fields");
  const clip = useId().replace(/:/g, "");
  const { mode, fields, setField } = useProbabilityLive();
  const { b, r, symbol, target, pct } = useProbabilityModel();

  // Sample space area K; both circles share one scale so their areas (and the lens) stay proportional.
  const K = (W - 2 * PAD) * (H - 2 * PAD);
  const raw = (p: number) => Math.sqrt((p * K) / Math.PI);
  const s = Math.min(1, RMAX / Math.max(1e-9, raw(Math.max(b.pA, b.pB))));
  const rA0 = Math.max(0.5, raw(b.pA) * s);
  const rB0 = Math.max(0.5, raw(b.pB) * s);
  const d0 = circleDistanceForOverlap(rA0, rB0, b.pAB * K * s * s);
  // Lengths scale linearly, so one extra factor keeps a wide (barely overlapping) pair inside the frame.
  const g = Math.min(1, (W - 2 * PAD - 8) / (rA0 + d0 + rB0));
  const rA = rA0 * g;
  const rB = rB0 * g;
  const d = d0 * g;
  const minX = Math.min(-rA, d - rB);
  const maxX = Math.max(rA, d + rB);
  const cxA = W / 2 - (minX + maxX) / 2;
  const cxB = cxA + d;
  const cy = H / 2;

  const n = (v: string) => {
    const x = parseLocalizedNumber(v);
    return Number.isNaN(x) ? 0 : x;
  };
  const sliderMax = (k: keyof ProbabilityFields) => {
    if (k === "favorable") return Math.max(1, n(fields.total));
    if (k === "total") return Math.max(100, n(fields.total));
    if (k === "pBoth") return Math.max(0, Math.min(n(fields.pA), n(fields.pB)));
    if (k === "pAAndB") return Math.max(0, n(fields.pB));
    return 100;
  };
  const sliderMin = (k: keyof ProbabilityFields) => (k === "total" ? 1 : 0);
  const step = (k: keyof ProbabilityFields) => (k === "favorable" || k === "total" ? 1 : 0.5);

  const diagram = (
    <div className="w-full lg:w-[320px]">
      <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
        <defs>
          <clipPath id={clip}>
            <circle cx={cxA} cy={cy} r={rA} />
          </clipPath>
        </defs>
        <rect x={PAD / 2} y={PAD / 2} width={W - PAD} height={H - PAD} rx={10} className={`${REGION_FILL[3]} opacity-40`} />
        <rect x={PAD / 2} y={PAD / 2} width={W - PAD} height={H - PAD} rx={10} fill="none" className="stroke-zinc-400 dark:stroke-zinc-500" strokeDasharray={target[3] ? undefined : "4 3"} />
        <circle cx={cxA} cy={cy} r={rA} className={REGION_FILL[1]} fillOpacity={target[1] ? 0.85 : 0.35} />
        <circle cx={cxB} cy={cy} r={rB} className={REGION_FILL[2]} fillOpacity={target[2] ? 0.85 : 0.35} />
        <circle cx={cxB} cy={cy} r={rB} clipPath={`url(#${clip})`} className={REGION_FILL[0]} fillOpacity={0.95} />
        <circle cx={cxA} cy={cy} r={rA} fill="none" strokeWidth={2} className="stroke-blue-700 dark:stroke-blue-300" />
        <circle cx={cxB} cy={cy} r={rB} fill="none" strokeWidth={2} className="stroke-emerald-700 dark:stroke-emerald-300" />
        <text x={Math.max(14, cxA - rA * 0.55)} y={cy + 4} textAnchor="middle" className="fill-zinc-900 font-mono text-[11px] font-bold dark:fill-white">{pct(b.aOnly, 1)}</text>
        <text x={Math.min(W - 14, cxB + rB * 0.55)} y={cy + 4} textAnchor="middle" className="fill-zinc-900 font-mono text-[11px] font-bold dark:fill-white">{pct(b.bOnly, 1)}</text>
        {b.pAB > 0 && (
          <text x={(cxA + rA + cxB - rB) / 2} y={cy + 4} textAnchor="middle" className="fill-white font-mono text-[11px] font-bold">{pct(b.pAB, 1)}</text>
        )}
        <text x={PAD + 4} y={22} className="fill-blue-700 text-[12px] font-bold dark:fill-blue-300">{`A ${pct(b.pA, 1)}`}</text>
        <text x={W - PAD - 4} y={22} textAnchor="end" className="fill-emerald-700 text-[12px] font-bold dark:fill-emerald-300">{`B ${pct(b.pB, 1)}`}</text>
        <text x={W - PAD - 4} y={H - 14} textAnchor="end" className="fill-zinc-600 font-mono text-[11px] font-semibold dark:fill-zinc-300">{`A′∩B′ ${pct(b.neither, 1)}`}</text>
        <text x={PAD + 4} y={H - 14} className="fill-zinc-900 font-mono text-[12px] font-bold dark:fill-white">{`${symbol} = ${pct(r)}`}</text>
      </svg>
      <div className="mt-3 space-y-2">
        {MODE_FIELDS[mode].map((k) => (
          <label key={k} className="block">
            <span className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <span>{tf(k)}</span>
              <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{fields[k]}</span>
            </span>
            <input
              type="range"
              min={sliderMin(k)}
              max={sliderMax(k)}
              step={step(k)}
              value={Math.min(sliderMax(k), Math.max(sliderMin(k), n(fields[k])))}
              onChange={(e) => setField(k, e.target.value)}
              className="w-full accent-blue-600"
              aria-label={tf(k)}
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={mode === "single" ? `${t("intro")} ${t("singleNote")}` : t("intro")}
      indicator={diagram}
      rows={[
        { label: "P(A)", value: pct(b.pA) },
        { label: "P(B)", value: pct(b.pB) },
        { label: "P(A∩B)", value: pct(b.pAB) },
        { label: "P(A∪B)", value: `${pct(b.pA)} + ${pct(b.pB)} − ${pct(b.pAB)} = ${pct(b.union)}` },
        { label: t("areaCheck"), value: `${pct(b.aOnly)} + ${pct(b.pAB)} + ${pct(b.bOnly)} + ${pct(b.neither)} = 100%` },
        { label: symbol, value: pct(r), emphasize: true },
      ]}
    />
  );
}
