"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, characteristicLength, computeAreaFor, round } from "./areaEducationMath";

/** Type #14 (Balance Indicator): the live shape's own real area against a square built from its own characteristic length — a genuine head-to-head of "same size, different shape". */
export default function SameSizeDifferentShapeBalance() {
  const t = useTranslations("tools.area-calculator.education.sameSizeBalance");
  const tShape = useTranslations("tools.area-calculator.form");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const liveArea = computeAreaFor(n);
  const length = characteristicLength(n);
  const squareArea = length * length;
  const total = liveArea + squareArea || 1;
  const livePct = (liveArea / total) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { length: round(length), shape: tShape(`shape.${dims.shape}`) })}</p>
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300" style={{ width: `${livePct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-sm font-semibold">
            <span className="text-blue-700 dark:text-blue-400">{`${tShape(`shape.${dims.shape}`)}: ${round(liveArea)}`}</span>
            <span className="text-zinc-500 dark:text-zinc-400">{`${tShape("shape.square")} (${round(length)}×${round(length)}): ${round(squareArea)}`}</span>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.difference"), value: `${round(Math.abs(liveArea - squareArea))}` },
            { label: t("worked.winner"), value: liveArea >= squareArea ? tShape(`shape.${dims.shape}`) : tShape("shape.square"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
