"use client";
import { useTranslations } from "next-intl";
import { countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { computeDigitSignificance } from "./DigitSignificanceDisplay";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

/** Type #9 (Timeline with Stations): the live A's own digits, walked left to right through the real counting procedure — spot the first non-zero digit, then count every digit from there on. */
export default function CountingStepsTimeline() {
  const t = useTranslations("tools.significant-figures-calculator.education.countingSteps");
  const { dims } = useSignificantFiguresLive();
  if (dims.rawValueA.trim() === "") return null;
  const mask = computeDigitSignificance(dims.rawValueA);
  const sigFigs = countSignificantFigures(dims.rawValueA);
  const firstSignificantIndex = mask.findIndex((m) => m.significant);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex shrink-0 flex-wrap items-center justify-center gap-1.5">
          {mask.map((entry, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-9 w-7 items-center justify-center rounded-lg font-mono text-base font-bold transition-colors duration-300 ${
                  entry.significant ? "bg-blue-600 text-white" : "border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
                }`}
              >
                {entry.char}
              </span>
              {i === firstSignificantIndex && <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">{t("startHere")}</span>}
            </div>
          ))}
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.totalCounted"), value: `${sigFigs}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
