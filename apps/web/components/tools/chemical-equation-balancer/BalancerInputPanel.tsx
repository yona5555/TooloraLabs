"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import BalancerEquationStructureDiagram from "./BalancerEquationStructureDiagram";

type BalancerInputPanelProps = {
  equation: string;
  onEquationChange: (value: string) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

function countTerms(equation: string): { reactants: number; products: number } {
  const arrowMatch = equation.match(/->|-->|=|→/);
  if (!arrowMatch) return { reactants: 0, products: 0 };
  const left = equation.slice(0, arrowMatch.index);
  const right = equation.slice((arrowMatch.index ?? 0) + arrowMatch[0].length);
  const count = (side: string) => side.split("+").map((s) => s.trim()).filter((s) => s.length > 0).length;
  return { reactants: count(left), products: count(right) };
}

export default function BalancerInputPanel({ equation, onEquationChange, onCalculate, onClear }: BalancerInputPanelProps) {
  const t = useTranslations("tools.chemical-equation-balancer.form");
  const { reactants, products } = countTerms(equation);

  return (
    <SectionCard title={t("inputTitle")}>
      <BalancerEquationStructureDiagram
        reactantCount={reactants}
        productCount={products}
        reactantsLabel={t("structureReactants", { count: reactants })}
        productsLabel={t("structureProducts", { count: products })}
        caption={t("structureCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        <ToolInput
          label={t("equationLabel")}
          hint={t("equationHint")}
          type="text"
          dir="ltr"
          placeholder={t("equationPlaceholder")}
          value={equation}
          onChange={(e) => onEquationChange(e.target.value)}
        />

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
