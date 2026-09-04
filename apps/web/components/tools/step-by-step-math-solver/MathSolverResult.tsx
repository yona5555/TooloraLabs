"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import MathSolverShareExportModal from "./MathSolverShareExportModal";
import type { MathSolverDraft, MathSolverResult as Result } from "./types";

type Props = {
  result: Result;
  draft: MathSolverDraft;
  hasCalculated: boolean;
};

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function MathSolverResult({ result, draft, hasCalculated }: Props) {
  const t = useTranslations("tools.step-by-step-math-solver.result");

  if (!hasCalculated) {
    return (
      <SectionCard title={t("heading")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  if (result.error) {
    const key =
      result.error === "missing-input"
        ? "missingInput"
        : result.error === "no-unique-solution"
          ? "noUniqueSolution"
          : result.error === "invalid-quadratic-equation"
            ? "invalidQuadraticEquation"
            : result.error === "invalid-fraction"
              ? "invalidFraction"
              : result.error === "division-by-zero"
                ? "divisionByZero"
                : "emptyPolynomial";
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(key)}</p>
      </SectionCard>
    );
  }

  let natureBadge: { label: string; tone: "emerald" | "amber" | "rose" } | null = null;
  if (draft.mode === "quadratic-equation") {
    const a = toNum(draft.quadA);
    const b = toNum(draft.quadB);
    const c = toNum(draft.quadC);
    if (a !== undefined && b !== undefined && c !== undefined && a !== 0) {
      const discriminant = b * b - 4 * a * c;
      natureBadge =
        discriminant > 0
          ? { label: t("nature.twoRealRoots"), tone: "emerald" }
          : discriminant === 0
            ? { label: t("nature.oneRepeatedRoot"), tone: "amber" }
            : { label: t("nature.complexRoots"), tone: "rose" };
    }
  }

  const badgeClasses: Record<"emerald" | "amber" | "rose", string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    rose: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
  };

  return (
    <SectionCard title={t("heading")} action={<MathSolverShareExportModal result={result} draft={draft} />}>
      {natureBadge && (
        <div className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses[natureBadge.tone]}`}>{natureBadge.label}</div>
      )}
      <ol dir="ltr" className="space-y-2 text-start text-sm">
        {result.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="shrink-0 font-semibold text-blue-600 dark:text-blue-400">{i + 1}.</span>
            <span className="text-zinc-700 dark:text-zinc-200">{step}</span>
          </li>
        ))}
      </ol>
      <div dir="ltr" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-lg font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        {result.result}
      </div>
    </SectionCard>
  );
}
