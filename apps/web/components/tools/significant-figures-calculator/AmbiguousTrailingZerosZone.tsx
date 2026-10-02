"use client";
import { useTranslations } from "next-intl";
import { countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

function hasAmbiguousTrailingZeros(raw: string): boolean {
  const s = raw.trim().replace(/^[+-]/, "");
  if (s.includes(".")) return false;
  return /0$/.test(s.replace(/^0+/, ""));
}

/** Type #19 (Zone Strip): whether the live A's own trailing zeros are genuinely ambiguous (no decimal point, so a calculator can't tell if they were measured) or fully resolved by the decimal point actually being present. */
export default function AmbiguousTrailingZerosZone() {
  const t = useTranslations("tools.significant-figures-calculator.education.ambiguousZeros");
  const { dims } = useSignificantFiguresLive();
  const ambiguous = hasAmbiguousTrailingZeros(dims.rawValueA);
  const sigFigs = countSignificantFigures(dims.rawValueA);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-6 w-full">
        <div className="relative h-3 w-full overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-emerald-300/70 dark:bg-emerald-500/50" />
          <div className="absolute inset-y-0 left-1/2 w-1/2 bg-amber-300/70 dark:bg-amber-500/50" />
          <div className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 rounded-full bg-blue-700 transition-all duration-300 dark:bg-blue-300" style={{ left: ambiguous ? "calc(75% - 3px)" : "calc(25% - 3px)" }} />
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          <span>{t("zones.resolved")}</span>
          <span>{t("zones.ambiguous")}</span>
        </div>
      </div>
      <div className="mt-6">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.sigFigsAsWritten"), value: `${sigFigs}` },
            { label: t("worked.status"), value: ambiguous ? t("worked.isAmbiguous") : t("worked.isResolved"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
