import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { MortgageExtendedResult } from "./types";

type MortgageQuickInsightProps = {
  result: MortgageExtendedResult;
  digitStyle: DigitStyle;
};

export default function MortgageQuickInsight({ result, digitStyle }: MortgageQuickInsightProps) {
  const t = useTranslations("tools.mortgage-calculator.aboveFold");

  const currency = (value: number) =>
    formatLocalizedNumber(value, digitStyle, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const hasPMI = result.monthlyPMIFee > 0;
  const amountToTwentyPercent = Math.max(result.homePrice * 0.2 - result.downPayment, 0);

  function insightText() {
    if (!hasPMI) return t("quickInsightNoPmi");
    if (amountToTwentyPercent > 0) {
      return t("quickInsightWithPmi", { pmi: currency(result.monthlyPMIFee), extra: currency(amountToTwentyPercent) });
    }
    return t("quickInsightWithPmiAtTwentyPercent", { pmi: currency(result.monthlyPMIFee) });
  }

  return (
    <SectionCard title={t("quickInsightTitle")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{insightText()}</p>
    </SectionCard>
  );
}
