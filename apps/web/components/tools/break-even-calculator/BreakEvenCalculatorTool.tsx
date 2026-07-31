"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { BreakEvenCalculator, type BreakEvenOutput } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import PrintButton from "@/components/tool-ui/PrintButton";
import { usePrintExport } from "@/hooks/usePrintExport";

const tool = new BreakEvenCalculator();

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

export default function BreakEvenCalculatorTool() {
  const t = useTranslations("tools.break-even-calculator");
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<BreakEvenOutput | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const { printRef, handlePrint } = usePrintExport<HTMLDivElement>();

  function formatCurrency(value: number) {
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }

  function calculate() {
    setError("");
    setResult(null);

    const parsedFixedCosts = parseLocalizedNumber(fixedCosts);
    const parsedVariableCost = parseLocalizedNumber(variableCostPerUnit);
    const parsedPrice = parseLocalizedNumber(pricePerUnit);

    if (
      Number.isNaN(parsedFixedCosts) ||
      Number.isNaN(parsedVariableCost) ||
      Number.isNaN(parsedPrice)
    ) {
      setError(t("errors.required"));
      return;
    }

    const output = tool.execute(
      {
        fixedCosts: parsedFixedCosts,
        variableCostPerUnit: parsedVariableCost,
        pricePerUnit: parsedPrice,
      },
      { locale: "en-US" }
    );
    if (!output.success) {
      const errorKey =
        output.metadata.error === "NO_BREAK_EVEN" ? "noBreakEven" : "invalidValues";
      setError(t(`errors.${errorKey}`));
      return;
    }

    setResult(output.data);
    setDigitStyle(resolveDigitStyle(fixedCosts, variableCostPerUnit, pricePerUnit));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        <ToolInput
          label={t("form.fixedCosts")}
          type="text"
          inputMode="decimal"
          value={fixedCosts}
          onChange={(e) => setFixedCosts(e.target.value)}
        />
        <ToolInput
          label={t("form.variableCostPerUnit")}
          type="text"
          inputMode="decimal"
          value={variableCostPerUnit}
          onChange={(e) => setVariableCostPerUnit(e.target.value)}
        />
        <ToolInput
          label={t("form.pricePerUnit")}
          type="text"
          inputMode="decimal"
          value={pricePerUnit}
          onChange={(e) => setPricePerUnit(e.target.value)}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <ToolButton type="button" onClick={calculate}>
          {t("form.calculate")}
        </ToolButton>
      </div>

      {result && (
        <div
          ref={printRef}
          data-print-area
          className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none"
        >
          <div className="flex items-center justify-between print:hidden">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{t("result.title")}</h3>
            <PrintButton onPrint={handlePrint} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card
              title={t("result.breakEvenUnits")}
              value={formatLocalizedNumber(result.breakEvenUnits, digitStyle)}
            />
            <Card
              title={t("result.breakEvenRevenue")}
              value={formatCurrency(result.breakEvenRevenue)}
            />
            <Card
              title={t("result.contributionMarginPerUnit")}
              value={formatCurrency(result.contributionMarginPerUnit)}
            />
            <Card
              title={t("result.contributionMarginRatio")}
              value={formatLocalizedNumber(result.contributionMarginRatio / 100, digitStyle, {
                style: "percent",
                maximumFractionDigits: 1,
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
