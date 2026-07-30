"use client";

import { useState } from "react";
import { MortgageCalculator as MortgageCalculatorTool } from "@tooloralabs/tools";

import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";

import MortgageResult from "./MortgageResult";
import type { MortgageResult as MortgageResultType } from "./types";

const tool = new MortgageCalculatorTool();

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanYears, setLoanYears] = useState("");
  const [propertyTax, setPropertyTax] = useState("0");
  const [insurance, setInsurance] = useState("0");
  const [hoa, setHoa] = useState("0");
  const [pmi, setPmi] = useState("0");

  const [result, setResult] = useState<MortgageResultType | null>(null);

  const handleCalculate = () => {
    const output = tool.execute(
      {
        homePrice: Number(homePrice),
        downPayment: Number(downPayment),
        annualInterestRate: Number(interestRate),
        loanTermYears: Number(loanYears),
        annualPropertyTax: Number(propertyTax),
        annualHomeInsurance: Number(insurance),
        monthlyHOA: Number(hoa),
        monthlyPMI: Number(pmi),
      },
      { locale: "en-US" }
    );
    setResult(output.data);
  };

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <ToolInput
        label="Home Price"
        type="number"
        value={homePrice}
        onChange={(e) => setHomePrice(e.target.value)}
      />
      <ToolInput
        label="Down Payment"
        type="number"
        value={downPayment}
        onChange={(e) => setDownPayment(e.target.value)}
      />
      <ToolInput
        label="Interest Rate (%)"
        type="number"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
      />
      <ToolInput
        label="Loan Term (Years)"
        type="number"
        value={loanYears}
        onChange={(e) => setLoanYears(e.target.value)}
      />
      <ToolInput
        label="Annual Property Tax"
        type="number"
        value={propertyTax}
        onChange={(e) => setPropertyTax(e.target.value)}
      />
      <ToolInput
        label="Annual Home Insurance"
        type="number"
        value={insurance}
        onChange={(e) => setInsurance(e.target.value)}
      />
      <ToolInput
        label="Monthly HOA"
        type="number"
        value={hoa}
        onChange={(e) => setHoa(e.target.value)}
      />
      <ToolInput
        label="Monthly PMI"
        type="number"
        value={pmi}
        onChange={(e) => setPmi(e.target.value)}
      />

      <ToolButton onClick={handleCalculate}>Calculate Mortgage</ToolButton>

      {result && <MortgageResult result={result} />}
    </div>
  );
}
