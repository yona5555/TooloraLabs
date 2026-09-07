"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { parseFormula } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import BalancerAtomBalanceDiagram from "./BalancerAtomBalanceDiagram";
import BalancerShareExportModal from "./BalancerShareExportModal";
import type { BalancerResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  digitStyle: DigitStyle;
};

function buildAtomRows(result: Result): { element: string; reactantCount: number; productCount: number }[] {
  const totals: Record<string, { reactant: number; product: number }> = {};
  for (const term of result.terms) {
    let counts: Record<string, number>;
    try {
      counts = parseFormula(term.formula);
    } catch {
      continue;
    }
    for (const [element, count] of Object.entries(counts)) {
      totals[element] ??= { reactant: 0, product: 0 };
      const amount = count * term.coefficient;
      if (term.side === "reactant") totals[element].reactant += amount;
      else totals[element].product += amount;
    }
  }
  return Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([element, { reactant, product }]) => ({ element, reactantCount: reactant, productCount: product }));
}

export default function BalancerResult({ hasCalculated, result, digitStyle }: Props) {
  const t = useTranslations("tools.chemical-equation-balancer.result");
  const fmtInt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

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
    const messageKey =
      result.error === "empty-equation"
        ? "emptyEquation"
        : result.error === "invalid-equation"
          ? "invalidEquation"
          : result.error === "unknown-element"
            ? "unknownElement"
            : "cannotBalance";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  const reactants = result.terms.filter((term) => term.side === "reactant");
  const products = result.terms.filter((term) => term.side === "product");
  const atomRows = buildAtomRows(result);

  const inputRows = reactants.map((term) => ({ label: term.formula, value: `${fmtInt(term.coefficient)}×` }));
  const resultRows = products.map((term) => ({ label: term.formula, value: `${fmtInt(term.coefficient)}×` }));

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        title={t("heading")}
        action={
          <BalancerShareExportModal
            operationLabel={result.balancedEquation}
            inputRows={inputRows}
            resultRows={resultRows}
            heroLabel={t("heading")}
            heroValue={result.balancedEquation}
            sentence={t("balancedCaption")}
          />
        }
      >
        <p dir="ltr" className="overflow-x-auto text-center font-mono text-xl font-bold text-blue-700 sm:text-2xl dark:text-blue-400">
          {result.balancedEquation}
        </p>
        <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">{t("balancedCaption")}</p>

        <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 border-t border-zinc-200 pt-4 sm:grid-cols-2 dark:border-zinc-800">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("reactants")}</p>
            <ul className="space-y-1 text-sm">
              {reactants.map((term) => (
                <li key={term.formula} className="font-mono">
                  {fmtInt(term.coefficient)} × {term.formula}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("products")}</p>
            <ul className="space-y-1 text-sm">
              {products.map((term) => (
                <li key={term.formula} className="font-mono">
                  {fmtInt(term.coefficient)} × {term.formula}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <BalancerAtomBalanceDiagram rows={atomRows} caption={t("atomBalanceCaption")} />
        </div>
      </SectionCard>
    </div>
  );
}
