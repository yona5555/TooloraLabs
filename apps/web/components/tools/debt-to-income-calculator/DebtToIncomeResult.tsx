"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import PdfDownloadButton from "@/components/tool-ui/PdfDownloadButton";
import type { DebtToIncomeResult as DebtToIncomeResultData } from "@tooloralabs/tools";

type DebtToIncomeResultProps = {
  result: DebtToIncomeResultData | null;
  monthlyGrossIncome: number;
  digitStyle: DigitStyle;
};

const CATEGORY_COLORS: Record<string, string> = {
  healthy: "text-green-600 dark:text-green-400",
  manageable: "text-amber-600 dark:text-amber-400",
  high: "text-orange-600 dark:text-orange-400",
  veryHigh: "text-red-600 dark:text-red-400",
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function DebtToIncomeResult({ result, monthlyGrossIncome, digitStyle }: DebtToIncomeResultProps) {
  const t = useTranslations("tools.debt-to-income-calculator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const percent = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 })}%`;

  const hasResult = result !== null && monthlyGrossIncome > 0;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={
        hasResult ? (
          <PdfDownloadButton
            toolName={t("title")}
            inputs={[{ label: t("form.monthlyGrossIncomeLabel"), value: money(monthlyGrossIncome) }]}
            results={[
              { label: t("aboveFold.backEndRatioLabel"), value: percent(result.backEndRatio) },
              { label: t("aboveFold.frontEndRatioLabel"), value: percent(result.frontEndRatio) },
              { label: t("aboveFold.totalMonthlyDebtLabel"), value: money(result.totalMonthlyDebt) },
              { label: t("aboveFold.categoryLabel"), value: t(`aboveFold.category.${result.category}`) },
            ]}
            filename="debt-to-income-calculator-result.pdf"
          />
        ) : undefined
      }
    >
      {hasResult ? (
        <>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("aboveFold.backEndRatioLabel")}</p>
          <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
            {percent(result.backEndRatio)}
          </p>
          <p className={`mt-1 text-center text-sm font-semibold ${CATEGORY_COLORS[result.category]}`}>
            {t(`aboveFold.category.${result.category}`)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Stat title={t("aboveFold.frontEndRatioLabel")} value={percent(result.frontEndRatio)} />
            <Stat title={t("aboveFold.totalMonthlyDebtLabel")} value={money(result.totalMonthlyDebt)} />
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
