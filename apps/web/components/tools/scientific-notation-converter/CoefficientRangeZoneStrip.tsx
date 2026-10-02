"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

/** Type #19 (Zone Strip): proper scientific notation requires the coefficient to sit in [1, 10) — this strip shows live whether A's own coefficient is actually inside that valid zone or needs normalizing. In toScientific mode A is the engine's own normalized reading of standardValue (always in range by construction); switch to toStandard/multiply/divide to type a genuinely out-of-range coefficient. */
export default function CoefficientRangeZoneStrip() {
  const t = useTranslations("tools.scientific-notation-converter.education.coefficientRange");
  const { dims } = useScientificNotationLive();
  const coefficientA = deriveEffectiveA(dims).coefficient;
  const pct = Math.min(100, Math.max(0, (coefficientA / 10) * 100));
  const inRange = coefficientA >= 1 && coefficientA < 10;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full">
            <div className="absolute inset-y-0" style={{ left: "0%", width: "10%" }}>
              <div className="h-full bg-amber-300/70 dark:bg-amber-500/50" />
            </div>
            <div className="absolute inset-y-0" style={{ left: "10%", width: "90%" }}>
              <div className="h-full bg-emerald-300/70 dark:bg-emerald-500/50" />
            </div>
            <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-blue-700 transition-all duration-300 dark:bg-blue-300" style={{ left: `calc(${pct}% - 3px)` }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>0</span>
            <span>1</span>
            <span>10</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.coefficient"), value: `${Math.round(coefficientA * 1000) / 1000}` },
            { label: t("worked.status"), value: inRange ? t("worked.inRange") : t("worked.outOfRange"), emphasize: true, note: inRange ? undefined : t("worked.needsNormalizing") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
