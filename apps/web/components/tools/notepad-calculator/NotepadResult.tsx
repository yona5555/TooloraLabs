"use client";
import { useTranslations } from "next-intl";
import { analyzeNotepad, scopeBefore, substituteExpression, valueWithOverride, type NotepadAnalysis, type NotepadCalculatorOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import SemiGauge from "@/components/tools/markets/SemiGauge";
import { useCountUp } from "@/components/tools/batch-invoice-calculator/format";
import NotepadShareExportModal from "./NotepadShareExportModal";
import { KIND_COLORS, lineNo, num, pct, signed } from "./format";

type Props = { result: NotepadCalculatorOutput; a: NotepadAnalysis; onPickLine: (i: number) => void };

/** A ±10 % nudge rounded to a value people would type (2 dp, or 4 significant digits below 1). */
function nudge(v: number, dir: 1 | -1): number {
  if (v === 0) return dir;
  const n = v * (1 + dir * 0.1);
  return Math.abs(n) >= 1 ? Math.round(n * 100) / 100 : Number(n.toPrecision(4));
}

/** Middle column: the bottom line counting up live, the coverage gauge, and the answer column. */
export default function NotepadResult({ result, a, onPickLine }: Props) {
  const t = useTranslations("tools.notepad-calculator.result");
  const final = a.lines[a.finalIndex];
  const shown = useCountUp(a.finalValue ?? 0);
  const hasAny = a.counts.calculated > 0;

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title={t("bottomLine")}>
        {!hasAny ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("noCalculations")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t("bottomOf", { line: lineNo(a.finalIndex), name: final?.name ?? t("expression") })}
                </p>
                <p dir="ltr" className="mt-1 truncate bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text font-mono text-5xl font-extrabold text-transparent" data-testid="bottom-line">
                  {num(shown)}
                </p>
              </div>
            </div>
            {final?.expr && (
              <p dir="ltr" className="break-all rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                {final.name ? `${final.name} = ` : ""}
                {substituteExpression(final.expr, scopeBefore(a, final.index))}
                <span className="font-bold text-emerald-700 dark:text-emerald-300">{` = ${num(final.value as number)}`}</span>
              </p>
            )}
            <div className="flex flex-col items-center">
              <SemiGauge
                value={a.coverage}
                max={100}
                zones={[
                  { to: 34, className: "stroke-zinc-300 dark:stroke-zinc-700" },
                  { to: 67, className: "stroke-sky-400" },
                  { to: 100, className: "stroke-emerald-500" },
                ]}
                ticks={[25, 50, 75].map((v) => ({ value: v, label: `${v}%` }))}
                ariaLabel={t("coverage")}
                testId="coverage-gauge"
              />
              <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {t("coverageLine", { calc: a.counts.calculated, total: a.counts.nonBlank, pct: pct(a.coverage, 0) })}
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title={t("heading")} action={hasAny ? <NotepadShareExportModal result={result} /> : undefined}>
        <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("calculatedCount", { count: a.counts.calculated })}</p>
        <ol className="divide-y divide-zinc-100 font-mono text-sm dark:divide-zinc-800" data-testid="answer-column">
          {a.lines.map((l) => {
            const isFinal = l.index === a.finalIndex;
            return (
              <li key={l.index}>
                <button
                  type="button"
                  disabled={l.value === null}
                  onClick={() => onPickLine(l.index)}
                  className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-start transition enabled:hover:bg-blue-50 dark:enabled:hover:bg-blue-500/10 ${isFinal ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}`}
                >
                  <span className="w-7 shrink-0 text-[10px] text-zinc-400">{lineNo(l.index)}</span>
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: KIND_COLORS[l.kind] }} />
                  <span dir="auto" className={`min-w-0 flex-1 truncate ${l.kind === "note" ? "font-sans italic text-zinc-500 dark:text-zinc-400" : "text-zinc-700 dark:text-zinc-200"}`}>
                    {l.text || " "}
                  </span>
                  {l.value !== null && (
                    <span dir="ltr" className={`shrink-0 font-semibold ${isFinal ? "text-emerald-700 dark:text-emerald-300" : "text-blue-600 dark:text-blue-400"}`}>
                      {num(l.value)}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </SectionCard>
    </div>
  );
}

/** Input column: − / + buttons that rewrite each typed input by 10 % (§43). */
export function NotepadNudge({ a, text, onSetInput }: { a: NotepadAnalysis; text: string; onSetInput: (line: number, value: number) => void }) {
  const t = useTranslations("tools.notepad-calculator.result");
  const inputs = a.variables.filter((v) => v.isInput && v.line < a.finalIndex);
  return (
    <SectionCard title={t("tweak.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("tweak.intro")}</p>
      {inputs.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("tweak.none")}</p>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800" data-testid="tweak-list">
          {inputs.map((v) => {
            const up = nudge(v.value, 1);
            const ifUp = valueWithOverride(text, a.finalIndex, v.name, up);
            return (
              <li key={v.name} className="flex items-center gap-2 py-2">
                <span className="min-w-0 flex-1">
                  <span dir="ltr" className="block truncate font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-100">{`${v.name} = ${num(v.value)}`}</span>
                  <span dir="ltr" className="block truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                    {ifUp !== null && a.finalValue !== null ? `+10% → ${num(ifUp)} (${signed(ifUp - a.finalValue)})` : "—"}
                  </span>
                </span>
                <button type="button" aria-label={t("tweak.down", { name: v.name })} onClick={() => onSetInput(v.line, nudge(v.value, -1))} className="h-8 w-8 shrink-0 rounded-lg border border-zinc-300 font-mono text-lg font-bold text-zinc-700 transition hover:bg-red-50 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-red-500/10">
                  −
                </button>
                <button type="button" aria-label={t("tweak.up", { name: v.name })} onClick={() => onSetInput(v.line, up)} className="h-8 w-8 shrink-0 rounded-lg border border-zinc-300 font-mono text-lg font-bold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-emerald-500/10" data-testid={`tweak-up-${v.name}`}>
                  +
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

const FUNCTIONS = [
  { key: "root", expr: "sqrt(16)" },
  { key: "power", expr: "2 ^ 10" },
  { key: "abs", expr: "abs(-3.5)" },
  { key: "log10", expr: "log(1000)" },
  { key: "ln", expr: "ln(e)" },
  { key: "exp", expr: "exp(1)" },
  { key: "trig", expr: "sin(pi / 2)" },
  { key: "max", expr: "max(4, 9)" },
] as const;

/** §31 type 17: what a line may contain, each row evaluated live by the notepad's own evaluator; a click appends it. */
export function NotepadSyntaxTable({ onInsert }: { onInsert: (line: string) => void }) {
  const t = useTranslations("tools.notepad-calculator.form");
  return (
    <SectionCard title={t("syntaxTitle")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("syntaxHint")}</p>
      <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800" data-testid="syntax-table">
        {FUNCTIONS.map((f) => (
          <li key={f.key}>
            <button type="button" onClick={() => onInsert(f.expr)} title={t("insert")} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-start transition hover:bg-blue-50 dark:hover:bg-blue-500/10">
              <span className="w-24 shrink-0 truncate text-xs text-zinc-500 dark:text-zinc-400">{t(`fn.${f.key}`)}</span>
              <span dir="ltr" className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-800 dark:text-zinc-100">
                {f.expr}
              </span>
              <span dir="ltr" className="shrink-0 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                {num(analyzeNotepad(f.expr).finalValue ?? 0)}
              </span>
              <span className="shrink-0 rounded bg-zinc-100 px-1.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">+</span>
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
