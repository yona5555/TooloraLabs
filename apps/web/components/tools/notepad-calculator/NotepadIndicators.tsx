"use client";
import { Fragment, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  dependencyTree,
  evaluationSteps,
  inputImpacts,
  magnitude,
  roundingViews,
  scopeBefore,
  substituteExpression,
  valueWithOverride,
  type DependencyNode,
  type NotepadAnalysis,
  type NotepadLine,
  type NotepadOpFamily,
} from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import SensitivityBars from "@/components/tools/markets/SensitivityBars";
import { KIND_COLORS, OP_COLORS, compact, lineNo, num, pct, raw, signed } from "./format";

export type IndicatorProps = { a: NotepadAnalysis; text: string };
type LineProps = IndicatorProps & { line: number; onLine: (i: number) => void };
type VarProps = IndicatorProps & { variable: string | null; onVariable: (name: string) => void };

function useInd() {
  return useTranslations("tools.notepad-calculator.ind");
}

function Empty({ msg }: { msg: string }) {
  return <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{msg}</p>;
}

/** SVG coordinates rounded so server and browser render identical markup (log10/float ulps differ). */
const r2 = (v: number) => Math.round(v * 100) / 100;

const calculated = (a: NotepadAnalysis) => a.lines.filter((l) => l.value !== null);
const labelOf = (l: NotepadLine) => l.name ?? lineNo(l.index);

/** Pick any calculated line; shared by the steps, formula and rounding cards. */
function LinePicker({ a, line, onLine }: { a: NotepadAnalysis; line: number; onLine: (i: number) => void }) {
  const t = useInd();
  const options = calculated(a).map((l) => l.index);
  if (options.length < 2) return null;
  return <PillGroup label={t("pickLine")} options={options} value={line} onChange={onLine} format={(i) => `${lineNo(i)} ${a.lines[i].name ?? ""}`.trim()} />;
}

function VariablePicker({ names, value, onChange }: { names: string[]; value: string; onChange: (n: string) => void }) {
  const t = useInd();
  if (names.length < 2) return null;
  return <PillGroup label={t("pickInput")} options={names} value={value} onChange={onChange} />;
}

