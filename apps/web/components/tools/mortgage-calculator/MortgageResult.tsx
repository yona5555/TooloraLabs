import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import MortgagePaymentDonut from "./MortgagePaymentDonut";
import MortgageShareExportModal from "./MortgageShareExportModal";
import type { MortgageExtendedResult } from "./types";

type MortgageResultProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

function StatTile({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400" title={title}>
        {label}
      </dt>
      <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

function monthsToYearsMonths(totalMonths: number): { years: number; months: number } {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

export default function MortgageResult({ result, digitStyle }: MortgageResultProps) {
  const t = useTranslations("tools.mortgage-calculator");

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmt = (n: number, opts: Intl.NumberFormatOptions = { maximumFractionDigits: 0 }) =>
    formatLocalizedNumber(n, digitStyle, opts);

  const segments = [
    { key: "pi", value: result.monthlyPrincipalAndInterest, label: t("aboveFold.segmentPI"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
    { key: "tax", value: result.monthlyTaxes, label: t("aboveFold.segmentTax"), colorClass: "stroke-amber-500 dark:stroke-amber-400" },
    { key: "insurance", value: result.monthlyInsurance, label: t("aboveFold.segmentInsurance"), colorClass: "stroke-violet-500 dark:stroke-violet-400" },
    { key: "hoa", value: result.monthlyHOAFee, label: t("aboveFold.segmentHOA"), colorClass: "stroke-teal-500 dark:stroke-teal-400" },
    { key: "pmi", value: result.monthlyPMIFee, label: t("aboveFold.segmentPMI"), colorClass: "stroke-rose-500 dark:stroke-rose-400" },
  ];

  const payoff = monthsToYearsMonths(result.actualPayoffMonths);

  const heroLabel = t("aboveFold.perMonth");
  const heroValue = currency(result.monthlyPayment);
  const sentence = t("aboveFold.sentence", {
    price: currency(result.homePrice),
    down: currency(result.downPayment),
    rate: fmt(result.annualInterestRate, { maximumFractionDigits: 2 }),
    years: fmt(result.loanTermYears),
    payment: currency(result.monthlyPayment),
  });

  const inputRows = [
    { label: t("form.homePrice"), value: currency(result.homePrice) },
    { label: t("form.downPayment"), value: currency(result.downPayment) },
    { label: t("form.interestRate"), value: `${fmt(result.annualInterestRate, { maximumFractionDigits: 2 })}%` },
    { label: t("form.loanTerm"), value: t("form.loanTermPreset", { years: fmt(result.loanTermYears) }) },
    { label: t("form.extraMonthlyPayment"), value: currency(result.extraMonthlyPayment) },
  ];
  const resultRows = [
    { label: t("aboveFold.loanAmountLabel"), value: currency(result.loanAmount) },
    { label: t("aboveFold.totalInterestLabel"), value: currency(result.totalInterest) },
    { label: t("aboveFold.totalCostLabel"), value: currency(result.loanAmount + result.totalInterest) },
    { label: t("aboveFold.payoffTimeLabel"), value: t("aboveFold.payoffTimeValue", { years: fmt(payoff.years), months: fmt(payoff.months) }) },
  ];
  const scheduleTable = {
    title: t("shareExport.scheduleTableTitle"),
    columns: [t("payoffChart.tooltipYearLabel"), t("payoffChart.principalLabel"), t("payoffChart.interestLabel"), t("payoffChart.balanceLabel")],
    rows: result.amortizationSchedule.map((row) => [String(row.year), currency(row.principalPaid), currency(row.interestPaid), currency(row.endingBalance)]),
  };

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={<MortgageShareExportModal mode="standard" inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} table={scheduleTable} />}
    >
      <div className="flex flex-wrap items-center justify-center gap-6">
        <MortgagePaymentDonut
          segments={segments}
          centerValue={currency(result.monthlyPayment)}
          centerLabel={t("aboveFold.perMonth")}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <StatTile label={t("aboveFold.loanAmountLabel")} value={currency(result.loanAmount)} />
        <StatTile
          label={t("aboveFold.loanToValueLabel")}
          value={`${fmt(result.loanToValuePercent, { maximumFractionDigits: 1 })}%`}
          title={t("aboveFold.loanToValueNote")}
        />
        <StatTile label={t("aboveFold.totalInterestLabel")} value={currency(result.totalInterest)} />
        <StatTile label={t("aboveFold.totalCostLabel")} value={currency(result.loanAmount + result.totalInterest)} />
        <StatTile
          label={t("aboveFold.payoffTimeLabel")}
          value={t("aboveFold.payoffTimeValue", { years: fmt(payoff.years), months: fmt(payoff.months) })}
          title={result.monthsSavedByExtraPayment > 0 ? t("aboveFold.payoffTimeAcceleratedNote") : undefined}
        />
        <StatTile
          label={t("aboveFold.pmiRemovalLabel")}
          value={
            result.pmiDropoffMonth
              ? t("aboveFold.pmiRemovalValue", {
                  years: fmt(monthsToYearsMonths(result.pmiDropoffMonth).years),
                  months: fmt(monthsToYearsMonths(result.pmiDropoffMonth).months),
                })
              : t("aboveFold.pmiRemovalNone")
          }
          title={t("aboveFold.pmiRemovalNote")}
        />
        {result.extraMonthlyPayment > 0 && (
          <>
            <StatTile
              label={t("aboveFold.interestSavedLabel")}
              value={currency(result.interestSavedByExtraPayment)}
              title={t("aboveFold.interestSavedNote")}
            />
            <StatTile
              label={t("aboveFold.monthsSavedLabel")}
              value={t("aboveFold.payoffTimeValue", {
                years: fmt(monthsToYearsMonths(result.monthsSavedByExtraPayment).years),
                months: fmt(monthsToYearsMonths(result.monthsSavedByExtraPayment).months),
              })}
            />
          </>
        )}
      </dl>
    </SectionCard>
  );
}
