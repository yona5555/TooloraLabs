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
  const tErrors = useTranslations("tools.tip-calculator.errors");
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("");
  const [people, setPeople] = useState("1");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleCalculate() {
    setError("");
    setResult(null);

    const billAmount = parseLocalizedNumber(bill);
    const tip = parseLocalizedNumber(tipPercent);
    const peopleCount = parseLocalizedNumber(people);
    if (Number.isNaN(billAmount) || Number.isNaN(tip) || Number.isNaN(peopleCount)) {
      setError(tErrors("required"));
      return;
    }
    if (billAmount <= 0 || billAmount > 1_000_000) {
      setError(tErrors("billRange"));
      return;
    }
    if (tip < 0 || tip > 100) {
      setError(tErrors("tipRange"));
      return;
    }
    if (peopleCount < 1 || peopleCount > 1000) {
      setError(tErrors("peopleRange"));
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
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
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
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}
      <ToolButton onClick={handleCalculate}>{t("calculate")}</ToolButton>
      {result && <TipResult result={result} digitStyle={digitStyle} />}
    </div>
  );
}
