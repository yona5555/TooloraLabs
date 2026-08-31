"use client";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { MonthlyGrowthPoint, YearlyGrowthPoint } from "@tooloralabs/tools";
import type { CurrencyCode } from "@/lib/currency";

type CompoundInterestYearlyBreakdownTableProps = {
  hasCalculated: boolean;
  currency: CurrencyCode;
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
  digitStyle: DigitStyle;
};

type ScheduleView = "annual" | "monthly";

const SCROLL_CONTAINER_CLASS = "max-h-[560px] overflow-y-auto overflow-x-auto";
const COLLAPSED_ROW_COUNT = 8;

export default function CompoundInterestYearlyBreakdownTable({
  hasCalculated,
  currency,
  yearlySchedule,
  monthlySchedule,
  digitStyle,
}: CompoundInterestYearlyBreakdownTableProps) {
  const t = useTranslations("tools.compound-interest-calculator");
  const [view, setView] = useState<ScheduleView>("annual");
  const [expanded, setExpanded] = useState(false);

  if (!hasCalculated || yearlySchedule.length === 0) {
    return (
      <SectionCard id="yearly-breakdown" title={t("yearlyBreakdown.title")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("yearlyBreakdown.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const money = (value: number) => {
    const useCompact = Math.abs(value) >= 1_000_000;
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency,
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };

  return (
    <SectionCard id="yearly-breakdown" title={t("yearlyBreakdown.title")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("yearlyBreakdown.intro")}</p>
        <div className="inline-flex shrink-0 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(["annual", "monthly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setView(value);
                setExpanded(false);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                view === value
                  ? "bg-blue-600 text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {value === "annual" ? t("yearlyBreakdown.annualView") : t("yearlyBreakdown.monthlyView")}
            </button>
          ))}
        </div>
      </div>

      {view === "annual" ? (
        <div dir="ltr" className={`mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${SCROLL_CONTAINER_CLASS}`}>
          <table className="w-full min-w-[560px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-4 py-2 text-start font-medium">{t("yearlyBreakdown.columnYear")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnOpeningBalance")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnContributions")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnInterestEarned")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnEndingBalance")}</th>
              </tr>
            </thead>
            <tbody>
              {(expanded ? yearlySchedule : yearlySchedule.slice(0, COLLAPSED_ROW_COUNT)).map((row) => (
                <tr key={row.year} className="border-t border-zinc-100 dark:border-zinc-800/60">
                  <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.year}</td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                    {money(row.openingBalance)}
                  </td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                    {money(row.yearlyContributions)}
                  </td>
                  <td className="px-4 py-2 text-end font-mono text-amber-600 dark:text-amber-400">
                    {money(row.yearlyInterest)}
                  </td>
                  <td className="px-4 py-2 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {money(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {view === "annual" && yearlySchedule.length > COLLAPSED_ROW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {expanded ? t("yearlyBreakdown.showLess") : t("yearlyBreakdown.viewFullTable")}
        </button>
      )}
      {view === "monthly" && (
        <div dir="ltr" className={`mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${SCROLL_CONTAINER_CLASS}`}>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-4 py-2 text-start font-medium">{t("yearlyBreakdown.columnMonth")}</th>
                <th className="px-4 py-2 text-start font-medium">{t("yearlyBreakdown.columnYear")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnOpeningBalance")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnContributions")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnInterestEarned")}</th>
                <th className="px-4 py-2 text-end font-medium">{t("yearlyBreakdown.columnEndingBalance")}</th>
              </tr>
            </thead>
            <tbody>
              {(expanded ? monthlySchedule : monthlySchedule.slice(0, COLLAPSED_ROW_COUNT)).map((row) => (
                <tr key={row.month} className="border-t border-zinc-100 dark:border-zinc-800/60">
                  <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.month}</td>
                  <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.year}</td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                    {money(row.openingBalance)}
                  </td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                    {money(row.contribution)}
                  </td>
                  <td className="px-4 py-2 text-end font-mono text-amber-600 dark:text-amber-400">
                    {money(row.interest)}
                  </td>
                  <td className="px-4 py-2 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {money(row.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {view === "monthly" && monthlySchedule.length > COLLAPSED_ROW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {expanded ? t("yearlyBreakdown.showLess") : t("yearlyBreakdown.viewFullTable")}
        </button>
      )}
    </SectionCard>
  );
}
