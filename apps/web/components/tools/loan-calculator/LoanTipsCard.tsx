"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const TIP_KEYS = ["compounding", "extraPayments", "apr"] as const;

/**
 * Short, evergreen loan-shopping tips — fills the gap that opens up below the mode tabs once the
 * (longer) input column runs past the result card, with content genuinely relevant across all
 * three loan modes rather than unrelated filler.
 */
export default function LoanTipsCard() {
  const t = useTranslations("tools.loan-calculator.aboveFold");

  return (
    <SectionCard title={t("loanTipsTitle")}>
      <ul className="flex flex-col gap-2.5">
        {TIP_KEYS.map((key) => (
          <li key={key} className="flex gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            <span>{t(`loanTips.${key}`)}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
