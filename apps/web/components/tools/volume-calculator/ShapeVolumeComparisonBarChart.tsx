"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, characteristicLength, volumeAtLength, ALL_SHAPES, round } from "./volumeEducationMath";

/** Type #1 (Labeled Bar Chart): every solid's volume at the SAME live characteristic length, ranked visually — a sphere encloses far more volume than a cone or pyramid at an identical "size". */
export default function ShapeVolumeComparisonBarChart() {
  const t = useTranslations("tools.volume-calculator.education.shapeVolumeBars");
  const tShape = useTranslations("tools.volume-calculator.form");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const length = characteristicLength(n);

  const data = ALL_SHAPES.map((shape) => ({ shape, volume: volumeAtLength(shape, length) })).sort((a, b) => b.volume - a.volume);
  const coneVolume = data.find((d) => d.shape === "cone")?.volume ?? 1;
  const topVolume = data[0].volume;

  const bars = data.map((d) => ({
    label: tShape(`shape.${d.shape}`),
    value: d.volume,
    formatted: `${round(d.volume)}`,
    highlight: d.shape === dims.shape,
  }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { length: round(length) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.topShape"), value: tShape(`shape.${data[0].shape}`) },
            { label: t("worked.vsCone"), value: `${round(topVolume / coneVolume)}×`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
