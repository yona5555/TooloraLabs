"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const VALUE = -7;

/** Type #14 (Balance Indicator): a negative input and its absolute value, on true opposite sides of zero — the calculator's |x| key maps any point on the negative side back onto its exact mirror on the positive side. */
export default function SignPolarityBalance() {
  const t = useTranslations("tools.scientific-calculator.education.functions.signPolarity");
  const abs = Math.abs(VALUE);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-gradient-to-r from-red-200 via-zinc-200 to-green-200 dark:from-red-500/30 dark:via-zinc-700 dark:to-green-500/30">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-red-600 dark:border-zinc-900" style={{ left: "17.5%" }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-green-600 dark:border-zinc-900" style={{ left: "82.5%" }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-red-700 dark:text-red-400">{VALUE}</span>
          <span className="text-zinc-400">0</span>
          <span className="text-green-700 dark:text-green-400">{abs}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.input"), value: `${VALUE}` },
            { label: t("worked.output"), value: `|${VALUE}| = ${abs}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
