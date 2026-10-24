"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "@/components/tool-ui/EduBarChart";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, characteristicLength, areaAtLength, ALL_SHAPES, round } from "./areaEducationMath";
import GapFreeRow from "@/components/tool-ui/GapFreeRow";

/** Type #1 (Labeled Bar Chart): every shape's area at the SAME live characteristic length, ranked visually — how much more area a circle or ellipse packs in than a triangle at an identical "size". */
export default function ShapeAreaComparisonBarChart() {
  const t = useTranslations("tools.area-calculator.education.shapeAreaBars");
  const tShape = useTranslations("tools.area-calculator.form");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const length = characteristicLength(n);

  const data = ALL_SHAPES.map((shape) => ({ shape, area: areaAtLength(shape, length) })).sort((a, b) => b.area - a.area);
  const squareArea = data.find((d) => d.shape === "square")?.area ?? 1;
  const topArea = data[0].area;

  const bars = data.slice(0, 5).map((d) => ({
    label: tShape(`shape.${d.shape}`),
    value: d.area,
    formatted: `${round(d.area)}`,
    highlight: d.shape === dims.shape,
  }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { length: round(length) })}</p>
      <GapFreeRow className="mt-4">
        <div dir="ltr" className="w-full lg:flex-1">
          <PhoneMini slot={0} title={t("title")}>
            <EduBarChart bars={bars} ariaLabel={t("title")} />
          </PhoneMini>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.topShape"), value: tShape(`shape.${data[0].shape}`) },
            { label: t("worked.vsSquare"), value: `${round(topArea / squareArea)}×`, emphasize: true },
          ]}
        />
      </GapFreeRow>
    </SectionCard>
  );
}