/* 1 — §31 type 7: every calculated value in line order, the bottom line highlighted against the mean. */
export function LineValuesTrend({ a }: IndicatorProps) {
  const t = useInd();
  const pts = calculated(a);
  const W = 560;
  const H = 220;
  const P = { l: 52, r: 16, t: 24, b: 30 };
  const vals = pts.map((l) => l.value as number);
  const lo = Math.min(0, ...vals);
  const hi = Math.max(0, ...vals);
  const span = hi - lo || 1;
  const x = (i: number) => r2(P.l + (pts.length < 2 ? (W - P.l - P.r) / 2 : (i / (pts.length - 1)) * (W - P.l - P.r)));
  const y = (v: number) => r2(P.t + (1 - (v - lo) / span) * (H - P.t - P.b));
  const mean = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  const peak = pts.reduce((b, l) => ((l.value as number) > (b.value as number) ? l : b), pts[0]);
  const last = pts[pts.length - 1];
  return (
    <IndicatorCard
      id="line-values"
      title={t("trend.title")}
      heading={t("trend.heading", { count: pts.length })}
      intro={t("trend.intro")}
      fallback={pts.length ? undefined : <Empty msg={t("empty")} />}
      worked={
        last
          ? {
              title: t("worked"),
              rows: [
                { label: t("trend.rowCount"), value: String(pts.length) },
                { label: t("trend.rowPeak"), value: `${labelOf(peak)} = ${num(peak.value as number)}` },
                { label: t("trend.rowMean"), value: `${num(vals.reduce((s, v) => s + v, 0))} ÷ ${pts.length} = ${num(mean)}` },
                { label: t("trend.rowFinal"), value: `${labelOf(last)} = ${num(last.value as number)}` },
                { label: t("trend.rowVsMean"), value: mean ? pct(((last.value as number) / mean) * 100) : "—", emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="overflow-x-auto" dir="ltr">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("trend.title")} data-testid="ind-trend" className="mx-auto h-auto max-w-full">
          {[lo, (lo + hi) / 2, hi].map((v) => (
            <g key={v}>
              <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
              <text x={P.l - 6} y={y(v) + 3} textAnchor="end" className="fill-zinc-400 font-mono text-[10px]">
                {compact(v)}
              </text>
            </g>
          ))}
          <line x1={P.l} x2={W - P.r} y1={y(mean)} y2={y(mean)} strokeDasharray="5 4" className="stroke-amber-500" />
          <text x={W - P.r} y={y(mean) - 5} textAnchor="end" className="fill-amber-600 text-[10px] font-semibold dark:fill-amber-400">
            {t("trend.mean", { v: compact(mean) })}
          </text>
          <polyline points={pts.map((l, i) => `${x(i)},${y(l.value as number)}`).join(" ")} fill="none" strokeWidth={2.5} className="stroke-blue-600 transition-all duration-500 dark:stroke-blue-400" />
          {pts.map((l, i) => {
            const isLast = l === last;
            return (
              <g key={l.index}>
                <circle cx={x(i)} cy={y(l.value as number)} r={isLast ? 7 : 4} className={isLast ? "fill-emerald-500 stroke-white" : "fill-blue-600 dark:fill-blue-400"} strokeWidth={2} />
                <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px]">
                  {lineNo(l.index)}
                </text>
                <text x={x(i)} y={y(l.value as number) - 10} textAnchor="middle" className={`font-mono text-[10px] font-semibold ${isLast ? "fill-emerald-600 dark:fill-emerald-400" : "fill-zinc-700 dark:fill-zinc-200"}`}>
                  {compact(l.value as number)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* 2 — §31 type 6: outer ring = what each line is, inner ring = which operations the notes use. */
export function CompositionDonut({ a }: IndicatorProps) {
  const t = useInd();
  const S = 168;
  const c = S / 2;
  const kinds = (["assign", "expr", "note", "blank"] as const).filter((k) => a.counts[k] > 0);
  const ops = (Object.keys(OP_COLORS) as NotepadOpFamily[]).filter((k) => a.opTotals[k] > 0);
  const totalOps = ops.reduce((s, k) => s + a.opTotals[k], 0);
  const ring = (values: number[], colors: string[], r: number, w: number) => {
    const total = values.reduce((s, v) => s + v, 0) || 1;
    const circ = 2 * Math.PI * r;
    let acc = 0;
    return values.map((v, i) => {
      const len = r2((v / total) * circ);
      const el = <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={colors[i]} strokeWidth={w} strokeDasharray={`${len} ${r2(circ - len)}`} strokeDashoffset={r2(-acc)} transform={`rotate(-90 ${c} ${c})`} className="transition-all duration-500" />;
      acc += len;
      return el;
    });
  };
  const topOp = ops.reduce<NotepadOpFamily | null>((b, k) => (b === null || a.opTotals[k] > a.opTotals[b] ? k : b), null);
  return (
    <IndicatorCard
      id="composition"
      title={t("donut.title")}
      heading={t("donut.heading", { lines: a.lines.length, ops: totalOps })}
      intro={t("donut.intro")}
      fallback={a.counts.nonBlank ? undefined : <Empty msg={t("empty")} />}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("donut.rowCalc"), value: `${a.counts.calculated} / ${a.counts.nonBlank}` },
          { label: t("donut.rowNotes"), value: String(a.counts.note) },
          { label: t("donut.rowOps"), value: String(totalOps) },
          { label: t("donut.rowTop"), value: topOp ? `${t(`ops.${topOp}`)} · ${a.opTotals[topOp]}` : "—" },
          { label: t("donut.rowCoverage"), value: pct(a.coverage), emphasize: true },
        ],
      }}
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center" data-testid="ind-donut">
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={t("donut.title")}>
          {ring(kinds.map((k) => a.counts[k]), kinds.map((k) => KIND_COLORS[k]), 70, 18)}
          {totalOps > 0 ? ring(ops.map((k) => a.opTotals[k]), ops.map((k) => OP_COLORS[k]), 46, 14) : <circle cx={c} cy={c} r={46} fill="none" strokeWidth={14} className="stroke-zinc-100 dark:stroke-zinc-800" />}
          <text x={c} y={c - 2} textAnchor="middle" className="fill-zinc-900 font-mono text-lg font-bold dark:fill-zinc-100">
            {pct(a.coverage, 0)}
          </text>
          <text x={c} y={c + 14} textAnchor="middle" className="fill-zinc-500 text-[9px]">
            {t("donut.center")}
          </text>
        </svg>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          <p className="col-span-2 text-xs font-semibold uppercase text-zinc-400">{t("donut.outer")}</p>
          {kinds.map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ background: KIND_COLORS[k] }} />
              <span className="text-zinc-700 dark:text-zinc-200">{t(`kinds.${k}`)}</span>
              <span className="ms-auto font-mono font-semibold">{a.counts[k]}</span>
            </span>
          ))}
          {kinds.length % 2 === 1 && <span aria-hidden />}
          <p className="col-span-2 mt-2 text-xs font-semibold uppercase text-zinc-400">{t("donut.inner")}</p>
          {ops.map((k) => (
            <span key={k} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: OP_COLORS[k] }} />
              <span className="text-zinc-700 dark:text-zinc-200">{t(`ops.${k}`)}</span>
              <span className="ms-auto font-mono font-semibold">{a.opTotals[k]}</span>
            </span>
          ))}
          {ops.length === 0 && <span className="col-span-2 text-xs text-zinc-400">{t("donut.noOps")}</span>}
        </div>
      </div>
    </IndicatorCard>
  );
}

