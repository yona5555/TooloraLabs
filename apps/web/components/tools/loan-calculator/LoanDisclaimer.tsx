import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

export default function LoanDisclaimer() {
  const t = useTranslations("tools.loan-calculator.aboveFold");

  return (
    <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <Info size={20} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-sm leading-6 text-amber-900 dark:text-amber-200">{t("disclaimer")}</p>
    </div>
  );
}
