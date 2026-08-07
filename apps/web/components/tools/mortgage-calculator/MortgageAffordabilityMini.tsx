"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { parseLocalizedNumber, formatLocalizedNumber } from "@tooloralabs/core";
import ToolInput from "@/components/tool-ui/ToolInput";
import SectionCard from "@/components/tool-ui/SectionCard";

const FRONT_END_RATIO = 0.28;
const BACK_END_RATIO = 0.36;

function reverseLoanAmount(monthlyPayment: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  if (monthlyPayment <= 0 || months <= 0) return 0;
  if (monthlyRate === 0) return monthlyPayment * months;
  return (monthlyPayment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;
}

export default function MortgageAffordabilityMini() {
  const t = useTranslations("tools.mortgage-calculator.aboveFold");
  const [isOpen, setIsOpen] = useState(false);
  const [income, setIncome] = useState("6000");
  const [debts, setDebts] = useState("300");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");

  const result = useMemo(() => {
    const incomeValue = parseLocalizedNumber(income);
    const debtsValue = parseLocalizedNumber(debts) || 0;
    const rateValue = parseLocalizedNumber(rate);
    const yearsValue = parseLocalizedNumber(years);
    const downPercentValue = parseLocalizedNumber(downPaymentPercent);

    if (
      Number.isNaN(incomeValue) ||
      Number.isNaN(rateValue) ||
      Number.isNaN(yearsValue) ||
      Number.isNaN(downPercentValue) ||
      incomeValue <= 0 ||
      downPercentValue >= 100
    ) {
      return null;
    }

    const maxFrontEnd = incomeValue * FRONT_END_RATIO;
    const maxBackEnd = incomeValue * BACK_END_RATIO - debtsValue;
    const affordablePayment = Math.max(Math.min(maxFrontEnd, maxBackEnd), 0);
    const loanAmount = reverseLoanAmount(affordablePayment, rateValue, yearsValue);
    const homePrice = loanAmount / (1 - downPercentValue / 100);

    return { affordablePayment, homePrice };
  }, [income, debts, rate, years, downPaymentPercent]);

  const currency = (value: number) =>
    formatLocalizedNumber(value, "western", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <SectionCard
      title={t("affordabilityMiniTitle")}
      onToggle={() => setIsOpen((prev) => !prev)}
      action={<ChevronDown size={16} className={`text-white transition-transform ${isOpen ? "rotate-180" : ""}`} />}
      bodyClassName={isOpen ? "space-y-3 p-4 lg:p-6" : "p-0"}
    >
      {isOpen && (
        <>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("affordabilityMiniIntro")}</p>
          <div className="grid grid-cols-2 gap-3">
            <ToolInput
              label={t("affordabilityMiniIncome")}
              type="text"
              inputMode="decimal"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="!py-2 text-base"
            />
            <ToolInput
              label={t("affordabilityMiniDebts")}
              type="text"
              inputMode="decimal"
              value={debts}
              onChange={(e) => setDebts(e.target.value)}
              className="!py-2 text-base"
            />
            <ToolInput
              label={t("affordabilityMiniRate")}
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="!py-2 text-base"
            />
            <ToolInput
              label={t("affordabilityMiniYears")}
              type="text"
              inputMode="decimal"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="!py-2 text-base"
            />
            <ToolInput
              label={t("affordabilityMiniDownPercent")}
              type="text"
              inputMode="decimal"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(e.target.value)}
              className="!py-2 text-base"
            />
          </div>

          <div className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800/60">
            {result ? (
              <p className="text-zinc-700 dark:text-zinc-200">
                {t("affordabilityMiniResult", {
                  payment: currency(result.affordablePayment),
                  homePrice: currency(result.homePrice),
                })}
              </p>
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400">{t("affordabilityMiniPlaceholder")}</p>
            )}
          </div>
        </>
      )}
    </SectionCard>
  );
}
