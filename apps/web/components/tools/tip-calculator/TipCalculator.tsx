"use client";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TipCalculator as TipCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import TipResult from "./TipResult";
import type { TipResult as Result } from "./types";

const tool = new TipCalculatorTool();

export default function TipCalculator() {
  const t = useTranslations("tools.tip-calculator.form");
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("");
  const [people, setPeople] = useState("1");
  const [result, setResult] = useState<Result | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleCalculate() {
    const billAmount = parseLocalizedNumber(bill);
    const tip = parseLocalizedNumber(tipPercent);
    const peopleCount = parseLocalizedNumber(people);
    if (Number.isNaN(billAmount) || Number.isNaN(tip) || Number.isNaN(peopleCount)) {
      return;
    }
    const output = tool.execute(
      { billAmount, tipPercent: tip, people: peopleCount },
      { locale: "en-US" }
    );
    setResult(output.data);
    setDigitStyle(resolveDigitStyle(bill, tipPercent, people));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("billPlaceholder")}
        value={bill}
        onChange={(e) => setBill(e.target.value)}
      />
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("tipPlaceholder")}
        value={tipPercent}
        onChange={(e) => setTipPercent(e.target.value)}
      />
      <ToolInput
        type="text" inputMode="decimal"
        placeholder={t("peoplePlaceholder")}
        value={people}
        onChange={(e) => setPeople(e.target.value)}
      />
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      {result && <TipResult result={result} digitStyle={digitStyle} />}
    </div>
  );
}
