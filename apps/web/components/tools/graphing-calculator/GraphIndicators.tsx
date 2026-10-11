"use client";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { derivativeAt, differenceQuotient, tangentAt, type GraphKeyPointKind } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import IndicatorWithTable from "@/components/tool-ui/IndicatorWithTable";
import { useGraphLive } from "./GraphLiveContext";
import { fmtNum } from "./types";

type Row = { label: string; value: string; emphasize?: boolean; note?: string };

/** One indicator card (§32): blue header, intro line, the indicator with its WORKED EXAMPLE table beside it. */
function IndicatorCard({ ns, indicator, rows }: { ns: string; indicator: ReactNode; rows: Row[] }) {
  const t = useTranslations(`tools.graphing-calculator.viz.${ns}`);
  const tv = useTranslations("tools.graphing-calculator.viz");
  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <IndicatorWithTable className="mt-4" workedExampleTitle={tv("workedExample")} indicator={indicator} rows={rows} />
    </SectionCard>
  );
}

const pct = (r: number) => `${fmtNum(r * 100, 1)}%`;
const svgStyle = { maxWidth: "100%", height: "auto" } as const;

const KIND_FILL: Record<GraphKeyPointKind, string> = {
  root: "fill-rose-500 dark:fill-rose-400",
  "y-intercept": "fill-emerald-500 dark:fill-emerald-400",
  maximum: "fill-amber-500 dark:fill-amber-400",
  minimum: "fill-sky-500 dark:fill-sky-400",
  inflection: "fill-violet-500 dark:fill-violet-400",
};

