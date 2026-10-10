"use client";
import { useTranslations } from "next-intl";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

type Term = { sym: string; value: string; tone: "a" | "b" | "ab" | "res" };
const TONE: Record<Term["tone"], string> = {
  a: "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200",
  b: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  ab: "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200",
  res: "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500",
};

/** Type #18 (Formula Diagram): the active mode's rule with every symbol replaced by the live input it reads. */
export default function ProbabilityFormulaDiagram() {
  const t = useTranslations("tools.probability-calculator.education.lab.formula");
  const { mode, b, r, single, symbol, f, pct } = useProbabilityModel();

  const [terms, ops]: [Term[], string[]] = single
    ? [[{ sym: "k", value: f(single.k), tone: "a" }, { sym: "n", value: f(single.n), tone: "b" }], ["÷"]]
    : mode === "and"
      ? [[{ sym: "P(A)", value: pct(b.pA), tone: "a" }, { sym: "P(B)", value: pct(b.pB), tone: "b" }], ["×"]]
      : mode === "or"
        ? [
            [
              { sym: "P(A)", value: pct(b.pA), tone: "a" },
              { sym: "P(B)", value: pct(b.pB), tone: "b" },
              { sym: "P(A∩B)", value: pct(b.pAB), tone: "ab" },
            ],
            ["+", "−"],
          ]
        : [[{ sym: "P(A∩B)", value: pct(b.pAB), tone: "ab" }, { sym: "P(B)", value: pct(b.pB), tone: "b" }], ["÷"]];

  const chip = (term: Term, key: string) => (
    <div key={key} className={`flex min-w-[72px] flex-col items-center rounded-xl border-2 px-2.5 py-2 ${TONE[term.tone]}`}>
      <span className="text-[11px] font-semibold opacity-80">{term.sym}</span>
      <span className="font-mono text-base font-bold">{term.value}</span>
    </div>
  );

  const diagram = (
    <div className="w-full lg:w-[320px]">
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2">
        {terms.map((term, i) => (
          <div key={i} className="flex items-center gap-2">
            {chip(term, `t${i}`)}
            {i < ops.length && <span className="font-mono text-xl font-bold text-zinc-500 dark:text-zinc-400">{ops[i]}</span>}
          </div>
        ))}
        <span className="font-mono text-xl font-bold text-zinc-500 dark:text-zinc-400">=</span>
        {chip({ sym: symbol, value: pct(r), tone: "res" }, "res")}
      </div>
      <p dir="ltr" className="mt-4 rounded-lg bg-zinc-100 px-3 py-2 text-center font-mono text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
        {t(`rule.${mode}`)}
      </p>
    </div>
  );

  const steps = single
    ? [
        { label: t("substitute"), value: `${f(single.k)} / ${f(single.n)}` },
        { label: t("divide"), value: f(r, 6) },
      ]
    : mode === "and"
      ? [
          { label: t("substitute"), value: `${f(b.pA, 4)} × ${f(b.pB, 4)}` },
          { label: t("multiply"), value: f(r, 6) },
        ]
      : mode === "or"
        ? [
            { label: t("substitute"), value: `${f(b.pA, 4)} + ${f(b.pB, 4)} − ${f(b.pAB, 4)}` },
            { label: t("add"), value: `${f(b.pA + b.pB, 4)} − ${f(b.pAB, 4)}` },
            { label: t("subtract"), value: f(r, 6) },
          ]
        : [
            { label: t("substitute"), value: `${f(b.pAB, 4)} / ${f(b.pB, 4)}` },
            { label: t("divide"), value: f(r, 6) },
          ];

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={diagram}
      rows={[
        { label: t("ruleLabel"), value: t(`rule.${mode}`) },
        ...steps,
        { label: t("toPercent"), value: `${f(r, 6)} × 100 = ${pct(r, 4)}` },
        { label: symbol, value: pct(r), emphasize: true },
      ]}
    />
  );
}