/* 3 — §31 type 5: every variable in scope, ranked by size, tagged input / derived / reassigned. */
export function VariablesRanked({ a }: IndicatorProps) {
  const t = useInd();
  const rows = [...a.variables].sort((x, y) => Math.abs(y.value) - Math.abs(x.value));
  const max = Math.abs(rows[0]?.value ?? 0) || 1;
  const sumAbs = rows.reduce((s, v) => s + Math.abs(v.value), 0) || 1;
  const top = rows[0];
  const tag = (v: (typeof rows)[number]) => (v.assignments > 1 ? "reassigned" : v.isInput ? "input" : "derived");
  const tagClass = { input: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300", derived: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300", reassigned: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" };
  return (
    <IndicatorCard
      id="variables"
      title={t("vars.title")}
      heading={t("vars.heading", { count: rows.length })}
      intro={t("vars.intro")}
      fallback={rows.length ? undefined : <Empty msg={t("noVars")} />}
      worked={
        top
          ? {
              title: t("worked"),
              rows: [
                { label: t("vars.rowTop"), value: `${top.name} = ${num(top.value)}` },
                { label: t("vars.rowSum"), value: num(sumAbs) },
                { label: t("vars.rowShare"), value: `${num(Math.abs(top.value))} ÷ ${num(sumAbs)}` },
                { label: t("vars.rowSplit"), value: `${rows.filter((v) => v.isInput).length} / ${rows.filter((v) => !v.isInput).length}` },
                { label: t("vars.rowResult"), value: pct((Math.abs(top.value) / sumAbs) * 100), emphasize: true },
              ],
            }
          : null
      }
    >
      <ol className="space-y-2" data-testid="ind-vars">
        {rows.map((v, i) => (
          <li key={v.name} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-2">
            <span className="text-center font-mono text-xs font-bold text-zinc-400">{i + 1}</span>
            <span className="min-w-0">
              <span className="flex items-baseline justify-between gap-2">
                <span dir="ltr" className="truncate font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {v.name}
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagClass[tag(v)]}`}>
                  {t(`vars.tag.${tag(v)}`)} · {lineNo(v.line)} · {t("vars.used", { count: v.usedBy })}
                </span>
              </span>
              <span className="mt-1 block h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <span className={`block h-full rounded-full transition-all duration-500 ${v.value < 0 ? "bg-red-500" : v.isInput ? "bg-blue-600" : "bg-violet-500"}`} style={{ width: `${(Math.abs(v.value) / max) * 100}%` }} />
              </span>
            </span>
            <span dir="ltr" className="text-end font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {num(v.value)}
            </span>
          </li>
        ))}
      </ol>
    </IndicatorCard>
  );
}

/* 4 — §31 type 3: the definitions that feed the bottom line, as a hierarchy down to the raw inputs. */
export function DependencyFlow({ a }: IndicatorProps) {
  const t = useInd();
  const tree = useMemo(() => (a.finalIndex >= 0 ? dependencyTree(a, a.finalIndex) : null), [a]);
  const stats = useMemo(() => {
    let nodes = 0;
    let depth = 0;
    const leaves = new Set<string>();
    const visit = (n: DependencyNode, d: number) => {
      nodes++;
      depth = Math.max(depth, d);
      if (!n.children.length && n.name) leaves.add(n.name);
      n.children.forEach((c) => visit(c, d + 1));
    };
    if (tree) visit(tree, 0);
    return { nodes, depth, leaves: [...leaves] };
  }, [tree]);
  const final = a.lines[a.finalIndex];
  const Node = ({ n, level }: { n: DependencyNode; level: number }) => (
    <li className="relative">
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${level === 0 ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/10" : n.children.length ? "border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10" : "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"}`}>
        <span className="font-mono text-[10px] text-zinc-400">{lineNo(n.line)}</span>
        <span dir="ltr" className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {n.name ?? t("flow.bottom")}
        </span>
        <span dir="ltr" className="ms-auto font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {num(n.value)}
        </span>
      </div>
      {n.children.length > 0 && (
        <ul className="ms-4 mt-1.5 space-y-1.5 border-s-2 border-dashed border-zinc-300 ps-4 dark:border-zinc-600">
          {n.children.map((c, i) => (
            <Node key={`${c.line}-${i}`} n={c} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
  return (
    <IndicatorCard
      id="dependencies"
      title={t("flow.title")}
      heading={t("flow.heading", { nodes: stats.nodes, depth: stats.depth })}
      intro={t("flow.intro")}
      fallback={tree ? undefined : <Empty msg={t("empty")} />}
      worked={
        final && tree
          ? {
              title: t("worked"),
              rows: [
                { label: t("flow.rowLine"), value: `${lineNo(final.index)}: ${final.expr ?? ""}` },
                { label: t("flow.rowSub"), value: substituteExpression(final.expr ?? "", scopeBefore(a, final.index)) },
                { label: t("flow.rowLeaves"), value: stats.leaves.join(", ") || "—" },
                { label: t("flow.rowDepth"), value: String(stats.depth) },
                { label: t("flow.rowResult"), value: num(final.value as number), emphasize: true },
              ],
            }
          : null
      }
    >
      {tree && (
        <ul className="max-h-[420px] overflow-y-auto pe-1" data-testid="ind-flow">
          <Node n={tree} level={0} />
        </ul>
      )}
    </IndicatorCard>
  );
}

/* 5 — §31 type 13: the selected line solved one operation per step, in precedence order. */
export function EvaluationStairs({ a, line, onLine }: LineProps) {
  const t = useInd();
  const l = a.lines[line];
  const steps = useMemo(() => {
    if (!l?.expr) return [];
    try {
      return evaluationSteps(l.expr, scopeBefore(a, l.index));
    } catch {
      return [];
    }
  }, [a, l]);
  const color = { var: "bg-blue-600", op: "bg-amber-500", fn: "bg-teal-600", neg: "bg-lime-600" };
  return (
    <IndicatorCard
      id="steps"
      title={t("steps.title")}
      heading={t("steps.heading", { line: lineNo(line), count: steps.length })}
      intro={t("steps.intro")}
      controls={<LinePicker a={a} line={line} onLine={onLine} />}
      fallback={l?.expr ? undefined : <Empty msg={t("empty")} />}
      worked={
        l?.expr
          ? {
              title: t("worked"),
              rows: [
                { label: t("steps.rowLine"), value: l.expr },
                { label: t("steps.rowSubs"), value: String(steps.filter((s) => s.kind === "var").length) },
                { label: t("steps.rowOps"), value: String(steps.filter((s) => s.kind !== "var").length) },
                { label: t("steps.rowDepth"), value: String(l.depth) },
                { label: t("steps.rowResult"), value: raw(l.value as number), emphasize: true },
              ],
            }
          : null
      }
    >
      {steps.length === 0 ? (
        <p className="rounded-xl bg-zinc-50 p-4 text-center font-mono text-sm dark:bg-zinc-800/40" dir="ltr">
          {l?.expr} = {l?.value !== null && l?.value !== undefined ? raw(l.value) : ""}
          <span className="mt-1 block font-sans text-xs text-zinc-500">{t("steps.literal")}</span>
        </p>
      ) : (
        <ol className="space-y-1.5" data-testid="ind-steps">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2 transition-all duration-300" style={{ paddingInlineStart: `${Math.min(i, 8) * 1.25}rem` }}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold text-white ${color[s.kind]}`}>{i + 1}</span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{t(`steps.kind.${s.kind}`)}</span>
              <span dir="ltr" className={`ms-auto truncate rounded-lg border px-3 py-1 font-mono text-sm ${i === steps.length - 1 ? "border-emerald-400 bg-emerald-50 font-bold dark:border-emerald-500/50 dark:bg-emerald-500/10" : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"}`}>
                {s.text}
              </span>
            </li>
          ))}
        </ol>
      )}
    </IndicatorCard>
  );
}

/* 6 — §31 type 18: the selected line as a formula, then with every name replaced by its value. */
export function LiveFormula({ a, line, onLine }: LineProps) {
  const t = useInd();
  const l = a.lines[line];
  const scope = useMemo(() => (l ? scopeBefore(a, l.index) : {}), [a, l]);
  const tokens = (l?.expr ?? "").split(/([a-zA-Z_][a-zA-Z0-9_]*)/);
  return (
    <IndicatorCard
      id="formula"
      title={t("formula.title")}
      heading={t("formula.heading", { line: lineNo(line) })}
      intro={t("formula.intro")}
      controls={<LinePicker a={a} line={line} onLine={onLine} />}
      fallback={l?.expr ? undefined : <Empty msg={t("empty")} />}
      worked={
        l?.expr
          ? {
              title: t("worked"),
              rows: [
                ...l.deps.map((d) => ({ label: `${d.name} (${lineNo(d.line)})`, value: raw(scope[d.name]) })),
                ...(l.deps.length === 0 ? [{ label: t("formula.rowNoVars"), value: "—" }] : []),
                { label: t("formula.rowSub"), value: substituteExpression(l.expr, scope) },
                { label: t("formula.rowResult"), value: raw(l.value as number), emphasize: true },
              ],
            }
          : null
      }
    >
      {l?.expr && (
        <div className="space-y-3" dir="ltr" data-testid="ind-formula">
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl bg-zinc-50 p-4 font-mono text-lg dark:bg-zinc-800/40">
            {l.name && <span className="font-bold text-blue-700 dark:text-blue-300">{l.name} =</span>}
            {tokens.map((tok, i) =>
              tok.toLowerCase() in scope ? (
                <span key={i} className="rounded-md bg-violet-100 px-1.5 font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                  {tok}
                </span>
              ) : (
                <Fragment key={i}>{tok}</Fragment>
              )
            )}
          </div>
          <div className="text-center text-zinc-400">↓</div>
          <div className="flex flex-wrap items-center justify-center gap-1 rounded-xl bg-zinc-50 p-4 font-mono text-lg dark:bg-zinc-800/40">
            {tokens.map((tok, i) =>
              tok.toLowerCase() in scope ? (
                <span key={i} className="rounded-md bg-blue-100 px-1.5 font-semibold text-blue-800 dark:bg-blue-500/20 dark:text-blue-200">
                  {raw(scope[tok.toLowerCase()])}
                </span>
              ) : (
                <Fragment key={i}>{tok}</Fragment>
              )
            )}
          </div>
          <div className="text-center text-zinc-400">↓</div>
          <p className="rounded-xl bg-emerald-50 p-3 text-center font-mono text-2xl font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">= {num(l.value as number)}</p>
        </div>
      )}
    </IndicatorCard>
  );
}

/* 7 — §31 type 9: every assignment as a station, showing how the scope grows down the page. */
export function ScopeTimeline({ a }: IndicatorProps) {
  const t = useInd();
  const stations = a.lines.filter((l) => l.kind === "assign");
  const usedAt = (l: NotepadLine) => a.lines.filter((x) => x.deps.some((d) => d.line === l.index)).map((x) => lineNo(x.index));
  const reassigns = stations.filter((s) => s.reassign).length;
  const last = stations[stations.length - 1];
  return (
    <IndicatorCard
      id="timeline"
      title={t("timeline.title")}
      heading={t("timeline.heading", { count: stations.length })}
      intro={t("timeline.intro")}
      fallback={stations.length ? undefined : <Empty msg={t("noVars")} />}
      worked={
        last
          ? {
              title: t("worked"),
              rows: [
                { label: t("timeline.rowStations"), value: String(stations.length) },
                { label: t("timeline.rowReassign"), value: String(reassigns) },
                { label: t("timeline.rowScope"), value: String(a.variables.length) },
                { label: t("timeline.rowLast"), value: `${lineNo(last.index)} ${last.name}` },
                { label: t("timeline.rowValue"), value: num(last.value as number), emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="overflow-x-auto pb-2">
        <ol className="relative flex min-w-max gap-2 pt-4 sm:min-w-0" data-testid="ind-timeline">
          <span aria-hidden className="absolute inset-x-4 top-[1.6rem] h-0.5 bg-zinc-200 dark:bg-zinc-700" />
          {stations.map((s, i) => {
            const used = usedAt(s);
            return (
              <li key={s.index} className="relative flex w-24 flex-col items-center text-center sm:w-auto sm:min-w-0 sm:flex-1">
                <span className={`z-10 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white ${s.reassign ? "bg-amber-500" : s.deps.length ? "bg-violet-500" : "bg-blue-600"}`}>{i + 1}</span>
                <span className="mt-1 font-mono text-[10px] text-zinc-400">{lineNo(s.index)}</span>
                <span dir="ltr" className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {s.name}
                </span>
                <span dir="ltr" className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
                  {compact(s.value as number)}
                </span>
                <span className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{s.reassign ? t("timeline.reassigned") : s.deps.length ? t("timeline.derived") : t("timeline.input")}</span>
                <span className="text-[10px] text-zinc-400">{used.length ? t("timeline.usedAt", { lines: used.join(" ") }) : t("timeline.unused")}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </IndicatorCard>
  );
}

/* 8 — §31 type 12: the bottom line with one input lowered / as typed / raised. */
export function SensitivityTrio({ a, text, variable, onVariable }: VarProps) {
  const t = useInd();
  const [shift, setShift] = useState(10);
  const inputs = a.variables.filter((v) => v.isInput && v.line < a.finalIndex);
  const v = inputs.find((x) => x.name === variable) ?? inputs[0];
  const f0 = a.finalValue;
  const lowIn = v ? v.value * (1 - shift / 100) : 0;
  const highIn = v ? v.value * (1 + shift / 100) : 0;
  const low = v ? valueWithOverride(text, a.finalIndex, v.name, lowIn) : null;
  const high = v ? valueWithOverride(text, a.finalIndex, v.name, highIn) : null;
  const ok = v && f0 !== null && low !== null && high !== null;
  const d = (x: number) => (f0 ? `${signed(x - f0)} (${pct(((x - f0) / Math.abs(f0)) * 100)})` : signed(x - (f0 ?? 0)));
  return (
    <IndicatorCard
      id="sensitivity"
      title={t("trio.title")}
      heading={t("trio.heading", { name: v?.name ?? "—", shift })}
      intro={t("trio.intro")}
      controls={
        <div className="flex flex-wrap gap-3">
          <VariablePicker names={inputs.map((x) => x.name)} value={v?.name ?? ""} onChange={onVariable} />
          <PillGroup label={t("trio.shift")} options={[5, 10, 25, 50] as const} value={shift as 5 | 10 | 25 | 50} onChange={setShift} format={(s) => `±${s}%`} />
        </div>
      }
      fallback={ok ? undefined : <Empty msg={t("noInputs")} />}
      worked={
        ok
          ? {
              title: t("worked"),
              rows: [
                { label: t("trio.rowInput"), value: `${v.name} = ${num(v.value)}` },
                { label: t("trio.rowLow"), value: `${num(lowIn)} → ${num(low)}` },
                { label: t("trio.rowHigh"), value: `${num(highIn)} → ${num(high)}` },
                { label: t("trio.rowSpread"), value: num(Math.abs(high - low)) },
                { label: t("trio.rowResult"), value: f0 ? pct((Math.abs(high - low) / Math.abs(f0)) * 100) : "—", emphasize: true },
              ],
            }
          : null
      }
    >
      {ok && (
        <SensitivityBars
          points={[
            { label: t("trio.low", { shift }), sub: `${v.name} = ${compact(lowIn)}`, value: Math.abs(low), display: num(low), delta: d(low) },
            { label: t("trio.now"), sub: `${v.name} = ${compact(v.value)}`, value: Math.abs(f0), display: num(f0), delta: t("trio.asTyped") },
            { label: t("trio.high", { shift }), sub: `${v.name} = ${compact(highIn)}`, value: Math.abs(high), display: num(high), delta: d(high) },
          ]}
        />
      )}
    </IndicatorCard>
  );
}

/* 9 — §31 type 1: how much the bottom line moves when each input rises 10 %. */
export function InputImpactBars({ a, text }: IndicatorProps) {
  const t = useInd();
  const impacts = useMemo(() => inputImpacts(a, text, 10), [a, text]);
  const W = 560;
  const H = 230;
  const P = { t: 28, b: 58 };
  const max = Math.max(...impacts.map((i) => Math.abs(i.delta)), 1e-12);
  const hasNeg = impacts.some((i) => i.delta < 0);
  const zero = r2(hasNeg ? P.t + (H - P.t - P.b) / 2 : H - P.b);
  const scale = (hasNeg ? (H - P.t - P.b) / 2 : H - P.t - P.b) / max;
  const bw = r2(Math.min(64, (W - 40) / Math.max(1, impacts.length) - 16));
  const top = impacts[0];
  return (
    <IndicatorCard
      id="impact"
      title={t("impact.title")}
      heading={t("impact.heading", { count: impacts.length })}
      intro={t("impact.intro")}
      fallback={impacts.length ? undefined : <Empty msg={t("noInputs")} />}
      worked={
        top && a.finalValue !== null
          ? {
              title: t("worked"),
              rows: [
                { label: t("impact.rowTop"), value: `${top.name} = ${num(top.base)}` },
                { label: t("impact.rowRaised"), value: `${num(top.base)} × 1.1 = ${num(top.base * 1.1)}` },
                { label: t("impact.rowNew"), value: `${num(a.finalValue)} → ${num(top.high ?? 0)}` },
                { label: t("impact.rowElasticity"), value: num(top.elasticity) },
                { label: t("impact.rowResult"), value: signed(top.delta), emphasize: true, note: t("impact.note") },
              ],
            }
          : null
      }
    >
      <div className="overflow-x-auto" dir="ltr">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("impact.title")} className="mx-auto h-auto max-w-full" data-testid="ind-impact">
          <line x1={10} x2={W - 10} y1={zero} y2={zero} className="stroke-zinc-300 dark:stroke-zinc-600" />
          {impacts.map((im, i) => {
            const cx = r2(20 + ((i + 0.5) * (W - 40)) / impacts.length);
            const h = r2(Math.abs(im.delta) * scale);
            const yTop = im.delta >= 0 ? zero - h : zero;
            return (
              <g key={im.name}>
                <rect x={cx - bw / 2} y={yTop} width={bw} height={Math.max(h, 1)} rx={4} className={`transition-all duration-500 ${im.delta >= 0 ? "fill-emerald-500" : "fill-red-500"}`} />
                <text x={cx} y={im.delta >= 0 ? yTop - 6 : yTop + h + 14} textAnchor="middle" className="fill-zinc-900 font-mono text-[11px] font-bold dark:fill-zinc-100">
                  {signed(im.delta)}
                </text>
                <text x={cx} y={H - 22} textAnchor="middle" className="fill-zinc-700 font-mono text-[11px] font-semibold dark:fill-zinc-200">
                  {im.name}
                </text>
                <text x={cx} y={H - 8} textAnchor="middle" className="fill-zinc-400 font-mono text-[10px]">
                  {pct(im.elasticity * 10)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* 10 — §31 type 10: every result placed on a powers-of-ten scale. */
export function MagnitudeScale({ a }: IndicatorProps) {
  const t = useInd();
  const pts = calculated(a).filter((l) => l.value !== 0);
  const mags = pts.map((l) => Math.log10(Math.abs(l.value as number)));
  const lo = Math.floor(Math.min(...mags, 0));
  const hi = Math.ceil(Math.max(...mags, 1));
  const W = 560;
  const P = 30;
  const x = (m: number) => r2(P + ((m - lo) / (hi - lo || 1)) * (W - 2 * P));
  const big = pts.reduce((b, l) => (Math.abs(l.value as number) > Math.abs(b.value as number) ? l : b), pts[0]);
  const small = pts.reduce((b, l) => (Math.abs(l.value as number) < Math.abs(b.value as number) ? l : b), pts[0]);
  const ratio = big && small ? Math.abs(big.value as number) / Math.abs(small.value as number) : 1;
  return (
    <IndicatorCard
      id="magnitude"
      title={t("mag.title")}
      heading={t("mag.heading", { orders: hi - lo })}
      intro={t("mag.intro")}
      fallback={pts.length ? undefined : <Empty msg={t("empty")} />}
      worked={
        big
          ? {
              title: t("worked"),
              rows: [
                { label: t("mag.rowBig"), value: `${labelOf(big)} = ${num(big.value as number)}` },
                { label: t("mag.rowSmall"), value: `${labelOf(small)} = ${num(small.value as number)}` },
                { label: t("mag.rowRatio"), value: `${num(ratio)}×` },
                { label: t("mag.rowLog"), value: `log10(${compact(ratio)}) = ${num(Math.log10(ratio))}` },
                { label: t("mag.rowResult"), value: `10^${magnitude(big.value as number)} … 10^${magnitude(small.value as number)}`, emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="overflow-x-auto" dir="ltr">
        <svg width={W} height={76 + 20 * Math.min(pts.length, 6)} viewBox={`0 0 ${W} ${76 + 20 * Math.min(pts.length, 6)}`} role="img" aria-label={t("mag.title")} className="mx-auto h-auto max-w-full" data-testid="ind-mag">
          <defs>
            <linearGradient id="np-mag" x1="0" x2="1">
              <stop offset="0" stopColor="#bfdbfe" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
          <rect x={P} y={20} width={W - 2 * P} height={14} rx={7} fill="url(#np-mag)" />
          {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((m) => (
            <g key={m}>
              <line x1={x(m)} x2={x(m)} y1={16} y2={38} className="stroke-white dark:stroke-zinc-900" strokeWidth={1.5} />
              <text x={x(m)} y={52} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px]">
                {`10^${m}`}
              </text>
            </g>
          ))}
          {pts.slice(0, 12).map((l, i) => {
            const px = x(Math.log10(Math.abs(l.value as number)));
            const row = 66 + (i % 6) * 20;
            return (
              <g key={l.index}>
                <line x1={px} x2={px} y1={34} y2={row - 10} className="stroke-zinc-300 dark:stroke-zinc-600" strokeDasharray="2 2" />
                <circle cx={px} cy={27} r={5} className={l.index === a.finalIndex ? "fill-emerald-500 stroke-white" : "fill-white stroke-blue-700"} strokeWidth={2} />
                <text x={px} y={row} textAnchor={px > W - 120 ? "end" : px < 120 ? "start" : "middle"} className={`font-mono text-[10px] ${l.index === a.finalIndex ? "fill-emerald-600 font-bold dark:fill-emerald-400" : "fill-zinc-700 dark:fill-zinc-200"}`}>
                  {`${labelOf(l)} ${compact(l.value as number)}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </IndicatorCard>
  );
}

/* 11 — §31 type 11: one result written four equivalent ways, from raw float to what the notepad prints. */
export function RoundingEquivalence({ a, line, onLine }: LineProps) {
  const t = useInd();
  const l = a.lines[line];
  const r = l?.value !== null && l?.value !== undefined ? roundingViews(l.value) : null;
  const cards = r
    ? [
        { k: "raw", v: r.raw, tone: "border-zinc-300 dark:border-zinc-600" },
        { k: "shown", v: r.shown, tone: "border-blue-500 bg-blue-50 dark:bg-blue-500/10" },
        { k: "twoDp", v: r.twoDp, tone: "border-violet-300 dark:border-violet-500/50" },
        { k: "sci", v: r.scientific, tone: "border-teal-300 dark:border-teal-500/50" },
      ]
    : [];
  return (
    <IndicatorCard
      id="rounding"
      title={t("round.title")}
      heading={t("round.heading", { line: lineNo(line) })}
      intro={t("round.intro")}
      controls={<LinePicker a={a} line={line} onLine={onLine} />}
      fallback={r ? undefined : <Empty msg={t("empty")} />}
      worked={
        r
          ? {
              title: t("worked"),
              rows: [
                { label: t("round.rowRaw"), value: r.raw },
                { label: t("round.rowRule"), value: "round(x × 10⁸) ÷ 10⁸" },
                { label: t("round.rowShown"), value: r.shown },
                { label: t("round.rowError"), value: r.hiddenError ? r.hiddenError.toExponential(2) : "0" },
                { label: t("round.rowResult"), value: r.hiddenError ? t("round.hidden") : t("round.exact"), emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="ind-round">
        {cards.map((c, i) => (
          <div key={c.k} className={`relative flex min-w-0 flex-col rounded-xl border-2 p-3 ${c.tone}`}>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t(`round.card.${c.k}`)}</span>
            <span dir="ltr" className="mt-2 break-all font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">
              {c.v}
            </span>
            <span className="mt-1 text-[10px] text-zinc-400">{t(`round.cardNote.${c.k}`)}</span>
            {i < cards.length - 1 && <span aria-hidden className="absolute -end-3 top-1/2 z-10 hidden -translate-y-1/2 text-zinc-400 lg:block">≈</span>}
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}