/* ------------------------------------------------------------------ */
/** Type #19 (Zone Strip): where on the x-range f is positive, negative or undefined, with every root marked. */
export function GraphSignZoneStrip() {
  const t = useTranslations("tools.graphing-calculator.viz.signZone");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const { f, xMin, xMax, analysis: a } = useGraphLive();
  const W = 440;
  const L = 20;
  const R = W - 20;
  const cells = 200;
  const sx = (x: number) => L + ((x - xMin) / (xMax - xMin)) * (R - L);
  const undefinedRatio = 1 - a.definedRatio;
  return (
    <IndicatorCard
      ns="signZone"
      indicator={
        <div dir="ltr">
          <svg width={W} height={120} viewBox={`0 0 ${W} 120`} style={svgStyle} role="img" aria-label={t("title")}>
            {Array.from({ length: cells }, (_, i) => {
              const x0 = xMin + ((xMax - xMin) * i) / cells;
              const y = f(x0 + (xMax - xMin) / cells / 2);
              const cls = y === null ? "fill-zinc-300 dark:fill-zinc-700" : y > 0 ? "fill-emerald-400 dark:fill-emerald-500/80" : y < 0 ? "fill-rose-400 dark:fill-rose-500/80" : "fill-zinc-400";
              return <rect key={i} x={sx(x0)} y={34} width={(R - L) / cells + 0.4} height={30} className={cls} />;
            })}
            {a.roots.slice(0, 8).map((r, i) => (
              <g key={r}>
                <line x1={sx(r)} x2={sx(r)} y1={26} y2={72} className="stroke-zinc-800 dark:stroke-zinc-100" strokeWidth={2} />
                <text x={sx(r)} y={i % 2 ? 86 : 20} fontSize={11} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
                  {fmtNum(r, 2)}
                </text>
              </g>
            ))}
            <text x={L} y={104} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">{`x = ${fmtNum(xMin, 2)}`}</text>
            <text x={R} y={104} fontSize={11} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">{`x = ${fmtNum(xMax, 2)}`}</text>
          </svg>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />f &gt; 0</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-400" />f &lt; 0</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />{tv("undefined")}</span>
          </div>
        </div>
      }
      rows={[
        { label: tv("positive"), value: pct(a.positiveRatio) },
        { label: tv("negative"), value: pct(a.negativeRatio) },
        { label: tv("undefined"), value: pct(undefinedRatio) },
        { label: tv("kinds.root"), value: String(a.roots.length), emphasize: true, note: a.roots.slice(0, 4).map((r) => fmtNum(r, 3)).join(", ") || tv("none") },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #9 (Timeline with Stations): the graph's landmarks in left-to-right order along the x-range. */
export function GraphKeyPointsTimeline() {
  const tv = useTranslations("tools.graphing-calculator.viz");
  const t = useTranslations("tools.graphing-calculator.viz.timeline");
  const { xMin, xMax, analysis: a } = useGraphLive();
  const W = 460;
  const L = 24;
  const R = W - 24;
  const sx = (x: number) => L + ((x - xMin) / (xMax - xMin)) * (R - L);
  const pts = a.keyPoints.slice(0, 9);
  const kinds: GraphKeyPointKind[] = ["root", "y-intercept", "maximum", "minimum", "inflection"];
  return (
    <IndicatorCard
      ns="timeline"
      indicator={
        <div dir="ltr">
          <svg width={W} height={170} viewBox={`0 0 ${W} 170`} style={svgStyle} role="img" aria-label={t("title")}>
            <line x1={L} x2={R} y1={85} y2={85} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={4} strokeLinecap="round" />
            <text x={L} y={112} fontSize={10} className="fill-zinc-400">{fmtNum(xMin, 2)}</text>
            <text x={R} y={112} fontSize={10} textAnchor="end" className="fill-zinc-400">{fmtNum(xMax, 2)}</text>
            {pts.map((p, i) => {
              const up = i % 2 === 0;
              const x = sx(p.x);
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={85} y2={up ? 52 : 118} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={1} />
                  <circle cx={x} cy={85} r={7} className={KIND_FILL[p.kind]} />
                  <text x={x} y={up ? 30 : 136} fontSize={10.5} fontWeight={700} textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-200">
                    {tv(`short.${p.kind}`)}
                  </text>
                  <text x={x} y={up ? 44 : 150} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
                    {`(${fmtNum(p.x, 2)}, ${fmtNum(p.y, 2)})`}
                  </text>
                </g>
              );
            })}
            {pts.length === 0 && (
              <text x={W / 2} y={70} fontSize={12} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{tv("none")}</text>
            )}
          </svg>
        </div>
      }
      rows={[
        ...kinds.map((k) => ({ label: tv(`kinds.${k}`), value: String(a.keyPoints.filter((p) => p.kind === k).length) })),
        { label: t("total"), value: String(a.keyPoints.length), emphasize: true },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #15 (Stacked Segmented Bar): the x-range split, in order, into stretches where f rises or falls. */
export function GraphMonotonicityBar() {
  const tv = useTranslations("tools.graphing-calculator.viz");
  const t = useTranslations("tools.graphing-calculator.viz.mono");
  const { xMin, xMax, analysis: a } = useGraphLive();
  const W = 440;
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
  return (
    <IndicatorCard
      ns="mono"
      indicator={
        <div dir="ltr">
          <svg width={W} height={100} viewBox={`0 0 ${W} 100`} style={svgStyle} role="img" aria-label={t("title")}>
            <rect x={0} y={20} width={W} height={36} rx={6} className="fill-zinc-200 dark:fill-zinc-700" />
            {a.intervals.map((iv, i) => {
              const x = sx(iv.from);
              const w = Math.max(1, sx(iv.to) - x);
              return (
                <g key={i}>
                  <rect x={x} y={20} width={w} height={36} className={iv.trend === "up" ? "fill-emerald-500 dark:fill-emerald-500/80" : "fill-rose-500 dark:fill-rose-500/80"} />
                  {w > 26 && (
                    <text x={x + w / 2} y={43} fontSize={14} fontWeight={700} textAnchor="middle" className="fill-white">
                      {iv.trend === "up" ? "↗" : "↘"}
                    </text>
                  )}
                  {i > 0 && w > 0 && (
                    <text x={x} y={74} fontSize={10} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
                      {fmtNum(iv.from, 2)}
                    </text>
                  )}
                </g>
              );
            })}
            <text x={0} y={92} fontSize={10} className="fill-zinc-400">{fmtNum(xMin, 2)}</text>
            <text x={W} y={92} fontSize={10} textAnchor="end" className="fill-zinc-400">{fmtNum(xMax, 2)}</text>
          </svg>
          <div className="mt-1 flex gap-4 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />{tv("increasing")}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />{tv("decreasing")}</span>
          </div>
        </div>
      }
      rows={[
        { label: tv("increasing"), value: pct(a.increasingRatio) },
        { label: tv("decreasing"), value: pct(a.decreasingRatio) },
        ...a.intervals.slice(0, 3).map((iv) => ({
          label: iv.trend === "up" ? `↗ ${tv("increasing")}` : `↘ ${tv("decreasing")}`,
          value: `[${fmtNum(iv.from, 2)}, ${fmtNum(iv.to, 2)}]`,
        })),
        { label: t("count"), value: String(a.intervals.length), emphasize: true },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #14 (Balance Indicator): area above the x-axis against area below it; the beam tips to the heavier side. */
export function GraphAreaBalance() {
  const t = useTranslations("tools.graphing-calculator.viz.balance");
  const { xMin, xMax, analysis: a } = useGraphLive();
  const total = a.positiveArea + a.negativeArea;
  const tilt = total > 0 ? ((a.negativeArea - a.positiveArea) / total) * 18 : 0;
  const W = 320;
  const cx = W / 2;
  const verdict = Math.abs(a.signedArea) <= total * 0.005 ? t("level") : a.signedArea > 0 ? t("tiltsAbove") : t("tiltsBelow");
  return (
    <IndicatorCard
      ns="balance"
      indicator={
        <div dir="ltr">
          <svg width={W} height={190} viewBox={`0 0 ${W} 190`} style={svgStyle} role="img" aria-label={t("title")}>
            <polygon points={`${cx},92 ${cx - 22},170 ${cx + 22},170`} className="fill-zinc-300 dark:fill-zinc-600" />
            <rect x={cx - 70} y={170} width={140} height={8} rx={3} className="fill-zinc-300 dark:fill-zinc-600" />
            <g transform={`rotate(${tilt} ${cx} 92)`}>
              <rect x={30} y={88} width={W - 60} height={8} rx={4} className="fill-zinc-500 dark:fill-zinc-400" />
              {[
                { x: 50, v: a.positiveArea, label: t("above"), cls: "fill-emerald-500 dark:fill-emerald-400" },
                { x: W - 50, v: a.negativeArea, label: t("below"), cls: "fill-rose-500 dark:fill-rose-400" },
              ].map((pan) => (
                <g key={pan.x} transform={`rotate(${-tilt} ${pan.x} 92)`}>
                  <line x1={pan.x} x2={pan.x} y1={92} y2={60} className="stroke-zinc-400" strokeWidth={1.5} />
                  <rect x={pan.x - 44} y={22} width={88} height={40} rx={8} className={pan.cls} />
                  <text x={pan.x} y={38} fontSize={10.5} textAnchor="middle" className="fill-white" fontWeight={600}>{pan.label}</text>
                  <text x={pan.x} y={54} fontSize={12} textAnchor="middle" className="fill-white" fontWeight={700}>{fmtNum(pan.v, 3)}</text>
                </g>
              ))}
            </g>
            <circle cx={cx} cy={92} r={5} className="fill-zinc-700 dark:fill-zinc-200" />
          </svg>
        </div>
      }
      rows={[
        { label: t("above"), value: fmtNum(a.positiveArea, 4) },
        { label: t("below"), value: fmtNum(a.negativeArea, 4) },
        { label: t("net"), value: fmtNum(a.signedArea, 4), emphasize: true, note: verdict },
        { label: t("average"), value: fmtNum(a.averageValue, 4), note: `∫ f dx / ${fmtNum(xMax - xMin, 3)}` },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #12 (Sensitivity Trio): f just left of, at, and just right of the traced point, and how well the tangent predicts it. */
export function GraphSensitivityTrio() {
  const t = useTranslations("tools.graphing-calculator.viz.trio");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const { f, xMin, xMax, traceX } = useGraphLive();
  const dx = (xMax - xMin) / 20;
  const xs = [traceX - dx, traceX, traceX + dx];
  const ys = xs.map((x) => f(x));
  const d = derivativeAt(f, traceX);
  const y0 = ys[1];
  const predicted = y0 !== null && d !== null ? y0 + d * dx : null;
  const maxAbs = Math.max(1e-9, ...ys.map((y) => Math.abs(y ?? 0)));
  const labels = [t("low"), t("current"), t("high")];
  const cls = ["fill-sky-500 dark:fill-sky-400", "fill-blue-600 dark:fill-blue-400", "fill-violet-500 dark:fill-violet-400"];
  return (
    <IndicatorCard
      ns="trio"
      indicator={
        <div dir="ltr">
          <svg width={360} height={200} viewBox="0 0 360 200" style={svgStyle} role="img" aria-label={t("title")}>
            <line x1={10} x2={350} y1={110} y2={110} className="stroke-zinc-300 dark:stroke-zinc-600" />
            {xs.map((x, i) => {
              const y = ys[i];
              const h = y === null ? 0 : (Math.abs(y) / maxAbs) * 72;
              const cx = 60 + i * 120;
              return (
                <g key={i}>
                  <rect x={cx - 30} y={y !== null && y < 0 ? 110 : 110 - h} width={60} height={Math.max(2, h)} rx={5} className={cls[i]} />
                  <text x={cx} y={y !== null && y < 0 ? 110 + h + 14 : 110 - h - 6} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100">
                    {y === null ? tv("undefined") : fmtNum(y, 3)}
                  </text>
                  <text x={cx} y={14} fontSize={11} fontWeight={600} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">{labels[i]}</text>
                  <text x={cx} y={196} fontSize={10.5} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{`x = ${fmtNum(x, 3)}`}</text>
                </g>
              );
            })}
          </svg>
        </div>
      }
      rows={[
        { label: "Δx", value: fmtNum(dx, 4) },
        { label: t("leftChange"), value: ys[0] !== null && y0 !== null ? fmtNum(y0 - ys[0], 4) : "—" },
        { label: t("rightChange"), value: ys[2] !== null && y0 !== null ? fmtNum(ys[2] - y0, 4) : "—" },
        { label: t("predicted"), value: predicted === null ? "—" : fmtNum(predicted, 4), note: "f(x) + f′(x)·Δx" },
        { label: t("actual"), value: ys[2] === null ? "—" : fmtNum(ys[2], 4), emphasize: true, note: predicted !== null && ys[2] !== null ? `${t("gap")} ${fmtNum(Math.abs(ys[2] - predicted), 4)}` : undefined },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #8 (Gradient Gauge): the tangent's inclination at the traced point, from −90° (vertical drop) to +90° (vertical climb). */
export function GraphSlopeGauge() {
  const t = useTranslations("tools.graphing-calculator.viz.gauge");
  const { f, traceX } = useGraphLive();
  const tan = tangentAt(f, traceX);
  const angle = tan?.angleDeg ?? 0;
  const cx = 140;
  const cy = 140;
  const r = 110;
  const toXY = (deg: number, rr: number) => {
    const th = ((deg - 90) * Math.PI) / 180; // -90° → left, +90° → right
    return [cx + rr * Math.cos(th), cy + rr * Math.sin(th)];
  };
  const [nx, ny] = toXY(angle, r - 18);
  return (
    <IndicatorCard
      ns="gauge"
      indicator={
        <div dir="ltr">
          <svg width={280} height={180} viewBox="0 0 280 180" style={svgStyle} role="img" aria-label={t("title")}>
            <defs>
              <linearGradient id="graph-slope-gauge" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="50%" stopColor="#a1a1aa" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#graph-slope-gauge)" strokeWidth={18} strokeLinecap="round" />
            {[-90, -45, 0, 45, 90].map((deg) => {
              const [tx, ty] = toXY(deg, r + 18);
              return (
                <text key={deg} x={tx} y={ty + 4} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{`${deg}°`}</text>
              );
            })}
            <line x1={cx} y1={cy} x2={nx} y2={ny} className="stroke-zinc-800 dark:stroke-zinc-100" strokeWidth={3} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={6} className="fill-zinc-800 dark:fill-zinc-100" />
            {/* Readout below the pivot, so the needle never crosses it at any value. */}
            <text x={cx} y={cy + 32} fontSize={18} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">{`${fmtNum(angle, 1)}°`}</text>
            <text x={cx - r} y={cy + 26} fontSize={10.5} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400">{t("steepDown")}</text>
            <text x={cx + r} y={cy + 26} fontSize={10.5} textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400">{t("steepUp")}</text>
          </svg>
        </div>
      }
      rows={[
        { label: "x", value: fmtNum(traceX, 4) },
        { label: t("slope"), value: tan ? fmtNum(tan.slope, 4) : "—" },
        { label: t("angle"), value: `${fmtNum(angle, 2)}°`, emphasize: true, note: "θ = arctan f′(x)" },
        { label: t("perUnit"), value: tan ? fmtNum(tan.slope, 3) : "—", note: t("perUnitNote") },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #6 (Multi-Ring Donut): three shares of the x-range — rising/falling, concave up/down, above/below the axis. */
export function GraphShapeDonut() {
  const tv = useTranslations("tools.graphing-calculator.viz");
  const t = useTranslations("tools.graphing-calculator.viz.donut");
  const { analysis: a } = useGraphLive();
  const rings = [
    { r: 70, parts: [{ v: a.increasingRatio, c: "stroke-emerald-500 dark:stroke-emerald-400" }, { v: a.decreasingRatio, c: "stroke-rose-500 dark:stroke-rose-400" }], label: t("ringTrend") },
    { r: 52, parts: [{ v: a.concaveUpRatio, c: "stroke-sky-500 dark:stroke-sky-400" }, { v: a.concaveDownRatio, c: "stroke-amber-500 dark:stroke-amber-400" }], label: t("ringConcavity") },
    { r: 34, parts: [{ v: a.positiveRatio, c: "stroke-teal-500 dark:stroke-teal-400" }, { v: a.negativeRatio, c: "stroke-fuchsia-500 dark:stroke-fuchsia-400" }], label: t("ringSign") },
  ];
  return (
    <IndicatorCard
      ns="donut"
      indicator={
        <div dir="ltr" className="flex items-center gap-4">
          <svg width={168} height={168} viewBox="0 0 168 168" role="img" aria-label={t("title")}>
            {rings.map((ring) => {
              const circ = 2 * Math.PI * ring.r;
              let offset = 0;
              return (
                <g key={ring.r} transform="rotate(-90 84 84)">
                  <circle cx={84} cy={84} r={ring.r} fill="none" strokeWidth={13} className="stroke-zinc-200 dark:stroke-zinc-700" />
                  {ring.parts.map((p, i) => {
                    const len = Math.max(0, Math.min(1, p.v)) * circ;
                    const el = <circle key={i} cx={84} cy={84} r={ring.r} fill="none" strokeWidth={13} className={p.c} strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return el;
                  })}
                </g>
              );
            })}
          </svg>
          <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
            <li className="font-semibold">{t("ringTrend")}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{tv("increasing")}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />{tv("decreasing")}</li>
            <li className="pt-1 font-semibold">{t("ringConcavity")}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" />{tv("concaveUp")}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />{tv("concaveDown")}</li>
            <li className="pt-1 font-semibold">{t("ringSign")}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500" />{tv("positive")}</li>
            <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-fuchsia-500" />{tv("negative")}</li>
          </ul>
        </div>
      }
      rows={[
        { label: tv("increasing"), value: pct(a.increasingRatio) },
        { label: tv("decreasing"), value: pct(a.decreasingRatio) },
        { label: tv("concaveUp"), value: pct(a.concaveUpRatio) },
        { label: tv("concaveDown"), value: pct(a.concaveDownRatio) },
        { label: tv("positive"), value: pct(a.positiveRatio) },
        { label: tv("negative"), value: pct(a.negativeRatio), emphasize: true },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #1 (Labeled Bar Chart): f at nine evenly spaced x-values, bars up for positive and down for negative. */
export function GraphSampleBars() {
  const t = useTranslations("tools.graphing-calculator.viz.bars");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const { f, xMin, xMax } = useGraphLive();
  const N = 9;
  const xs = Array.from({ length: N }, (_, i) => xMin + ((xMax - xMin) * i) / (N - 1));
  const ys = xs.map((x) => f(x));
  const defined = ys.map((y, i) => ({ y, x: xs[i] })).filter((p): p is { y: number; x: number } => p.y !== null);
  const maxAbs = Math.max(1e-9, ...defined.map((p) => Math.abs(p.y)));
  const W = 460;
  const base = 110;
  const bw = 34;
  const largest = defined.reduce((m, p) => (p.y > m.y ? p : m), defined[0] ?? { x: 0, y: 0 });
  const smallest = defined.reduce((m, p) => (p.y < m.y ? p : m), defined[0] ?? { x: 0, y: 0 });
  return (
    <IndicatorCard
      ns="bars"
      indicator={
        <div dir="ltr">
          <svg width={W} height={230} viewBox={`0 0 ${W} 230`} style={svgStyle} role="img" aria-label={t("title")}>
            <line x1={8} x2={W - 8} y1={base} y2={base} className="stroke-zinc-400 dark:stroke-zinc-500" />
            {xs.map((x, i) => {
              const y = ys[i];
              const cx = 30 + (i * (W - 60)) / (N - 1);
              const h = y === null ? 0 : (Math.abs(y) / maxAbs) * 80;
              const neg = y !== null && y < 0;
              return (
                <g key={i}>
                  {y !== null && <rect x={cx - bw / 2} y={neg ? base : base - h} width={bw} height={Math.max(1.5, h)} rx={3} className={neg ? "fill-rose-500 dark:fill-rose-400" : "fill-blue-600 dark:fill-blue-400"} />}
                  <text x={cx} y={neg ? base + h + 13 : base - h - 5} fontSize={10} fontWeight={700} textAnchor="middle" className="fill-zinc-800 dark:fill-zinc-100">
                    {y === null ? "∅" : fmtNum(y, 2)}
                  </text>
                  <text x={cx} y={224} fontSize={10} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{fmtNum(x, 2)}</text>
                </g>
              );
            })}
          </svg>
        </div>
      }
      rows={[
        { label: t("largest"), value: defined.length ? fmtNum(largest.y, 4) : "—", note: defined.length ? `x = ${fmtNum(largest.x, 3)}` : undefined },
        { label: t("smallest"), value: defined.length ? fmtNum(smallest.y, 4) : "—", note: defined.length ? `x = ${fmtNum(smallest.x, 3)}` : undefined },
        { label: t("step"), value: fmtNum((xMax - xMin) / (N - 1), 4) },
        { label: t("defined"), value: `${defined.length} / ${N}`, emphasize: true, note: defined.length < N ? tv("undefined") + ": ∅" : undefined },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #18 (Formula Diagram): the difference quotient with the traced point's live numbers substituted. */
export function GraphDifferenceQuotient() {
  const t = useTranslations("tools.graphing-calculator.viz.formula");
  const { f, traceX } = useGraphLive();
  const h = 0.1;
  const a = f(traceX);
  const b = f(traceX + h);
  const q = differenceQuotient(f, traceX, h);
  const d = derivativeAt(f, traceX);
  const box = "rounded-lg px-3 py-2 text-center font-mono";
  return (
    <IndicatorCard
      ns="formula"
      indicator={
        <div dir="ltr" className="flex w-[min(100%,440px)] flex-col items-center gap-3 lg:w-[440px]">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className={`${box} bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200`}>
                  <div className="text-[10px] opacity-70">f(x + h)</div>
                  <div className="text-sm font-bold">{b === null ? "∅" : fmtNum(b, 4)}</div>
                </div>
                <span className="text-lg font-bold text-zinc-500">−</span>
                <div className={`${box} bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200`}>
                  <div className="text-[10px] opacity-70">f(x)</div>
                  <div className="text-sm font-bold">{a === null ? "∅" : fmtNum(a, 4)}</div>
                </div>
              </div>
              <div className="my-1.5 h-0.5 w-full bg-zinc-700 dark:bg-zinc-300" />
              <div className={`${box} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200`}>
                <div className="text-[10px] opacity-70">h</div>
                <div className="text-sm font-bold">{h}</div>
              </div>
            </div>
            <span className="text-2xl font-bold text-zinc-500">=</span>
            <div className={`${box} bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200`}>
              <div className="text-[10px] opacity-70">{t("secant")}</div>
              <div className="text-lg font-bold">{q === null ? "∅" : fmtNum(q, 4)}</div>
            </div>
          </div>
          <p className="text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {`x = ${fmtNum(traceX, 4)} · h → 0 ⇒ f′(x) = ${d === null ? "∅" : fmtNum(d, 4)}`}
          </p>
        </div>
      }
      rows={[
        ...[1, 0.1, 0.01, 0.001].map((hh) => {
          const v = differenceQuotient(f, traceX, hh);
          return { label: `h = ${hh}`, value: v === null ? "—" : fmtNum(v, 5) };
        }),
        { label: t("limit"), value: d === null ? "—" : fmtNum(d, 5), emphasize: true },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/** Type #11 (Side-by-Side Equivalence): f(x) next to f(−x) at real sample points, revealing even, odd or no symmetry. */
export function GraphSymmetryEquivalence() {
  const t = useTranslations("tools.graphing-calculator.viz.symmetry");
  const tv = useTranslations("tools.graphing-calculator.viz");
  const { analysis: a } = useGraphLive();
  const rel = (fx: number, fn: number) => {
    const tol = 1e-7 * Math.max(1, Math.abs(fx), Math.abs(fn));
    if (Math.abs(fx - fn) <= tol) return "=";
    if (Math.abs(fx + fn) <= tol) return "= −";
    return "≠";
  };
  const rule = a.symmetry === "even" ? "f(−x) = f(x)" : a.symmetry === "odd" ? "f(−x) = −f(x)" : "f(−x) ≠ ±f(x)";
  return (
    <IndicatorCard
      ns="symmetry"
      indicator={
        <div dir="ltr" className="w-[min(100%,380px)] lg:w-[380px]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2 text-sm">
            <div className="rounded-lg bg-blue-600 py-1.5 text-center text-xs font-bold text-white">f(x)</div>
            <div />
            <div className="rounded-lg bg-violet-600 py-1.5 text-center text-xs font-bold text-white">f(−x)</div>
            {a.symmetrySamples.map((s) => (
              <div key={s.x} className="contents">
                <div className="rounded-lg bg-blue-50 px-2 py-2 text-center font-mono dark:bg-blue-500/10">
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{`x = ${fmtNum(s.x, 2)}`}</div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200">{fmtNum(s.fx, 4)}</div>
                </div>
                <div className="text-center font-mono text-base font-bold text-zinc-600 dark:text-zinc-300">{rel(s.fx, s.fNegX)}</div>
                <div className="rounded-lg bg-violet-50 px-2 py-2 text-center font-mono dark:bg-violet-500/10">
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{`x = ${fmtNum(-s.x, 2)}`}</div>
                  <div className="font-semibold text-violet-800 dark:text-violet-200">{fmtNum(s.fNegX, 4)}</div>
                </div>
              </div>
            ))}
          </div>
          {a.symmetrySamples.length === 0 && <p className="text-center text-xs text-zinc-500">{tv("none")}</p>}
        </div>
      }
      rows={[
        { label: t("tested"), value: String(a.symmetrySamples.length) },
        { label: t("rule"), value: rule },
        { label: t("verdict"), value: tv(a.symmetry), emphasize: true, note: t(`meaning.${a.symmetry}`) },
      ]}
    />
  );
}
