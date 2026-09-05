"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function BMRQuickReference() {
  const t = useTranslations("tools.bmr-calculator.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Harris-Benedict (men) = 66.473 + 13.7516×kg + 5.0033×cm − 6.755×age</p>
        <p>Harris-Benedict (women) = 655.0955 + 9.5634×kg + 1.8496×cm − 4.6756×age</p>
        <p>Mifflin-St Jeor (men) = 10×kg + 6.25×cm − 5×age + 5</p>
        <p>Mifflin-St Jeor (women) = 10×kg + 6.25×cm − 5×age − 161</p>
      </div>
    </SectionCard>
  );
}
