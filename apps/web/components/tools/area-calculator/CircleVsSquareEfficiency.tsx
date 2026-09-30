"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const PERIMETER = 40;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #14 (Balance Indicator): a square and a circle built from the exact same 40-unit perimeter — the circle always encloses more area than any other shape with equal perimeter, the real isoperimetric property. */
export default function CircleVsSquareEfficiency() {
  const t = useTranslations("tools.area-calculator.education.circleVsSquare");
  const side = PERIMETER / 4;
  const radius = PERIMETER / (2 * Math.PI);
  const square = tool.execute({ shape: "square", side }, { locale: "en-US" });
  const circle = tool.execute({ shape: "circle", radius }, { locale: "en-US" });
  if (!square.success || square.data.error || !circle.success || circle.data.error) return null;

  const squarePct = 50;
  const circlePct = round2((square.data.area / circle.data.area) * 50);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { perimeter: PERIMETER })}</p>
      <div dir="ltr" className="mt-5">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-600 dark:border-zinc-900" style={{ left: `${squarePct}%` }} />
          <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-600 dark:border-zinc-900" style={{ left: `${circlePct}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-sm font-semibold">
          <span className="text-blue-700 dark:text-blue-400">{`${t("squareLabel")}: ${round2(square.data.area)}`}</span>
          <span className="text-emerald-700 dark:text-emerald-400">{`${t("circleLabel")}: ${round2(circle.data.area)}`}</span>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.square"), value: `${round2(square.data.area)}` },
            { label: t("worked.circle"), value: `${round2(circle.data.area)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
