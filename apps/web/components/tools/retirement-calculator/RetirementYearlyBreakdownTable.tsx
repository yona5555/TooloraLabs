"use client";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { MonthlyGrowthPoint, YearlyGrowthPoint } from "@tooloralabs/tools";

type RetirementYearlyBreakdownTableProps = {
  hasCalculated: boolean;
  yearlySchedule: YearlyGrowthPoint[];
  monthlySchedule: MonthlyGrowthPoint[];
  digitStyle: DigitStyle;
};

type ScheduleView = "annual" | "monthly";

const SCROLL_CONTAINER_CLASS = "max-h-[560px] overflow-y-auto overflow-x-auto";

export default function RetirementYearlyBreakdownTable({ hasCalculated, yearlySchedule, monthlySchedule, digitStyle }: RetirementYearlyBreakdownTableProps) {
  const t = useTranslations("tools.retirement-calculator");
  const [view, setView] = useState<ScheduleView>("annual");

  const currency = (value: number) => {
    const useCompact = Math.abs(value) >= 1_000_000;
    return formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: "USD",
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: useCompact ? 1 : 0,
    });
  };

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

  return (
    <SectionCard id="yearly-breakdown" title={t("yearlyBreakdown.title")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("yearlyBreakdown.intro")}</p>
        <div className="inline-flex shrink-0 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {(["annual", "monthly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                view === value ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
              {yearlySchedule.map((row) => (
                <tr key={row.year} className="border-t border-zinc-100 dark:border-zinc-800/60">
                  <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.year}</td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.openingBalance)}</td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.yearlyContributions)}</td>
                  <td className="px-4 py-2 text-end font-mono text-amber-600 dark:text-amber-400">{currency(row.yearlyInterest)}</td>
                  <td className="px-4 py-2 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">{currency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
              {monthlySchedule.map((row) => (
                <tr key={row.month} className="border-t border-zinc-100 dark:border-zinc-800/60">
                  <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.month}</td>
                  <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">{row.year}</td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.openingBalance)}</td>
                  <td className="px-4 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">{currency(row.contribution)}</td>
                  <td className="px-4 py-2 text-end font-mono text-amber-600 dark:text-amber-400">{currency(row.interest)}</td>
                  <td className="px-4 py-2 text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">{currency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
