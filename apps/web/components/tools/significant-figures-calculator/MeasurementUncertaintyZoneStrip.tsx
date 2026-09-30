"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const MEASUREMENT = 12.4;
const UNCERTAINTY = 0.05;

/** Type #19 (Zone Strip): a measurement of 12.4 (2 decimal places... 1 decimal place) implies the true value could plausibly be anywhere from 12.35 to 12.45 — the last written digit is never perfectly exact, it's a rounded midpoint of a real range. */
export default function MeasurementUncertaintyZoneStrip() {
  const t = useTranslations("tools.significant-figures-calculator.education.uncertainty");
  const low = MEASUREMENT - UNCERTAINTY;
  const high = MEASUREMENT + UNCERTAINTY;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: `${MEASUREMENT}` })}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-8 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="absolute h-full bg-blue-200 dark:bg-blue-500/25" style={{ left: "20%", width: "60%" }} />
          <div className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900" style={{ left: "50%" }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{low}</span>
          <span className="text-blue-700 dark:text-blue-300">{MEASUREMENT}</span>
          <span>{high}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.written"), value: `${MEASUREMENT}` },
            { label: t("worked.impliedRange"), value: `${low} – ${high}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
