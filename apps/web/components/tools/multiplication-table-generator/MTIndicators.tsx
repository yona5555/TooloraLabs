"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  mtCellsWithProduct,
  mtDigitalRoot,
  mtDigitalRootRow,
  mtDistinctProducts,
  mtDistinctTrend,
  mtDistributive,
  mtFactorPairs,
  mtFriendlySplit,
  mtGridSum,
  mtHardFacts,
  mtMemorySteps,
  mtNeighbours,
  mtPrimeFactors,
  mtRowSum,
  mtUnitsCycle,
} from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import SensitivityBars from "@/components/tools/markets/SensitivityBars";
import type { MtView, PickFact } from "./types";

type P = { view: MtView; onPick: PickFact };

function useInd() {
  return useTranslations("tools.multiplication-table-generator.ind");
}

/** Up to `size` multipliers centred on the selected one, so long tables stay readable. */
function windowAround(list: number[], centre: number, size: number) {
  if (list.length <= size) return list;
  const i = Math.max(0, list.indexOf(centre));
  const start = Math.min(Math.max(0, i - Math.floor(size / 2)), list.length - size);
  return list.slice(start, start + size);
}

const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const sup = (n: number) => (n === 1 ? "" : String(n).replace(/\d/g, (d) => SUP[d]));
export const primeString = (n: number) => (n === 1 ? "1" : mtPrimeFactors(n).map(([p, e]) => `${p}${sup(e)}`).join(" × "));

/** 56 → 11 → 2: the repeated digit sums down to the digital root. */
export function digitChain(n: number) {
  const chain = [n];
  let x = n;
  while (x >= 10) {
    x = String(x)
      .split("")
      .reduce((s, d) => s + Number(d), 0);
    chain.push(x);
  }
  return chain;
}

