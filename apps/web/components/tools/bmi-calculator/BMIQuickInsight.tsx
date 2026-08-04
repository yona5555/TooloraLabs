import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getToolIcon } from "@/lib/tool-icons";
import { getCategoryIconColor } from "@/lib/category-colors";
import SectionCard from "@/components/tool-ui/SectionCard";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";
import type { BMIExtendedResult } from "./types";

const AgeIcon = getToolIcon("age-calculator");

export default function BMIQuickInsight({ result }: { result: BMIExtendedResult }) {
  const t = useTranslations("tools.bmi-calculator.aboveFold");
  const tTools = useTranslations("tools");
  const level = mapBMIToResultLevel(result.category);

  return (
    <SectionCard title={t("quickInsightTitle")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {t(`quickInsightByLevel.${level}`)}
      </p>

      <Link
        href="/tools/age-calculator"
        className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getCategoryIconColor("calculators")}`}>
          <AgeIcon size={16} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{t("relatedToolCta")}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{tTools("age-calculator.title")}</p>
        </div>
      </Link>
    </SectionCard>
  );
}
