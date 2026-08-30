"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import MortgageShareExportModal from "./MortgageShareExportModal";
import type { HouseAffordabilityResult } from "@tooloralabs/tools";

type MortgageHomePriceResultProps = {
  hasCalculated: boolean;
  digitStyle: DigitStyle;
  annualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  annualInsurance: number;
  monthlyHoa: number;
  result: HouseAffordabilityResult;
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

export default function MortgageHomePriceResult({
  hasCalculated,
  digitStyle,
  annualIncome,
  monthlyDebts,
  downPayment,
  interestRate,
  loanTermYears,
  propertyTaxRate,
  annualInsurance,
  monthlyHoa,
  result,
}: MortgageHomePriceResultProps) {
  const t = useTranslations("tools.mortgage-calculator");

  const money = (value: number) => formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const percent = (value: number) => `${formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 })}%`;

  if (!hasCalculated) {
    return (
      <SectionCard title={t("homePriceMode.resultTitle")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("homePriceMode.emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  const heroLabel = t("homePriceMode.maxHomePriceLabel");
  const heroValue = money(result.maxHomePrice);
  const sentence = t("homePriceMode.sentence", { income: money(annualIncome), debts: money(monthlyDebts), price: money(result.maxHomePrice) });

  const inputRows = [
    { label: t("homePriceMode.form.annualIncomeLabel"), value: money(annualIncome) },
    { label: t("homePriceMode.form.monthlyDebtsLabel"), value: money(monthlyDebts) },
    { label: t("homePriceMode.form.downPaymentLabel"), value: money(downPayment) },
    { label: t("form.interestRate"), value: percent(interestRate) },
    { label: t("form.loanTerm"), value: t("form.loanTermPreset", { years: formatLocalizedNumber(loanTermYears, digitStyle) }) },
    { label: t("homePriceMode.form.propertyTaxRateLabel"), value: percent(propertyTaxRate) },
    { label: t("homePriceMode.form.annualInsuranceLabel"), value: money(annualInsurance) },
    { label: t("homePriceMode.form.monthlyHoaLabel"), value: money(monthlyHoa) },
  ];
  const resultRows = [
    { label: t("homePriceMode.loanAmountLabel"), value: money(result.loanAmount) },
    { label: t("homePriceMode.monthlyPaymentLabel"), value: money(result.monthlyPayment) },
  ];

  return (
    <SectionCard
      title={t("homePriceMode.resultTitle")}
      action={<MortgageShareExportModal mode="homePrice" inputRows={inputRows} resultRows={resultRows} heroLabel={heroLabel} heroValue={heroValue} sentence={sentence} table={null} />}
    >
      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">{sentence}</p>

      <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">{heroLabel}</p>
      <p dir="ltr" className="text-center font-mono text-4xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Stat title={t("homePriceMode.loanAmountLabel")} value={money(result.loanAmount)} />
        <Stat title={t("homePriceMode.monthlyPaymentLabel")} value={money(result.monthlyPayment)} />
      </div>
    </SectionCard>
  );
}
