"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, characteristicLength, surfaceAreaAtLength, ALL_SHAPES, round } from "./surfaceAreaEducationMath";

/** Type #1 (Labeled Bar Chart): every solid's surface area at the SAME live characteristic length, ranked visually — a sphere always packs the least surface area for a given size, a cube or prism far more. */
export default function ShapeSurfaceAreaComparisonBarChart() {
  const t = useTranslations("tools.surface-area-calculator.education.shapeAreaBars");
  const tShape = useTranslations("tools.surface-area-calculator.form");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const length = characteristicLength(n);

  const data = ALL_SHAPES.map((shape) => ({ shape, area: surfaceAreaAtLength(shape, length) })).sort((a, b) => b.area - a.area);
  const sphereArea = data.find((d) => d.shape === "sphere")?.area ?? 1;
  const topArea = data[0].area;

  const bars = data.map((d) => ({
    label: tShape(`shape.${d.shape}`),
    value: d.area,
    formatted: `${round(d.area)}`,
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
            { label: t("worked.vsSphere"), value: `${round(topArea / sphereArea)}×`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
