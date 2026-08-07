"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MortgageCalculator as MortgageCalculatorTool } from "@tooloralabs/tools";
import ToolInput from "@/components/tool-ui/ToolInput";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { MortgageExtendedResult } from "./types";

type MortgageScenarioComparisonProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

type EditableScenario = { rate: string; term: string };

type ComputedScenario = {
  rate: number;
  term: number;
  monthlyPrincipalAndInterest: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  payoffMonths: number;
};

const tool = new MortgageCalculatorTool();
const MAX_RATE = 25;
const MIN_TERM = 1;
const MAX_TERM = 50;

function monthsToYearsMonths(totalMonths: number): { years: number; months: number } {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

function computeScenario(base: MortgageExtendedResult, rateStr: string, termStr: string): ComputedScenario | null {
  const rate = parseLocalizedNumber(rateStr);
  const term = parseLocalizedNumber(termStr);
  if (Number.isNaN(rate) || rate < 0 || rate > MAX_RATE || Number.isNaN(term) || term < MIN_TERM || term > MAX_TERM) {
    return null;
  }

  const output = tool.execute(
    {
      homePrice: base.homePrice,
      downPayment: base.downPayment,
      annualInterestRate: rate,
      loanTermYears: term,
      annualPropertyTax: base.annualPropertyTax,
      annualHomeInsurance: base.annualHomeInsurance,
      monthlyHOA: base.monthlyHOA,
      monthlyPMI: base.monthlyPMI,
      extraMonthlyPayment: base.extraMonthlyPayment,
    },
    { locale: "en-US" }
  );

  return {
    rate,
    term,
    monthlyPrincipalAndInterest: output.data.monthlyPrincipalAndInterest,
    monthlyPayment: output.data.monthlyPayment,
    totalInterest: output.data.actualTotalInterest,
    totalCost: output.data.loanAmount + output.data.actualTotalInterest,
    payoffMonths: output.data.actualPayoffMonths,
  };
}

export default function MortgageScenarioComparison({ result, digitStyle }: MortgageScenarioComparisonProps) {
  const t = useTranslations("tools.mortgage-calculator.scenarioComparison");
  const tAboveFold = useTranslations("tools.mortgage-calculator.aboveFold");

  const [scenarioB, setScenarioB] = useState<EditableScenario>({
    rate: String(result.annualInterestRate),
    term: "15",
  });
  const [scenarioC, setScenarioC] = useState<EditableScenario>({
    rate: String(result.annualInterestRate),
    term: "20",
  });

  const base: ComputedScenario = useMemo(
    () => ({
      rate: result.annualInterestRate,
      term: result.loanTermYears,
      monthlyPrincipalAndInterest: result.monthlyPrincipalAndInterest,
      monthlyPayment: result.monthlyPayment,
      totalInterest: result.actualTotalInterest,
      totalCost: result.loanAmount + result.actualTotalInterest,
      payoffMonths: result.actualPayoffMonths,
    }),
    [result]
  );

  const computedB = useMemo(() => computeScenario(result, scenarioB.rate, scenarioB.term), [result, scenarioB]);
  const computedC = useMemo(() => computeScenario(result, scenarioC.rate, scenarioC.term), [result, scenarioC]);

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmt = (n: number, opts: Intl.NumberFormatOptions = { maximumFractionDigits: 1 }) =>
    formatLocalizedNumber(n, digitStyle, opts);

  function payoffText(months: number) {
    const { years, months: m } = monthsToYearsMonths(months);
    return tAboveFold("payoffTimeValue", {
      years: fmt(years, { maximumFractionDigits: 0 }),
      months: fmt(m, { maximumFractionDigits: 0 }),
    });
  }

  function deltaText(value: number, formatter: (n: number) => string) {
    if (Math.abs(value) < 0.5) return t("deltaNone");
    const sign = value > 0 ? "+" : "−";
    return `${sign}${formatter(Math.abs(value))}`;
  }

  const columns: { key: string; label: string; scenario: ComputedScenario | null; delta: boolean }[] = [
    { key: "base", label: t("baseLabel"), scenario: base, delta: false },
    { key: "b", label: t("scenarioLabel", { letter: "B" }), scenario: computedB, delta: true },
    { key: "c", label: t("scenarioLabel", { letter: "C" }), scenario: computedC, delta: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("baseLabel")}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("baseHint")}</p>
          <dl dir="ltr" className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">{t("rateLabel")}</dt>
              <dd className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{fmt(base.rate)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">{t("termLabel")}</dt>
              <dd className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                {fmt(base.term, { maximumFractionDigits: 0 })}
              </dd>
            </div>
          </dl>
        </div>

        {[
          { label: t("scenarioLabel", { letter: "B" }), value: scenarioB, onChange: setScenarioB },
          { label: t("scenarioLabel", { letter: "C" }), value: scenarioC, onChange: setScenarioC },
        ].map((slot) => (
          <div key={slot.label} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{slot.label}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ToolInput
                label={t("rateLabel")}
                type="text"
                inputMode="decimal"
                value={slot.value.rate}
                onChange={(e) => slot.onChange((prev) => ({ ...prev, rate: e.target.value }))}
                className="!py-2 text-base"
              />
              <ToolInput
                label={t("termLabel")}
                type="text"
                inputMode="decimal"
                value={slot.value.term}
                onChange={(e) => slot.onChange((prev) => ({ ...prev, term: e.target.value }))}
                className="!py-2 text-base"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 text-start font-medium text-zinc-500 dark:text-zinc-400"></th>
              {columns.map((col) => (
                <th key={col.key} className="py-2 text-end font-medium text-zinc-500 dark:text-zinc-400">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
              <td className="py-2.5 text-zinc-600 dark:text-zinc-300">{t("rowMonthlyPI")}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 text-end text-zinc-900 dark:text-zinc-100">
                  {col.scenario ? (
                    <span dir="ltr" className="font-mono">
                      {currency(col.scenario.monthlyPrincipalAndInterest)}
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{t("invalidScenario")}</span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
              <td className="py-2.5 text-zinc-600 dark:text-zinc-300">{t("rowMonthlyTotal")}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 text-end text-zinc-900 dark:text-zinc-100">
                  {col.scenario ? (
                    <div dir="ltr" className="font-mono">
                      <div>{currency(col.scenario.monthlyPayment)}</div>
                      {col.delta && (
                        <div className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                          {deltaText(col.scenario.monthlyPayment - base.monthlyPayment, currency)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{t("invalidScenario")}</span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
              <td className="py-2.5 text-zinc-600 dark:text-zinc-300">{t("rowTotalInterest")}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 text-end text-zinc-900 dark:text-zinc-100">
                  {col.scenario ? (
                    <div dir="ltr" className="font-mono">
                      <div>{currency(col.scenario.totalInterest)}</div>
                      {col.delta && (
                        <div className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                          {deltaText(col.scenario.totalInterest - base.totalInterest, currency)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{t("invalidScenario")}</span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800/60">
              <td className="py-2.5 text-zinc-600 dark:text-zinc-300">{t("rowTotalCost")}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 text-end text-zinc-900 dark:text-zinc-100">
                  {col.scenario ? (
                    <span dir="ltr" className="font-mono">
                      {currency(col.scenario.totalCost)}
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{t("invalidScenario")}</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 text-zinc-600 dark:text-zinc-300">{t("rowPayoffTime")}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 text-end text-zinc-900 dark:text-zinc-100">
                  {col.scenario ? (
                    <span dir="ltr" className="font-mono">
                      {payoffText(col.scenario.payoffMonths)}
                    </span>
                  ) : (
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{t("invalidScenario")}</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
