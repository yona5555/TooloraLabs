"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import { mtSkipCount } from "@tooloralabs/tools";
import MultiplicationTableShareExportModal from "./MultiplicationTableShareExportModal";
import type { MtView, MultiplicationTableOutput, PickFact } from "./types";

type Props = {
  result: MultiplicationTableOutput;
  view: MtView | null;
  onPick: PickFact;
  playing: boolean;
  onTogglePlay: () => void;
};

/** Counts from the previous value to the new one, so every change of fact visibly "lands". */
function useCountUp(target: number, ms = 450) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const v = Math.round(a + (target - a) * (1 - (1 - p) ** 3));
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target, ms]);
  return shown;
}

const W = 360;
const H = 104;
const PAD = 14;
const BASE = 78;

/** §31 type 2: skip counting drawn as jumps along a number line, each arc labelled with +a. */
function SkipCountFlow({ view }: { view: MtView }) {
  const t = useTranslations("tools.multiplication-table-generator.result");
  const marks = mtSkipCount(view.a, view.b);
  const total = marks[marks.length - 1] || 1;
  const x = (v: number) => PAD + ((W - 2 * PAD) * v) / total;
  const labelEvery = Math.max(1, Math.ceil(view.b / 8));
  const arcLabelEvery = Math.max(1, Math.ceil(view.b / 6));
  return (
    <div dir="ltr">
      <style>{`@keyframes mt-draw{to{stroke-dashoffset:0}}`}</style>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("flowAria", { a: view.a, b: view.b })} data-testid="mt-flow" key={`${view.a}-${view.b}`}>
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={2} />
        {marks.slice(1).map((v, i) => {
          const x0 = x(marks[i]);
          const x1 = x(v);
          const h = Math.min(46, Math.max(14, (x1 - x0) * 0.8));
          const len = (x1 - x0) * 1.6 + h;
          return (
            <g key={i}>
              <path
                d={`M ${x0} ${BASE} Q ${(x0 + x1) / 2} ${BASE - h * 1.6} ${x1} ${BASE}`}
                fill="none"
                strokeWidth={2.2}
                className="stroke-blue-600 dark:stroke-blue-400"
                style={{ strokeDasharray: len, strokeDashoffset: len, animation: `mt-draw 380ms ease-out ${Math.min(i, 30) * 60}ms forwards` }}
              />
              {(i % arcLabelEvery === 0 || view.b <= 6) && (
                <text x={(x0 + x1) / 2} y={BASE - h * 0.85 - 4} textAnchor="middle" className="fill-blue-700 font-mono text-[9px] font-semibold dark:fill-blue-300">
                  +{view.fmt(view.a)}
                </text>
              )}
            </g>
          );
        })}
        {marks.map((v, i) => (
          <g key={`m${i}`}>
            <circle cx={x(v)} cy={BASE} r={i === marks.length - 1 ? 5 : 2.5} className={i === marks.length - 1 ? "fill-emerald-500" : "fill-zinc-400 dark:fill-zinc-500"} />
            {(i % labelEvery === 0 || i === marks.length - 1) && (
              <text x={x(v)} y={BASE + 16} textAnchor="middle" className={`font-mono text-[9px] ${i === marks.length - 1 ? "fill-emerald-600 font-bold dark:fill-emerald-400" : "fill-zinc-500 dark:fill-zinc-400"}`}>
                {view.fmt(v)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function MTResult({ result, view, onPick, playing, onTogglePlay }: Props) {
  const t = useTranslations("tools.multiplication-table-generator.result");
  const tRoot = useTranslations("tools.multiplication-table-generator");
  const shown = useCountUp(view?.product ?? 0);
  const selectedRef = useRef<HTMLElement | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Keep the selected row/cell visible inside the scrolling table only (never scrolls the page).
  useEffect(() => {
    const box = boxRef.current;
    const el = selectedRef.current;
    if (!box || !el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top < b.top + 28 || r.bottom > b.bottom) box.scrollTop += r.top - b.top - b.height / 2;
    if (r.left < b.left + 28 || r.right > b.right) box.scrollLeft += r.left - b.left - b.width / 2;
  }, [view?.a, view?.b]);

  const header = (
    <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
      <h2 className="font-bold text-white">{t("heading")}</h2>
      {view && (
        <MultiplicationTableShareExportModal
          inputRows={[]}
          resultRows={
            result.singleRows
              ? result.singleRows.map((row) => ({ label: `${view.fmt(view.a)} × ${view.fmt(row.multiplier)}`, value: view.fmt(row.result) }))
              : result.grid
                ? result.grid.rows.map((row) => ({ label: `${view.fmt(row.rowNumber)} ×`, value: row.cells.map((cell) => view.fmt(cell)).join(", ") }))
                : []
          }
          heroLabel={t("heading")}
          heroValue={`${view.fmt(view.a)} × ${view.fmt(view.b)} = ${view.fmt(view.product)}`}
          sentence={tRoot("shareExport.sentence")}
        />
      )}
    </div>
  );

  if (result.error || !view) {
    const messageKey =
      result.error === "invalid-number" ? "invalidNumber" : result.error === "invalid-multiplier" ? "invalidMultiplier" : result.error === "range-too-large" ? "rangeTooLarge" : "invalidRange";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        {header}
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300" data-testid="mt-error">
            {t(messageKey)}
          </p>
        </div>
      </div>
    );
  }

  const first = view.multipliers[0];
  const last = view.multipliers[view.multipliers.length - 1];
  const step = (d: number) => onPick(view.a, Math.min(last, Math.max(first, view.b + d)));

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      {header}
      <div className="p-4 lg:p-6">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 p-4 text-center dark:from-blue-500/10 dark:to-emerald-500/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">{t("selected")}</p>
          <p dir="ltr" className="mt-1 font-mono text-4xl font-black tracking-tight text-zinc-900 dark:text-white" data-testid="mt-hero">
            <span>{view.fmt(view.a)}</span>
            <span className="mx-2 text-blue-600 dark:text-blue-400">×</span>
            <span>{view.fmt(view.b)}</span>
            <span className="mx-2 text-zinc-400">=</span>
            <span className="text-emerald-600 dark:text-emerald-400" data-testid="mt-hero-product">
              {view.fmt(shown)}
            </span>
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t("groups", { b: view.fmt(view.b), a: view.fmt(view.a) })}</p>
          <SkipCountFlow view={view} />
          <div className="mt-1 flex items-center justify-center gap-2">
            <button type="button" onClick={() => step(-1)} aria-label={t("prev")} className="h-8 w-8 rounded-lg border border-zinc-300 font-mono font-bold text-zinc-700 hover:bg-white dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">
              −
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              data-testid="mt-play"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? t("pause") : t("play")}
            </button>
            <button type="button" onClick={() => step(1)} aria-label={t("next")} className="h-8 w-8 rounded-lg border border-zinc-300 font-mono font-bold text-zinc-700 hover:bg-white dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800">
              +
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("tapHint")}</p>
        <div ref={boxRef} dir="ltr" className="mt-2 max-h-[24rem] overflow-auto">
          {result.singleRows ? (
            <ol className="grid grid-cols-2 gap-1.5" data-testid="mt-table">
              {result.singleRows.map((row) => {
                const on = row.multiplier === view.b;
                return (
                  <li key={row.multiplier}>
                    <button
                      ref={on ? (el) => void (selectedRef.current = el) : undefined}
                      type="button"
                      onClick={() => onPick(view.a, row.multiplier)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-1.5 font-mono text-sm transition ${
                        on ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-100 text-zinc-700 hover:border-blue-300 dark:border-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      <span className={on ? "text-blue-100" : "text-zinc-500 dark:text-zinc-400"}>
                        {view.fmt(view.a)} × {view.fmt(row.multiplier)}
                      </span>
                      <span className="font-bold">{view.fmt(row.result)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : result.grid ? (
            <table className="w-full border-collapse text-center text-xs" data-testid="mt-table">
              <thead>
                <tr>
                  <th className="sticky top-0 z-10 border border-zinc-200 bg-zinc-100 px-1.5 py-1 dark:border-zinc-700 dark:bg-zinc-800">×</th>
                  {result.grid.headers.map((h) => (
                    <th
                      key={h}
                      className={`sticky top-0 z-10 border border-zinc-200 px-1.5 py-1 font-mono dark:border-zinc-700 ${h === view.b ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}
                    >
                      {view.fmt(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.grid.rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <th className={`border border-zinc-200 px-1.5 py-1 font-mono dark:border-zinc-700 ${row.rowNumber === view.a ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>{view.fmt(row.rowNumber)}</th>
                    {row.cells.map((cell, i) => {
                      const col = result.grid!.headers[i];
                      const on = row.rowNumber === view.a && col === view.b;
                      const cross = row.rowNumber === view.a || col === view.b;
                      const mirror = row.rowNumber === view.b && col === view.a && !on;
                      return (
                        <td
                          key={i}
                          ref={on ? (el) => void (selectedRef.current = el) : undefined}
                          onClick={() => onPick(row.rowNumber, col)}
                          className={`cursor-pointer border border-zinc-100 px-1.5 py-1 font-mono dark:border-zinc-800 ${
                            on
                              ? "bg-emerald-500 font-bold text-white"
                              : mirror
                                ? "bg-violet-200 font-semibold text-violet-900 dark:bg-violet-500/30 dark:text-violet-100"
                                : cross
                                  ? "bg-blue-50 text-zinc-800 dark:bg-blue-500/10 dark:text-zinc-100"
                                  : row.rowNumber === col
                                    ? "bg-amber-50 text-zinc-700 dark:bg-amber-500/10 dark:text-zinc-200"
                                    : "text-zinc-600 dark:text-zinc-300"
                          }`}
                        >
                          {view.fmt(cell)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
        {result.grid && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              {t("legendSelected")}
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-violet-300" />
              {t("legendMirror")}
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-200" />
              {t("legendSquares")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
