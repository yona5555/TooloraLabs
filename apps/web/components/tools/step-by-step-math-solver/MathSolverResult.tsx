import { useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { MathSolverResult as Result } from "./types";

type Props = {
  result: Result;
};

export default function MathSolverResult({ result }: Props) {
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

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={copyText} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
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
