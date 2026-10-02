"use client";
import { useTranslations } from "next-intl";
import { countSignificantFigures } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

/** Type #1 (Labeled Bar Chart): the live A and B's own significant-figure counts, ranked side by side — whichever is less precise sets the real limit for any calculation combining them. */
export default function SigFigCountComparisonBarChart() {
  const t = useTranslations("tools.significant-figures-calculator.education.sigFigCompare");
  const { dims } = useSignificantFiguresLive();
  if (dims.rawValueB.trim() === "") return null;

  const sfA = countSignificantFigures(dims.rawValueA);
  const sfB = countSignificantFigures(dims.rawValueB);
  const rows = [
    { key: "a", label: `A (${dims.rawValueA})`, value: sfA },
    { key: "b", label: `B (${dims.rawValueB})`, value: sfB },
  ].sort((x, y) => y.value - x.value);
  const bars = rows.map((r, i) => ({ label: r.label, value: r.value, formatted: `${r.value}`, highlight: i === rows.length - 1 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.limitingFigure"), value: `${Math.min(sfA, sfB)}`, emphasize: true, note: t("worked.note") }]} />
      </div>
    </SectionCard>
  );
}
