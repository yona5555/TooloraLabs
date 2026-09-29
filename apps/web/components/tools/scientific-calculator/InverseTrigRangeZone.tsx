"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const INPUT = 0.5;

/** Type #19 (Zone Strip): sin⁻¹'s output is restricted to -90 deg to 90 deg no matter the input — this calculator's asin key can never return an angle outside that strip, shown here with a real example landing inside it. */
export default function InverseTrigRangeZone() {
  const t = useTranslations("tools.scientific-calculator.education.functions.inverseTrigRange");
  const angle = (Math.asin(INPUT) * 180) / Math.PI;
  const pct = ((angle + 90) / 180) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-8 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-500/20 dark:to-blue-500/50" />
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 shadow dark:border-zinc-900 dark:bg-white" style={{ left: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>-90°</span>
          <span>0°</span>
          <span>90°</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.input"), value: `sin⁻¹(${INPUT})` },
            { label: t("worked.result"), value: `${Math.round(angle * 100) / 100}°`, emphasize: true },
            { label: t("worked.range"), value: "[-90°, 90°]", note: t("worked.rangeNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
