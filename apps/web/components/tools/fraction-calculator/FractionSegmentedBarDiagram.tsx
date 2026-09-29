"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";

const NUM = 7;
const DEN = 8;
const CELL = 30;
const GAP = 3;

/** Type #15 (Stacked Segmented Bar): a real denominator-cell bar with the numerator's share shaded — 7 of 8 equal segments, close enough to whole to make the leftover 1/8 gap visually obvious, unlike a round number like 1/2. */
export default function FractionSegmentedBarDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.segmentedBar");
  const width = DEN * CELL + (DEN - 1) * GAP;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: `${NUM}/${DEN}` })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={width} height={CELL} viewBox={`0 0 ${width} ${CELL}`} role="img" aria-label={t("title")} className="block">
            {Array.from({ length: DEN }).map((_, i) => (
              <rect
                key={i}
                x={i * (CELL + GAP)}
                y={0}
                width={CELL}
                height={CELL}
                rx={5}
                className={i < NUM ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-100 dark:fill-zinc-800"}
              />
            ))}
          </svg>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.filled"), value: `${NUM}` },
            { label: t("worked.total"), value: `${DEN}` },
            { label: t("worked.leftover"), value: `${DEN - NUM}/${DEN}`, note: t("worked.leftoverNote") },
            { label: t("worked.decimal"), value: `${Math.round((NUM / DEN) * 1000) / 1000}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
