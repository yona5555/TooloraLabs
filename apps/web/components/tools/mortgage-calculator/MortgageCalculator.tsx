"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MortgageCalculator as MortgageCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import PrintButton from "@/components/tool-ui/PrintButton";
import { usePrintExport } from "@/hooks/usePrintExport";

import MortgageResult from "./MortgageResult";
import type { MortgageResult as MortgageResultType } from "./types";

const tool = new MortgageCalculatorTool();

const MAX_HOME_PRICE = 50_000_000;

export default function MortgageCalculator() {
  const t = useTranslations("tools.mortgage-calculator.form");
  const tErrors = useTranslations("tools.mortgage-calculator.errors");
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanYears, setLoanYears] = useState("");
  const [propertyTax, setPropertyTax] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [hoa, setHoa] = useState("0");
  const [pmi, setPmi] = useState("0");

  const [error, setError] = useState("");
  const [result, setResult] = useState<MortgageResultType | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");
  const { printRef, handlePrint } = usePrintExport<HTMLDivElement>();

  const handleCalculate = () => {
    setError("");
    setResult(null);

    const parsedHomePrice = parseLocalizedNumber(homePrice);
    const parsedDownPayment = parseLocalizedNumber(downPayment);
    const parsedInterestRate = parseLocalizedNumber(interestRate);
    const parsedLoanYears = parseLocalizedNumber(loanYears);

    if (
      Number.isNaN(parsedHomePrice) ||
      Number.isNaN(parsedDownPayment) ||
      Number.isNaN(parsedInterestRate) ||
      Number.isNaN(parsedLoanYears)
    ) {
      setError(tErrors("required"));
      return;
    }
    if (parsedHomePrice <= 0 || parsedHomePrice > MAX_HOME_PRICE) {
      setError(tErrors("homePriceRange"));
      return;
    }
    if (parsedLoanYears < 1 || parsedLoanYears > 50) {
      setError(tErrors("loanTermRange"));
      return;
    }

    const output = tool.execute(
      {
        homePrice: parsedHomePrice,
        downPayment: parsedDownPayment,
        annualInterestRate: parsedInterestRate,
        loanTermYears: parsedLoanYears,
        annualPropertyTax: parseLocalizedNumber(propertyTax),
        annualHomeInsurance: parseLocalizedNumber(insurance),
        monthlyHOA: parseLocalizedNumber(hoa),
        monthlyPMI: parseLocalizedNumber(pmi),
      },
      { locale: "en-US" }
    );
    setResult(output.data);
    setDigitStyle(
      resolveDigitStyle(
        homePrice,
        downPayment,
        interestRate,
        loanYears,
        propertyTax,
        insurance,
        hoa,
        pmi
      )
    );
  };

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <ToolInput
        label={t("homePrice")}
        type="text" inputMode="decimal"
        value={homePrice}
        onChange={(e) => setHomePrice(e.target.value)}
      />
      <ToolInput
        label={t("downPayment")}
        type="text" inputMode="decimal"
        value={downPayment}
        onChange={(e) => setDownPayment(e.target.value)}
      />
      <ToolInput
        label={t("interestRate")}
        type="text" inputMode="decimal"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
      />
      <ToolInput
        label={t("loanTerm")}
        type="text" inputMode="decimal"
        value={loanYears}
        onChange={(e) => setLoanYears(e.target.value)}
      />
      <ToolInput
        label={t("propertyTax")}
        type="text" inputMode="decimal"
        value={propertyTax}
        onChange={(e) => setPropertyTax(e.target.value)}
      />
      <ToolInput
        label={t("insurance")}
        type="text" inputMode="decimal"
        value={insurance}
        onChange={(e) => setInsurance(e.target.value)}
      />
      <ToolInput
        label={t("hoa")}
        type="text" inputMode="decimal"
        value={hoa}
        onChange={(e) => setHoa(e.target.value)}
      />
      <ToolInput
        label={t("pmi")}
        type="text" inputMode="decimal"
        value={pmi}
        onChange={(e) => setPmi(e.target.value)}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>

      {result && (
        <div ref={printRef} data-print-area className="space-y-6">
          <div className="flex justify-end print:hidden">
            <PrintButton onPrint={handlePrint} />
          </div>
          <MortgageResult result={result} digitStyle={digitStyle} />
        </div>
      )}
    </div>
  );
}