/* 2 — §31 type 1: every product of the row as a labelled bar; tap a bar to pick that fact. */
export function ProductBars({ view, onPick }: P) {
  const t = useInd();
  const f = view.fmt;
  const shown = windowAround(view.multipliers, view.b, 20);
  const max = view.a * shown[shown.length - 1] || 1;
  const last = view.multipliers[view.multipliers.length - 1];
  return (
    <IndicatorCard
      id="product-bars"
      title={t("bars.title")}
      heading={t("bars.heading", { a: f(view.a) })}
      intro={t("bars.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("bars.rowSelected"), value: `${f(view.a)} × ${f(view.b)} = ${f(view.product)}` },
          { label: t("bars.rowStep"), value: `+${f(view.a)}` },
          { label: t("bars.rowTallest"), value: `${f(view.a)} × ${f(last)} = ${f(view.a * last)}` },
          { label: t("bars.rowHeight"), value: `${f(view.product)} ÷ ${f(max)}` },
          { label: t("bars.rowResult"), value: `${f(Math.round((view.product / max) * 100))}%`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex h-56 items-end gap-1" data-testid="mt-bars">
        {shown.map((m) => {
          const v = view.a * m;
          const on = m === view.b;
          return (
            <button key={m} type="button" onClick={() => onPick(view.a, m)} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end" aria-label={`${view.a} × ${m} = ${v}`}>
              <span className={`mb-0.5 max-w-full truncate font-mono text-[10px] font-bold ${on ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-300"}`}>{f(v)}</span>
              <span
                className={`w-full rounded-t-md transition-all duration-500 ${on ? "bg-emerald-500" : "bg-blue-500/80 group-hover:bg-blue-600 dark:bg-blue-400/70"}`}
                style={{ height: `${Math.max(2, (v / max) * 82)}%` }}
              />
              <span className={`mt-1 font-mono text-[10px] ${on ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>×{f(m)}</span>
            </button>
          );
        })}
      </div>
    </IndicatorCard>
  );
}

function GroupRows({ size, count, f, tone }: { size: number; count: number; f: MtView["fmt"]; tone: string }) {
  const t = useInd();
  const rows = Math.min(count, 10);
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-2">
          <span dir="ltr" className="flex min-w-0 flex-1 flex-wrap gap-[3px]">
            {size <= 20 ? (
              Array.from({ length: size }, (_, i) => <i key={i} className={`inline-block h-2.5 w-2.5 rounded-full ${tone}`} />)
            ) : (
              <span className={`flex h-2.5 w-full items-center rounded-full ${tone}`} />
            )}
          </span>
          <span dir="ltr" className="w-14 shrink-0 text-end font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
            {f(size * (r + 1))}
          </span>
        </div>
      ))}
      {count > rows && <p className="text-[11px] text-zinc-400">{t("array.more", { n: f(count - rows) })}</p>}
    </div>
  );
}

/* 3 — §31 type 4: the same product as b rows of a dots and as a rows of b dots. */
export function ArrayModel({ view }: P) {
  const t = useInd();
  const f = view.fmt;
  return (
    <IndicatorCard
      id="array-model"
      title={t("array.title")}
      heading={t("array.heading", { a: f(view.a), b: f(view.b) })}
      intro={t("array.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("array.rowLeft", { b: f(view.b), a: f(view.a) }), value: view.b <= 4 ? Array(view.b).fill(f(view.a)).join(" + ") : `${f(view.a)} + … + ${f(view.a)}` },
          { label: t("array.rowRight", { a: f(view.a), b: f(view.b) }), value: view.a <= 4 ? Array(view.a).fill(f(view.b)).join(" + ") : `${f(view.b)} + … + ${f(view.b)}` },
          { label: t("array.rowDots"), value: f(view.product) },
          { label: t("array.rowResult"), value: `${f(view.a)} × ${f(view.b)} = ${f(view.b)} × ${f(view.a)}`, emphasize: true },
        ],
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2" data-testid="mt-array">
        <div className="rounded-xl border border-blue-200 p-3 dark:border-blue-500/30">
          <p className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-300">{t("array.left", { b: f(view.b), a: f(view.a) })}</p>
          <GroupRows size={view.a} count={view.b} f={f} tone="bg-blue-500" />
        </div>
        <div className="rounded-xl border border-violet-200 p-3 dark:border-violet-500/30">
          <p className="mb-2 text-xs font-semibold text-violet-700 dark:text-violet-300">{t("array.right", { a: f(view.a), b: f(view.b) })}</p>
          <GroupRows size={view.b} count={view.a} f={f} tone="bg-violet-500" />
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 4 — §31 type 14: a balance with a × b on one pan and a × c + a × d on the other. */
export function DistributiveBalance({ view }: P) {
  const t = useInd();
  const f = view.fmt;
  const [b1, b2] = mtFriendlySplit(view.b);
  const [cut, setCut] = useState({ b: view.b, c: b1, d: b2 });
  // A new fact resets the pans to its friendly split (state derived from props, no effect needed).
  const { c, d } = cut.b === view.b ? cut : { c: b1, d: b2 };
  const set = (patch: Partial<{ c: number; d: number }>) => setCut({ b: view.b, c, d, ...patch });
  const left = view.product;
  const right = view.a * c + view.a * d;
  const diff = right - left;
  const tilt = Math.max(-18, Math.min(18, (diff / Math.max(left, 1)) * 30));
  const balanced = diff === 0;
  const sliderMax = Math.max(view.b, 12);
  const ok = mtDistributive(view.a, view.b, c);
  return (
    <IndicatorCard
      id="balance"
      title={t("balance.title")}
      heading={t("balance.heading", { a: f(view.a), b: f(view.b) })}
      intro={t("balance.intro")}
      controls={
        <div className="grid gap-3 sm:grid-cols-2">
          {(["c", "d"] as const).map((k) => (
            <label key={k} className="block">
              <span className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                {t(k === "c" ? "balance.sliderC" : "balance.sliderD")}
                <b dir="ltr" className="font-mono text-zinc-800 dark:text-zinc-100">
                  {f(k === "c" ? c : d)}
                </b>
              </span>
              <input type="range" min={0} max={sliderMax} value={k === "c" ? c : d} onChange={(e) => set({ [k]: Number(e.target.value) })} data-testid={`mt-balance-${k}`} className="w-full accent-blue-600" />
            </label>
          ))}
        </div>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("balance.rowLeft"), value: `${f(view.a)} × ${f(view.b)} = ${f(left)}` },
          { label: t("balance.rowRight"), value: `${f(view.a)}×${f(c)} + ${f(view.a)}×${f(d)} = ${f(right)}` },
          { label: t("balance.rowDiff"), value: `${diff > 0 ? "+" : ""}${f(diff)}` },
          { label: t("balance.rowRule"), value: `${f(c)} + ${f(d)} ${c + d === view.b ? "=" : "≠"} ${f(view.b)}` },
          { label: t("balance.rowResult"), value: balanced ? t("balance.balanced") : t("balance.tipped"), emphasize: true, note: t("balance.note", { a: f(view.a), c: f(ok.c), left: f(ok.left), right: f(ok.right) }) },
        ],
      }}
    >
      <div dir="ltr" className="flex justify-center" data-testid="mt-balance" data-diff={diff}>
        <svg width="100%" height={190} viewBox="0 0 360 190" role="img" aria-label={t("balance.title")} style={{ maxWidth: 360 }}>
          <polygon points="180,120 160,176 200,176" className="fill-zinc-400 dark:fill-zinc-600" />
          <g style={{ transform: `rotate(${-tilt}deg)`, transformOrigin: "180px 120px", transition: "transform 500ms ease" }}>
            <line x1={40} y1={120} x2={320} y2={120} strokeWidth={5} strokeLinecap="round" className="stroke-zinc-700 dark:stroke-zinc-300" />
            <line x1={70} y1={120} x2={70} y2={84} strokeWidth={1.5} className="stroke-zinc-400" />
            <line x1={290} y1={120} x2={290} y2={84} strokeWidth={1.5} className="stroke-zinc-400" />
            <rect x={20} y={44} width={100} height={40} rx={8} className="fill-blue-600" />
            <text x={70} y={60} textAnchor="middle" className="fill-white font-mono text-[11px]">{`${f(view.a)} × ${f(view.b)}`}</text>
            <text x={70} y={77} textAnchor="middle" className="fill-white font-mono text-[13px] font-bold">{f(left)}</text>
            <rect x={230} y={44} width={120} height={40} rx={8} className={balanced ? "fill-emerald-500" : "fill-amber-500"} />
            <text x={290} y={60} textAnchor="middle" className="fill-white font-mono text-[10px]">{`${f(view.a * c)} + ${f(view.a * d)}`}</text>
            <text x={290} y={77} textAnchor="middle" className="fill-white font-mono text-[13px] font-bold">{f(right)}</text>
          </g>
          <circle cx={180} cy={120} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
          <text x={180} y={20} textAnchor="middle" className={`font-sans text-[12px] font-semibold ${balanced ? "fill-emerald-600 dark:fill-emerald-400" : "fill-amber-600 dark:fill-amber-400"}`}>
            {balanced ? t("balance.balanced") : t("balance.tipped")}
          </text>
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* 5 — §31 type 12: the facts just below and above the selected one. */
export function NeighbourTrio({ view, onPick }: P) {
  const t = useInd();
  const f = view.fmt;
  const n = mtNeighbours(view.a, view.b);
  const first = view.multipliers[0];
  const last = view.multipliers[view.multipliers.length - 1];
  return (
    <IndicatorCard
      id="neighbours"
      title={t("trio.title")}
      heading={t("trio.heading", { a: f(view.a) })}
      intro={t("trio.intro")}
      controls={
        <div className="flex items-center gap-2">
          <button type="button" disabled={view.b <= first} onClick={() => onPick(view.a, view.b - 1)} className="h-8 w-8 rounded-lg border border-zinc-300 font-mono font-bold disabled:opacity-40 dark:border-zinc-600" data-testid="mt-trio-minus">
            −
          </button>
          <span dir="ltr" className="font-mono text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            ×{f(view.b)}
          </span>
          <button type="button" disabled={view.b >= last} onClick={() => onPick(view.a, view.b + 1)} className="h-8 w-8 rounded-lg border border-zinc-300 font-mono font-bold disabled:opacity-40 dark:border-zinc-600" data-testid="mt-trio-plus">
            +
          </button>
        </div>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("trio.rowNow"), value: `${f(view.a)} × ${f(view.b)} = ${f(n.current)}` },
          { label: t("trio.rowPrev"), value: `${f(n.current)} − ${f(n.step)} = ${f(n.prev)}` },
          { label: t("trio.rowNext"), value: `${f(n.current)} + ${f(n.step)} = ${f(n.next)}` },
          { label: t("trio.rowResult"), value: `±${f(n.step)}`, emphasize: true },
        ],
      }}
    >
      <SensitivityBars
        points={[
          { label: t("trio.prev"), sub: `${f(view.a)} × ${f(view.b - 1)}`, value: n.prev, display: f(n.prev), delta: `−${f(n.step)}` },
          { label: t("trio.now"), sub: `${f(view.a)} × ${f(view.b)}`, value: n.current, display: f(n.current), delta: "0" },
          { label: t("trio.next"), sub: `${f(view.a)} × ${f(view.b + 1)}`, value: n.next, display: f(n.next), delta: `+${f(n.step)}` },
        ]}
      />
    </IndicatorCard>
  );
}

const SEG = ["bg-blue-500", "bg-sky-400", "bg-indigo-400", "bg-cyan-500"];

/* 6 — §31 type 15: the whole row as one stacked bar, each segment one product. */
export function RowSumStacked({ view, onPick }: P) {
  const t = useInd();
  const f = view.fmt;
  const row = mtRowSum(view.a, view.multipliers);
  const first = view.multipliers[0];
  const last = view.multipliers[view.multipliers.length - 1];
  return (
    <IndicatorCard
      id="row-sum"
      title={t("stack.title")}
      heading={t("stack.heading", { a: f(view.a), sum: f(row.sum) })}
      intro={t("stack.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("stack.rowMultipliers"), value: `${f(first)} + … + ${f(last)} = ${f(row.multiplierSum)}` },
          { label: t("stack.rowTimes"), value: `${f(view.a)} × ${f(row.multiplierSum)}` },
          { label: t("stack.rowSelected"), value: `${f(view.product)} ÷ ${f(row.sum)} = ${f(Math.round((view.product / row.sum) * 1000) / 10)}%` },
          { label: t("stack.rowResult"), value: f(row.sum), emphasize: true },
        ],
      }}
    >
      <div dir="ltr" data-testid="mt-stack" data-sum={row.sum}>
        <div className="flex h-12 overflow-hidden rounded-xl">
          {row.products.map((p, i) => {
            const m = view.multipliers[i];
            const on = m === view.b;
            const w = (p / row.sum) * 100;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onPick(view.a, m)}
                title={`${view.a} × ${m} = ${p}`}
                className={`flex h-full items-center justify-center border-e border-white/60 font-mono text-[10px] font-semibold text-white transition-all duration-500 dark:border-zinc-900/60 ${on ? "bg-emerald-500" : SEG[i % SEG.length]}`}
                style={{ width: `${w}%` }}
              >
                {w >= 5 ? f(p) : ""}
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
          <span>0</span>
          <span>{f(Math.round(row.sum / 2))}</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-100">{f(row.sum)}</span>
        </div>
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-center font-mono text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
          {view.multipliers.length <= 6 ? row.products.map(f).join(" + ") : `${f(row.products[0])} + ${f(row.products[1])} + … + ${f(row.products[row.products.length - 1])}`} = {f(row.sum)}
        </p>
      </div>
    </IndicatorCard>
  );
}

/* 7 — §31 type 18: every cell of the square grid adds up to (Σ)². */
export function GridSumFormula({ view }: P) {
  const t = useInd();
  const f = view.fmt;
  const { side, sum } = mtGridSum(view.lo, view.hi);
  const s = view.hi - view.lo + 1;
  const box = "rounded-2xl border-2 px-5 py-4 text-center";
  return (
    <IndicatorCard
      id="grid-sum"
      title={t("formula.title")}
      heading={t("formula.heading", { lo: f(view.lo), hi: f(view.hi) })}
      intro={t("formula.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("formula.rowCount"), value: `${f(s)} × ${f(s)} = ${f(s * s)}` },
          { label: t("formula.rowSide"), value: `(${f(view.lo)} + ${f(view.hi)}) × ${f(s)} ÷ 2 = ${f(side)}` },
          { label: t("formula.rowSquare"), value: `${f(side)}² = ${f(sum)}` },
          { label: t("formula.rowMean"), value: f(Math.round((sum / (s * s)) * 100) / 100) },
          { label: t("formula.rowResult"), value: f(sum), emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2 font-mono" data-testid="mt-formula" data-sum={sum}>
        <div className={`${box} border-blue-400 bg-blue-50 dark:bg-blue-500/10`}>
          <p className="text-[10px] uppercase text-blue-600 dark:text-blue-300">{t("formula.boxSide")}</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ({f(view.lo)} + … + {f(view.hi)})
          </p>
          <p className="text-xs text-zinc-500">= {f(side)}</p>
        </div>
        <span className="text-3xl font-bold text-zinc-400">²</span>
        <span className="text-3xl text-zinc-400">=</span>
        <div className={`${box} border-violet-400 bg-violet-50 dark:bg-violet-500/10`}>
          <p className="text-[10px] uppercase text-violet-600 dark:text-violet-300">{t("formula.boxSquare")}</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {f(side)} × {f(side)}
          </p>
          <p className="text-xs text-zinc-500">{t("formula.cells", { n: f(s * s) })}</p>
        </div>
        <span className="text-3xl text-zinc-400">=</span>
        <div className={`${box} border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10`}>
          <p className="text-[10px] uppercase text-emerald-700 dark:text-emerald-300">{t("formula.boxTotal")}</p>
          <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300">{f(sum)}</p>
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 8 — §31 type 9: units digits of a × 1 … a × 10 as stations; the cycle repeats after `period`. */
export function UnitsDigitTimeline({ view }: P) {
  const t = useInd();
  const f = view.fmt;
  const cyc = mtUnitsCycle(view.a);
  const g = 10 / cyc.period;
  return (
    <IndicatorCard
      id="units-digits"
      title={t("units.title")}
      heading={t("units.heading", { a: f(view.a), period: f(cyc.period) })}
      intro={t("units.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("units.rowUnits"), value: f(view.a % 10) },
          { label: t("units.rowGcd"), value: `gcd(${f(view.a % 10 || 10)}, 10) = ${f(g)}` },
          { label: t("units.rowPeriod"), value: `10 ÷ ${f(g)} = ${f(cyc.period)}` },
          { label: t("units.rowSelected"), value: `${f(view.product)} → ${f(view.product % 10)}` },
          { label: t("units.rowResult"), value: cyc.distinct.map(f).join(", "), emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="relative px-2 pb-2" data-testid="mt-units" data-period={cyc.period}>
        {[0, 10].map((offset) => (
          <ol key={offset} className={`relative grid grid-cols-10 gap-1 ${offset ? "mt-4" : ""}`}>
            <span className="absolute inset-x-4 top-[1.6rem] h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            {cyc.digits.map((d, i) => {
              const k = offset + i + 1;
              const inCycle = i < cyc.period && offset === 0;
              const on = view.b === k;
              return (
                <li key={k} className="flex flex-col items-center">
                  <span className="mb-1 font-mono text-[10px] text-zinc-400">×{k}</span>
                  <span
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-sm font-bold ${
                      on
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : inCycle
                          ? "border-blue-500 bg-white text-blue-700 dark:bg-zinc-900 dark:text-blue-300"
                          : "border-zinc-300 bg-white text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    }`}
                  >
                    {d}
                  </span>
                  <span className="mt-1 max-w-full truncate font-mono text-[9px] text-zinc-500 dark:text-zinc-400">{f(view.a * k)}</span>
                </li>
              );
            })}
          </ol>
        ))}
        {cyc.period < 10 && (
          <div className="mt-2 grid grid-cols-10 gap-1">
            <span className="rounded-full bg-blue-100 py-0.5 text-center text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" style={{ gridColumn: `1 / span ${cyc.period}` }}>
              {t("units.cycle", { n: f(cyc.period) })}
            </span>
          </div>
        )}
      </div>
    </IndicatorCard>
  );
}

