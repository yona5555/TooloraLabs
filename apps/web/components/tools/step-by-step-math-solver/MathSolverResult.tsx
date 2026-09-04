import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { MathSolverDraft, MathSolverResult as Result } from "./types";

type Props = {
  result: Result;
  draft: MathSolverDraft;
};

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function MathSolverResult({ result, draft }: Props) {
  const t = useTranslations("tools.step-by-step-math-solver.result");

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
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(key)}</p>
        </div>
      </div>
    );
  }

  const copyText = [...result.steps, "", result.result].join("\n");

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
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={copyText} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
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
      </div>
    </div>
  );
}
