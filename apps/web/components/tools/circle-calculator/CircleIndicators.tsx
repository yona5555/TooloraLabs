"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CIRCLE_EQUAL_C_A_RADIUS,
  annulusBands,
  circleSector,
  circleSensitivity,
  circleSquares,
  isoperimetricRanking,
  polygonApproximation,
  sectorAngleZone,
} from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import { useCircleRadius } from "./CircleLiveContext";
import type { CircleKnownField } from "./types";

function useInd() {
  return useTranslations("tools.circle-calculator.ind");
}
function useFields() {
  return useTranslations("tools.circle-calculator.form.fields");
}
const pct = (v: number) => `${v}%`;

/* §31 type 13 — stepped diagram: the solving path from whichever field is known. */
export function CircleSolveSteps() {
  const t = useInd();
  const tf = useFields();
  const { r, knownField, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const d = 2 * r;
  const C = 2 * Math.PI * r;
  const A = Math.PI * r * r;
  const step = (field: CircleKnownField, formula: string, value: number) => ({ field, formula, value });
  const paths: Record<CircleKnownField, ReturnType<typeof step>[]> = {
    radius: [step("radius", t("steps.given"), r), step("diameter", `2 × ${n(r)}`, d), step("circumference", `2π × ${n(r)}`, C), step("area", `π × ${n(r)}²`, A)],
    diameter: [step("diameter", t("steps.given"), d), step("radius", `${n(d)} ÷ 2`, r), step("circumference", `π × ${n(d)}`, C), step("area", `π × ${n(r)}²`, A)],
    circumference: [step("circumference", t("steps.given"), C), step("radius", `${n(C)} ÷ 2π`, r), step("diameter", `2 × ${n(r)}`, d), step("area", `π × ${n(r)}²`, A)],
    area: [step("area", t("steps.given"), A), step("radius", `√(${n(A)} ÷ π)`, r), step("diameter", `2 × ${n(r)}`, d), step("circumference", `2π × ${n(r)}`, C)],
  };
  const steps = paths[knownField];
  const colors = ["bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600", "bg-blue-50 border-blue-300 dark:bg-blue-500/10 dark:border-blue-500/40", "bg-violet-50 border-violet-300 dark:bg-violet-500/10 dark:border-violet-500/40", "bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/40"];
  return (
    <IndicatorCard
      id="solve-steps"
      title={t("steps.title")}
      heading={t("steps.heading", { field: tf(knownField) })}
      intro={t("steps.intro")}
      worked={{
        title: t("worked"),
        rows: steps.map((s, i) => ({ label: `${i + 1}. ${tf(s.field)}`, value: i === 0 ? f(s.value) : `${s.formula} = ${f(s.value)}`, emphasize: i === steps.length - 1 })),
      }}
    >
      <div className="flex items-end gap-2">
        {steps.map((s, i) => (
          <div key={s.field} className={`flex min-w-0 flex-1 flex-col justify-end rounded-xl border-2 p-2 ${colors[i]}`} style={{ height: 88 + i * 34 }}>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{`${i + 1}. ${tf(s.field)}`}</span>
            <span dir="ltr" className="truncate font-mono text-[10px] text-zinc-500 dark:text-zinc-400">{s.formula}</span>
            <span dir="ltr" className="truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{f(s.value)}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 7 — trend lines with the current radius highlighted and the A = C crossing at r = 2. */
export function CircleGrowthCurves() {
  const t = useInd();
  const tf = useFields();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const W = 420;
  const H = 240;
  const L = 52;
  const B = 30;
  const T = 14;
  const Rt = 14;
  const xmax = Math.max(2 * r, 3);
  const ymax = Math.max(2 * Math.PI * xmax, Math.PI * xmax * xmax);
  const X = (x: number) => L + (x / xmax) * (W - L - Rt);
  const Y = (y: number) => H - B - (y / ymax) * (H - B - T);
  const pts = (fn: (x: number) => number) => Array.from({ length: 61 }, (_, i) => (i / 60) * xmax).map((x) => `${X(x).toFixed(1)},${Y(fn(x)).toFixed(1)}`).join(" ");
  const Cr = 2 * Math.PI * r;
  const Ar = Math.PI * r * r;
  const cross = CIRCLE_EQUAL_C_A_RADIUS;
  const showCross = cross / xmax > 0.04;
  return (
    <IndicatorCard
      id="growth"
      title={t("growth.title")}
      heading={t("growth.heading")}
      intro={t("growth.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: tf("radius"), value: f(r) },
          { label: tf("circumference"), value: `2π × ${n(r)} = ${f(Cr)}` },
          { label: tf("area"), value: `π × ${n(r)}² = ${f(Ar)}` },
          { label: t("growth.rowSlopeC"), value: `2π ≈ ${f(2 * Math.PI)}` },
          { label: t("growth.rowSlopeA"), value: `2πr = ${f(2 * Math.PI * r)}` },
          { label: t("growth.rowCross"), value: `r = ${f(cross)} → ${f(4 * Math.PI)}` },
          { label: t("growth.rowRatio"), value: `A ÷ C = r ÷ 2 = ${f(r / 2)}`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto max-w-full" role="img" aria-label={t("growth.heading")}>
          {[0, 0.5, 1].map((k) => (
            <g key={k}>
              <line x1={L} x2={W - Rt} y1={Y(k * ymax)} y2={Y(k * ymax)} className="stroke-zinc-200 dark:stroke-zinc-700" />
              <text x={L - 6} y={Y(k * ymax) + 3} textAnchor="end" className="fill-zinc-400 font-mono text-[9px]">{n(k * ymax, 1)}</text>
              <text x={X(k * xmax)} y={H - B + 14} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">{n(k * xmax, 2)}</text>
            </g>
          ))}
          <text x={W - Rt} y={H - 3} textAnchor="end" className="fill-zinc-500 text-[10px]">r</text>
          <polyline points={pts((x) => 2 * Math.PI * x)} fill="none" className="stroke-amber-500" strokeWidth={2.5} />
          <polyline points={pts((x) => Math.PI * x * x)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />
          {showCross && (
            <g>
              <circle cx={X(cross)} cy={Y(4 * Math.PI)} r={4} className="fill-violet-600 dark:fill-violet-400" />
              {/* Above-left of the crossing: both curves lie below it there, and it is dropped when the
                  current-radius labels come close, so no label ever sits on a line or another label. */}
              {Math.abs(X(r) - X(cross)) > 80 && (
                <text x={X(cross) - 6} y={Y(4 * Math.PI) - 8} textAnchor="end" className="fill-violet-600 font-mono text-[10px] dark:fill-violet-400">A = C</text>
              )}
            </g>
          )}
          <line x1={X(r)} x2={X(r)} y1={T} y2={H - B} className="stroke-red-500" strokeDasharray="4 3" />
          <circle cx={X(r)} cy={Y(Cr)} r={5} className="fill-amber-500 stroke-white dark:stroke-zinc-900" strokeWidth={1.5} />
          <circle cx={X(r)} cy={Y(Ar)} r={5} className="fill-blue-600 stroke-white dark:fill-blue-400 dark:stroke-zinc-900" strokeWidth={1.5} />
          <text x={X(r) - 6} y={Y(Ar) - 8} textAnchor="end" className="fill-blue-700 font-mono text-[10px] font-semibold dark:fill-blue-300">{`A = ${n(Ar)}`}</text>
          <text x={X(r) - 6} y={Y(Cr) + 14} textAnchor="end" className="fill-amber-700 font-mono text-[10px] font-semibold dark:fill-amber-400">{`C = ${n(Cr)}`}</text>
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-amber-500" />{t("growth.legendC")}</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-600 dark:bg-blue-400" />{t("growth.legendA")}</span>
        <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-red-500" />{t("growth.legendNow")}</span>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 12 — sensitivity trio: the radius a few percent lower / as entered / higher. */
export function CircleSensitivityTrio() {
  const t = useInd();
  const tf = useFields();
  const { r, fmt } = useCircleRadius();
  const { f } = fmt;
  const [p, setP] = useState(10);
  const trio = circleSensitivity(r, p / 100);
  const mid = trio[1];
  const change = (v: number, base: number) => `${v >= base ? "+" : "−"}${f(Math.abs((v / base - 1) * 100), 2)}%`;
  const labels = [t("trio.low"), t("trio.current"), t("trio.high")];
  return (
    <IndicatorCard
      id="sensitivity"
      title={t("trio.title")}
      heading={t("trio.heading", { pct: p })}
      intro={t("trio.intro")}
      controls={<PillGroup label={t("trio.change")} options={[5, 10, 25]} value={p} onChange={setP} format={pct} />}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("trio.rowFactor"), value: `1 ± ${f(p / 100, 2)}` },
          { label: `${tf("circumference")} (${labels[2]})`, value: `${f(trio[2].circumference)} (${change(trio[2].circumference, mid.circumference)})` },
          { label: `${tf("area")} (${labels[2]})`, value: `${f(trio[2].area)} (${change(trio[2].area, mid.area)})` },
          { label: `${tf("area")} (${labels[0]})`, value: `${f(trio[0].area)} (${change(trio[0].area, mid.area)})` },
          { label: t("trio.rowRule"), value: `(1 + ${f(p / 100, 2)})² = ${f((1 + p / 100) ** 2, 4)}`, emphasize: true },
        ],
      }}
    >
      <div className="grid grid-cols-3 gap-3">
        {trio.map((pt, i) => (
          <div key={i} className={`flex flex-col items-center rounded-xl border p-3 ${i === 1 ? "border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{labels[i]}</span>
            <svg width={90} height={90} viewBox="0 0 90 90" className="my-2">
              <circle cx={45} cy={45} r={44 / (1 + 0.25)} fill="none" className="stroke-zinc-200 dark:stroke-zinc-700" strokeDasharray="3 3" />
              <circle cx={45} cy={45} r={(44 / 1.25) * pt.factor} className={i === 1 ? "fill-blue-500/30 stroke-blue-600 dark:stroke-blue-400" : i === 0 ? "fill-amber-500/25 stroke-amber-600" : "fill-emerald-500/25 stroke-emerald-600"} strokeWidth={2} />
            </svg>
            <span dir="ltr" className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{`r ${f(pt.radius)}`}</span>
            <span dir="ltr" className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{`C ${f(pt.circumference, 2)}`}</span>
            <span dir="ltr" className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{`A ${f(pt.area, 2)}`}</span>
            {i !== 1 && <span dir="ltr" className={`mt-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${i === 0 ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"}`}>{`A ${change(pt.area, mid.area)}`}</span>}
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 1 — labeled bar chart: areas of the polygons inside and around the circle. */
export function CircleAreaBars() {
  const t = useInd();
  const tf = useFields();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const q = circleSquares(r);
  const A = Math.PI * r * r;
  const bars = [
    { key: "inSquare", v: q.inscribedArea, formula: "2r²", cls: "from-amber-600 to-amber-400" },
    { key: "inHex", v: q.inscribedHexagonArea, formula: "2.598r²", cls: "from-violet-600 to-violet-400" },
    { key: "circle", v: A, formula: "πr²", cls: "from-blue-700 to-blue-500" },
    { key: "outHex", v: q.circumscribedHexagonArea, formula: "3.464r²", cls: "from-emerald-600 to-emerald-400" },
    { key: "outSquare", v: q.circumscribedArea, formula: "4r²", cls: "from-zinc-500 to-zinc-400" },
  ];
  return (
    <IndicatorCard
      id="area-bars"
      title={t("bars.title")}
      heading={t("bars.heading")}
      intro={t("bars.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: "r²", value: `${n(r)}² = ${f(r * r)}` },
          ...bars.map((b) => ({ label: t(`bars.${b.key}`), value: `${b.formula} = ${f(b.v)}`, emphasize: b.key === "circle" })),
        ],
      }}
    >
      <div dir="ltr" className="flex h-56 items-end gap-2">
        {bars.map((b) => (
          <div key={b.key} className="flex h-full min-w-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-end">
              <span className="mb-1 truncate text-center font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-100">{f(b.v, 2)}</span>
              <div className={`rounded-t-md bg-gradient-to-t ${b.cls} transition-all duration-500`} style={{ height: `${(b.v / q.circumscribedArea) * 100}%` }} />
            </div>
            <span className="mt-1 text-center text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">{b.key === "circle" ? tf("area") : t(`bars.${b.key}`)}</span>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 15 — stacked bar: the circumscribed square split into inscribed square, segments, corners. */
export function CircleSquareStack() {
  const t = useInd();
  const { r, fmt } = useCircleRadius();
  const { f } = fmt;
  const q = circleSquares(r);
  const parts = [
    { key: "inSquare", v: q.inscribedArea, cls: "bg-amber-500", dot: "bg-amber-500", formula: "2r²" },
    { key: "segments", v: q.segmentsArea, cls: "bg-blue-600 dark:bg-blue-500", dot: "bg-blue-600 dark:bg-blue-500", formula: "(π − 2)r²" },
    { key: "corners", v: q.cornersArea, cls: "bg-zinc-400 dark:bg-zinc-500", dot: "bg-zinc-400 dark:bg-zinc-500", formula: "(4 − π)r²" },
  ];
  const share = (v: number) => (v / q.circumscribedArea) * 100;
  return (
    <IndicatorCard
      id="square-stack"
      title={t("stack.title")}
      heading={t("stack.heading")}
      intro={t("stack.intro")}
      worked={{
        title: t("worked"),
        rows: [
          ...parts.map((p) => ({ label: t(`stack.${p.key}`), value: `${p.formula} = ${f(p.v)}` })),
          { label: t("stack.circle"), value: `2r² + (π − 2)r² = ${f(q.inscribedArea + q.segmentsArea)}` },
          { label: t("stack.total"), value: `4r² = ${f(q.circumscribedArea)}`, emphasize: true },
        ],
      }}
    >
      <div className="flex h-14 w-full overflow-hidden rounded-xl">
        {parts.map((p) => (
          <div key={p.key} className={`flex items-center justify-center ${p.cls} transition-all duration-500`} style={{ width: `${share(p.v)}%` }}>
            <span dir="ltr" className="font-mono text-xs font-bold text-white">{f(share(p.v), 1)}%</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex text-[11px] font-semibold text-blue-700 dark:text-blue-300">
        <div className="border-t-2 border-blue-600 pt-1 text-center dark:border-blue-400" style={{ width: `${share(q.inscribedArea + q.segmentsArea)}%` }}>
          {t("stack.circle")} <span dir="ltr" className="font-mono">{f(share(q.inscribedArea + q.segmentsArea), 2)}%</span>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300"><span className={`h-3 w-3 rounded-sm ${p.dot}`} />{t(`stack.${p.key}`)}</span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{f(p.v)}</span>
          </li>
        ))}
      </ul>
    </IndicatorCard>
  );
}

/* §31 type 11 — side-by-side equivalence: three shapes with exactly the circle's area. */
export function CircleEqualArea() {
  const t = useInd();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const A = Math.PI * r * r;
  const k = 110 / (Math.PI * r);
  const side = Math.sqrt(A);
  const box = 120;
  const shapes = [
    { key: "circle", w: 2 * r * k, h: 2 * r * k, label: `r = ${n(r)}` },
    { key: "square", w: side * k, h: side * k, label: `${n(side)} × ${n(side)}` },
    { key: "rect", w: Math.PI * r * k, h: r * k, label: `${n(Math.PI * r)} × ${n(r)}` },
  ];
  return (
    <IndicatorCard
      id="equal-area"
      title={t("equal.title")}
      heading={t("equal.heading", { area: f(A) })}
      intro={t("equal.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("equal.circle"), value: `π × ${n(r)}² = ${f(A)}` },
          { label: t("equal.square"), value: `√${n(A)} = ${f(side)}` },
          { label: t("equal.squareCheck"), value: `${n(side)}² = ${f(side * side)}` },
          { label: t("equal.rect"), value: `πr × r = ${n(Math.PI * r)} × ${n(r)}` },
          { label: t("equal.rectCheck"), value: f(Math.PI * r * r), emphasize: true },
        ],
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {shapes.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <span className="text-2xl font-bold text-zinc-400">=</span>}
            <div className="flex flex-col items-center">
              <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
                {s.key === "circle" ? (
                  <circle cx={box / 2} cy={box / 2} r={s.w / 2} className="fill-blue-500/25 stroke-blue-600 dark:stroke-blue-400" strokeWidth={2} />
                ) : (
                  <rect x={(box - s.w) / 2} y={(box - s.h) / 2} width={s.w} height={s.h} className={s.key === "square" ? "fill-violet-500/25 stroke-violet-600 dark:stroke-violet-400" : "fill-emerald-500/25 stroke-emerald-600 dark:stroke-emerald-400"} strokeWidth={2} />
                )}
              </svg>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t(`equal.${s.key}`)}</span>
              <span dir="ltr" className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* §31 type 6 — multi-ring donut: four equal-width rings and the share of area each holds. */
export function CircleRingDonut() {
  const t = useInd();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const bands = annulusBands(r, 4);
  const S = 168;
  const c = S / 2;
  const R = 80;
  const fills = ["fill-sky-300 dark:fill-sky-700", "fill-blue-400 dark:fill-blue-600", "fill-blue-600 dark:fill-blue-500", "fill-indigo-700 dark:fill-indigo-400"];
  const dots = ["bg-sky-300 dark:bg-sky-700", "bg-blue-400 dark:bg-blue-600", "bg-blue-600 dark:bg-blue-500", "bg-indigo-700 dark:bg-indigo-400"];
  const range = (i: number) => `${i === 0 ? "0" : `${i}/4`} – ${i === 3 ? "r" : `${i + 1}/4`}`;
  return (
    <IndicatorCard
      id="ring-donut"
      title={t("rings.title")}
      heading={t("rings.heading")}
      intro={t("rings.intro")}
      worked={{
        title: t("worked"),
        rows: [
          ...bands.map((b, i) => ({ label: `${t("rings.ring")} ${i + 1}`, value: `π(${n(b.outer)}² − ${n(b.inner)}²) = ${f(b.area)}`, emphasize: i === 3 })),
          { label: t("rings.total"), value: `π × ${n(r)}² = ${f(Math.PI * r * r)}` },
        ],
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-6">
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t("rings.heading")}>
          {[...bands].reverse().map((b, ri) => {
            const i = 3 - ri;
            return <circle key={i} cx={c} cy={c} r={(R * b.outer) / r} className={`${fills[i]} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} />;
          })}
          {bands.map((b, i) => (i === 0 ? null : (
            <text key={i} x={c} y={c - (R * (b.inner + b.outer)) / 2 / r + 3} textAnchor="middle" className="fill-white font-mono text-[9px] font-bold">{`${f(b.share * 100, 1)}%`}</text>
          )))}
        </svg>
        <ul className="space-y-1.5 text-sm">
          {bands.map((b, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-sm ${dots[i]}`} />
              <span dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{range(i)}</span>
              <span dir="ltr" className="ms-auto font-mono font-semibold text-zinc-800 dark:text-zinc-100">{f(b.share * 100, 2)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 5 — ranked horizontal bars: shapes with the same perimeter as this circle's rim. */
export function CircleIsoperimetric() {
  const t = useInd();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const C = 2 * Math.PI * r;
  const list = isoperimetricRanking(C);
  const cls: Record<string, string> = { circle: "bg-blue-600 dark:bg-blue-500", hexagon: "bg-violet-500", square: "bg-amber-500", triangle: "bg-rose-500" };
  return (
    <IndicatorCard
      id="isoperimetric"
      title={t("iso.title")}
      heading={t("iso.heading", { c: f(C) })}
      intro={t("iso.intro")}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("iso.perimeter"), value: `2π × ${n(r)} = ${f(C)}` },
          ...list.map((e) => ({ label: t(`iso.${e.shape}`), value: `${f(e.area)} (${f(e.shareOfCircle * 100, 1)}%)`, emphasize: e.shape === "circle" })),
        ],
      }}
    >
      <ol className="space-y-3">
        {list.map((e, i) => (
          <li key={e.shape}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{`${i + 1}. ${t(`iso.${e.shape}`)}`}</span>
              <span dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{`${t("iso.side")} ${f(e.side, 3)}`}</span>
            </div>
            <div className="h-6 w-full rounded-md bg-zinc-100 dark:bg-zinc-800">
              <div className={`flex h-6 items-center justify-end rounded-md px-2 ${cls[e.shape]} transition-all duration-500`} style={{ width: `${e.shareOfCircle * 100}%` }}>
                <span dir="ltr" className="font-mono text-[11px] font-bold text-white">{f(e.area, 2)}</span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </IndicatorCard>
  );
}

/* §31 type 8 — gradient gauge: how close Archimedes' inscribed n-gon gets to the true rim. */
export function CirclePolygonGauge() {
  const t = useInd();
  const tf = useFields();
  const { r, fmt } = useCircleRadius();
  const { f } = fmt;
  const [sides, setSides] = useState(6);
  const p = polygonApproximation(r, sides);
  const MIN = 80;
  const frac = Math.min(1, Math.max(0, (p.perimeterShare * 100 - MIN) / (100 - MIN)));
  const W = 260;
  const H = 176;
  const cx = W / 2;
  const cy = 130;
  const R = 105;
  const ang = Math.PI * (1 - frac);
  const nx = cx + (R - 18) * Math.cos(ang);
  const ny = cy - (R - 18) * Math.sin(ang);
  return (
    <IndicatorCard
      id="polygon-gauge"
      title={t("gauge.title")}
      heading={t("gauge.heading", { n: p.sides })}
      intro={t("gauge.intro")}
      controls={
        <label className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {t("gauge.sides")}
          <input type="range" min={3} max={96} value={sides} onChange={(e) => setSides(Number(e.target.value))} className="flex-1 accent-blue-600" />
          <span dir="ltr" className="w-8 text-end font-mono font-semibold text-zinc-800 dark:text-zinc-100">{p.sides}</span>
        </label>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("gauge.inside"), value: `2r·n·sin(π/n) = ${f(p.inscribedPerimeter)}` },
          { label: tf("circumference"), value: f(2 * Math.PI * r) },
          { label: t("gauge.outside"), value: `2r·n·tan(π/n) = ${f(p.circumscribedPerimeter)}` },
          { label: t("gauge.bounds"), value: `${f(p.piLower, 5)} < π < ${f(p.piUpper, 5)}` },
          { label: t("gauge.share"), value: `${f(p.perimeterShare * 100, 3)}%`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex justify-center">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("gauge.heading", { n: p.sides })}>
          <defs>
            <linearGradient id="circle-gauge-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke="url(#circle-gauge-grad)" strokeWidth={16} strokeLinecap="round" />
          {[80, 85, 90, 95, 100].map((v) => {
            const a = Math.PI * (1 - (v - MIN) / (100 - MIN));
            return (
              <text key={v} x={cx + (R + 16) * Math.cos(a)} y={cy - (R + 16) * Math.sin(a) + 3} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px]">{`${v}%`}</text>
            );
          })}
          <line x1={cx} y1={cy} x2={nx} y2={ny} className="stroke-zinc-800 dark:stroke-zinc-100" strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
          {/* Readout below the pivot, so the needle never crosses it at any value. */}
          <text x={cx} y={cy + 32} textAnchor="middle" className="fill-zinc-900 font-mono text-[16px] font-bold dark:fill-zinc-100">{`${f(p.perimeterShare * 100, 3)}%`}</text>
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* §31 type 19 — zone strip: the chosen central angle among acute / right / obtuse / straight / reflex. */
export function CircleSectorZones() {
  const t = useInd();
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const [deg, setDeg] = useState(120);
  const s = circleSector(r, deg);
  const zone = sectorAngleZone(deg);
  const zones = [
    { key: "acute", from: 0, to: 90, cls: "bg-sky-400 dark:bg-sky-600" },
    { key: "obtuse", from: 90, to: 180, cls: "bg-violet-400 dark:bg-violet-600" },
    { key: "reflex", from: 180, to: 360, cls: "bg-amber-400 dark:bg-amber-600" },
  ];
  return (
    <IndicatorCard
      id="sector-zones"
      title={t("zones.title")}
      heading={t("zones.heading", { deg, zone: t(`zones.${zone}`) })}
      intro={t("zones.intro")}
      controls={
        <label className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          {t("zones.angle")}
          <input type="range" min={1} max={360} value={deg} onChange={(e) => setDeg(Number(e.target.value))} className="flex-1 accent-blue-600" />
          <span dir="ltr" className="w-10 text-end font-mono font-semibold text-zinc-800 dark:text-zinc-100">{deg}°</span>
        </label>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("zones.radians"), value: `${deg} × π ÷ 180 = ${f(s.radians)}` },
          { label: t("zones.arc"), value: `${n(r)} × ${n(s.radians)} = ${f(s.arcLength)}` },
          { label: t("zones.sector"), value: `½ × ${n(r)}² × ${n(s.radians)} = ${f(s.sectorArea)}`, emphasize: true },
          { label: t("zones.chord"), value: `2r sin(θ/2) = ${f(s.chord)}` },
          { label: t("zones.segment"), value: f(s.segmentArea) },
        ],
      }}
    >
      <div dir="ltr" className="relative pt-7">
        <div className="absolute top-0 -translate-x-1/2 transition-all" style={{ left: `${(deg / 360) * 100}%` }}>
          <span className="block rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">{deg}°</span>
          <span className="mx-auto block h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-zinc-900 dark:border-t-zinc-100" />
        </div>
        <div className="relative flex h-10 overflow-hidden rounded-lg">
          {zones.map((z) => (
            <div key={z.key} className={`flex items-center justify-center ${z.cls} ${zone === z.key ? "" : "opacity-60"}`} style={{ width: `${((z.to - z.from) / 360) * 100}%` }}>
              <span className="text-[11px] font-semibold text-white">{t(`zones.${z.key}`)}</span>
            </div>
          ))}
          {[90, 180].map((m) => (
            <div key={m} className={`absolute inset-y-0 w-1 -translate-x-1/2 ${zone === (m === 90 ? "right" : "straight") ? "bg-red-600" : "bg-white dark:bg-zinc-900"}`} style={{ left: `${(m / 360) * 100}%` }} />
          ))}
        </div>
        <div className="relative mt-1 h-4 font-mono text-[10px] text-zinc-400">
          {[0, 90, 180, 270, 360].map((m) => (
            <span key={m} className="absolute -translate-x-1/2" style={{ left: `${(m / 360) * 100}%` }}>{m}°</span>
          ))}
        </div>
      </div>
    </IndicatorCard>
  );
}