const ROOT_COLORS = ["", "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500", "bg-teal-500", "bg-sky-500", "bg-indigo-500", "bg-fuchsia-500"];

/* 9 — §31 type 19: digital roots of the row as a colour-zoned strip that repeats every 9 / gcd. */
export function DigitalRootStrip({ view, onPick }: P) {
  const t = useInd();
  const f = view.fmt;
  const shown = windowAround(view.multipliers, view.b, 27);
  const { roots, period } = mtDigitalRootRow(view.a, shown);
  const ra = mtDigitalRoot(view.a);
  const rb = mtDigitalRoot(view.b);
  const chain = digitChain(view.product);
  return (
    <IndicatorCard
      id="digital-roots"
      title={t("roots.title")}
      heading={t("roots.heading", { a: f(view.a), period: f(period) })}
      intro={t("roots.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("roots.rowProduct"), value: chain.map(f).join(" → ") },
          { label: t("roots.rowA"), value: digitChain(view.a).map(f).join(" → ") },
          { label: t("roots.rowB"), value: digitChain(view.b).map(f).join(" → ") },
          { label: t("roots.rowCheck"), value: `${f(ra)} × ${f(rb)} = ${f(ra * rb)} → ${f(mtDigitalRoot(ra * rb))}` },
          { label: t("roots.rowResult"), value: mtDigitalRoot(ra * rb) === chain[chain.length - 1] ? t("roots.pass") : t("roots.fail"), emphasize: true },
        ],
      }}
    >
      <div dir="ltr" data-testid="mt-roots" data-period={period}>
        <div className="flex gap-0.5">
          {shown.map((m, i) => {
            const on = m === view.b;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onPick(view.a, m)}
                className={`flex min-w-0 flex-1 flex-col items-center rounded-md py-3 text-white ${ROOT_COLORS[roots[i]]} ${on ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900" : ""}`}
                aria-label={`${view.a} × ${m}`}
              >
                <span className="font-mono text-base font-black">{roots[i]}</span>
                <span className="font-mono text-[8px] opacity-90">×{m}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((r) => (
            <span key={r} className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] text-white ${ROOT_COLORS[r]} ${roots.includes(r) ? "" : "opacity-25"}`}>
              {r}
            </span>
          ))}
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 10 — §31 type 11: the selected product written as every equivalent factor pair. */
export function FactorPairsEquivalence({ view, onPick }: P) {
  const t = useInd();
  const f = view.fmt;
  const pairs = mtFactorPairs(view.product);
  const primes = mtPrimeFactors(view.product);
  const divisors = primes.reduce((s, [, e]) => s * (e + 1), 1);
  const cells = mtCellsWithProduct(view.product, view.lo, view.hi);
  const inGrid = (i: number, j: number) => i >= view.lo && j <= view.hi && i <= view.hi && j >= view.lo;
  return (
    <IndicatorCard
      id="factor-pairs"
      title={t("pairs.title")}
      heading={t("pairs.heading", { p: f(view.product), n: f(pairs.length) })}
      intro={t("pairs.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("pairs.rowPrimes"), value: `${f(view.product)} = ${primeString(view.product)}` },
          { label: t("pairs.rowDivisors"), value: primes.length ? `${primes.map(([, e]) => `(${e}+1)`).join(" × ")} = ${f(divisors)}` : "1" },
          { label: t("pairs.rowPairs"), value: `⌈${f(divisors)} ÷ 2⌉ = ${f(pairs.length)}` },
          { label: t("pairs.rowCells", { lo: f(view.lo), hi: f(view.hi) }), value: f(cells) },
          { label: t("pairs.rowResult"), value: f(pairs.length), emphasize: true },
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" data-testid="mt-pairs" data-count={pairs.length}>
        {pairs.slice(0, 12).map(([i, j]) => {
          const on = (i === view.a && j === view.b) || (i === view.b && j === view.a);
          const fits = inGrid(i, j);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i, j)}
              className={`rounded-xl border-2 p-2 text-center transition ${on ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-zinc-200 hover:border-blue-400 dark:border-zinc-700"}`}
            >
              <span dir="ltr" className="block font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">
                {f(i)} × {f(j)}
              </span>
              <span dir="ltr" className="block font-mono text-[11px] text-zinc-500">
                = {f(view.product)}
              </span>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${fits ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                {fits ? t("pairs.inGrid") : t("pairs.outGrid")}
              </span>
            </button>
          );
        })}
      </div>
      {pairs.length > 12 && <p className="mt-2 text-xs text-zinc-400">{t("pairs.more", { n: f(pairs.length - 12) })}</p>}
    </IndicatorCard>
  );
}

