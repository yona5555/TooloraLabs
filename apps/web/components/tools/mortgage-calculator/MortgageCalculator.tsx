"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MortgageCalculator as MortgageCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";

import MortgageResult from "./MortgageResult";
import type { MortgageResult as MortgageResultType } from "./types";

const tool = new MortgageCalculatorTool();

export default function MortgageCalculator() {
  const t = useTranslations("tools.mortgage-calculator.form");
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanYears, setLoanYears] = useState("");
  const [propertyTax, setPropertyTax] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [hoa, setHoa] = useState("0");
  const [pmi, setPmi] = useState("0");

  const [result, setResult] = useState<MortgageResultType | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  const handleCalculate = () => {
    const output = tool.execute(
      {
        homePrice: parseLocalizedNumber(homePrice),
        downPayment: parseLocalizedNumber(downPayment),
        annualInterestRate: parseLocalizedNumber(interestRate),
        loanTermYears: parseLocalizedNumber(loanYears),
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
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
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

      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>

      {result && <MortgageResult result={result} digitStyle={digitStyle} />}
    </div>
  );
}