/* 11 — §31 type 13: how many facts are left to memorise after each standard shortcut. */
export function MemoryStairs({ view }: P) {
  const t = useInd();
  const f = view.fmt;
  const steps = useMemo(() => mtMemorySteps(view.lo, view.hi), [view.lo, view.hi]);
  const hard = useMemo(() => mtHardFacts(view.lo, view.hi), [view.lo, view.hi]);
  const max = steps[0].remaining || 1;
  const last = steps[steps.length - 1];
  return (
    <IndicatorCard
      id="memory"
      title={t("stairs.title")}
      heading={t("stairs.heading", { all: f(steps[0].remaining), left: f(last.remaining) })}
      intro={t("stairs.intro", { lo: f(view.lo), hi: f(view.hi) })}
      worked={{
        title: t("worked"),
        rows: [
          ...steps.slice(1).map((s) => ({ label: t(`stairs.${s.key}`), value: `−${f(s.removed)} → ${f(s.remaining)}` })),
          { label: t("stairs.rowResult"), value: `${f(Math.round((1 - last.remaining / max) * 100))}%`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex h-52 items-end gap-2" data-testid="mt-stairs" data-left={last.remaining}>
        {steps.map((s, i) => (
          <div key={s.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            {i > 0 && <span className="font-mono text-[10px] text-red-500">−{f(s.removed)}</span>}
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{f(s.remaining)}</span>
            <span className={`w-full rounded-t-lg transition-all duration-500 ${i === steps.length - 1 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ height: `${Math.max(3, (s.remaining / max) * 72)}%`, opacity: 1 - i * 0.08 }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2">
        {steps.map((s) => (
          <span key={s.key} className="min-w-0 flex-1 text-center text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">
            {t(`stairs.short.${s.key}`)}
          </span>
        ))}
      </div>
      {hard.length > 0 && (
        <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">
          <span className="font-semibold">{t("stairs.hardList")}</span>{" "}
          <span dir="ltr" className="font-mono">
            {hard.slice(0, 24).map(([i, j]) => `${f(i)}×${f(j)}`).join(" · ")}
            {hard.length > 24 ? " …" : ""}
          </span>
        </p>
      )}
    </IndicatorCard>
  );
}

const TW = 560;
const TH = 220;
const TP = { l: 40, r: 16, t: 16, b: 30 };

/* 12 — §31 type 7: share of distinct values in the 1…N table (Erdős), with the reference point at N. */
export function DistinctTrend({ view }: P) {
  const t = useInd();
  const f = view.fmt;
  const trend = useMemo(() => mtDistinctTrend(30), []);
  const startN = Math.min(30, Math.max(2, view.hi));
  const [pick, setPick] = useState<{ from: number; n: number }>({ from: startN, n: startN });
  const n = pick.from === startN ? pick.n : startN;
  const point = trend[n - 1];
  const x = (k: number) => TP.l + ((TW - TP.l - TP.r) * (k - 1)) / 29;
  const y = (s: number) => TP.t + (TH - TP.t - TP.b) * (1 - s);
  const path = trend.map((p, i) => `${i ? "L" : "M"} ${x(p.n)} ${y(p.share)}`).join(" ");
  const yours = mtDistinctProducts(view.lo, view.hi);
  const yourCells = (view.hi - view.lo + 1) ** 2;
  return (
    <IndicatorCard
      id="distinct"
      title={t("trend.title")}
      heading={t("trend.heading", { n: f(n), d: f(point.distinct), cells: f(n * n) })}
      intro={t("trend.intro")}
      controls={
        <label className="block max-w-sm">
          <span className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            {t("trend.slider")}
            <b dir="ltr" className="font-mono text-zinc-800 dark:text-zinc-100">
              N = {f(n)}
            </b>
          </span>
          <input type="range" min={2} max={30} value={n} onChange={(e) => setPick({ from: startN, n: Number(e.target.value) })} className="w-full accent-blue-600" data-testid="mt-trend-n" />
        </label>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("trend.rowCells"), value: `${f(n)}² = ${f(n * n)}` },
          { label: t("trend.rowDistinct"), value: f(point.distinct) },
          { label: t("trend.rowShare"), value: `${f(point.distinct)} ÷ ${f(n * n)} = ${f(Math.round(point.share * 1000) / 10)}%` },
          { label: t("trend.rowYours", { lo: f(view.lo), hi: f(view.hi) }), value: `${f(yours)} / ${f(yourCells)}` },
          { label: t("trend.rowResult"), value: `${f(Math.round(point.share * 1000) / 10)}%`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="overflow-x-auto" data-testid="mt-trend" data-distinct={point.distinct}>
        <svg width="100%" height={TH} viewBox={`0 0 ${TW} ${TH}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("trend.title")} className="min-w-[420px]">
          {[0, 0.25, 0.5, 0.75, 1].map((s) => (
            <g key={s}>
              <line x1={TP.l} x2={TW - TP.r} y1={y(s)} y2={y(s)} className="stroke-zinc-200 dark:stroke-zinc-700" />
              <text x={TP.l - 6} y={y(s) + 3} textAnchor="end" className="fill-zinc-400 font-mono text-[10px]">
                {s * 100}%
              </text>
            </g>
          ))}
          {[1, 5, 10, 15, 20, 25, 30].map((k) => (
            <text key={k} x={x(k)} y={TH - 10} textAnchor="middle" className="fill-zinc-400 font-mono text-[10px]">
              {k}
            </text>
          ))}
          <path d={path} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
          <line x1={x(n)} x2={x(n)} y1={TP.t} y2={TH - TP.b} strokeDasharray="4 4" className="stroke-emerald-500" />
          <circle cx={x(n)} cy={y(point.share)} r={7} className="fill-emerald-500 stroke-white dark:stroke-zinc-900" strokeWidth={2} />
          <g transform={`translate(${Math.min(x(n) + 10, TW - 150)} ${Math.max(y(point.share) - 34, TP.t)})`}>
            <rect width={138} height={26} rx={6} className="fill-zinc-900/85 dark:fill-white/90" />
            <text x={69} y={17} textAnchor="middle" className="fill-white font-mono text-[11px] font-semibold dark:fill-zinc-900">
              {`N=${n}: ${point.distinct}/${n * n} = ${Math.round(point.share * 100)}%`}
            </text>
          </g>
        </svg>
      </div>
    </IndicatorCard>
  );
}
