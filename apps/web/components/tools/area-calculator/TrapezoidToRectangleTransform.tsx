"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { AreaCalculator } from "@tooloralabs/tools";

const tool = new AreaCalculator();
const BASE1 = 12;
const BASE2 = 4;
const HEIGHT = 6;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Type #13 (Stepped Diagram): a trapezoid with two different bases is exactly equal in area to a rectangle whose single width is the AVERAGE of those two bases — the real reason the trapezoid formula averages b1 and b2 instead of adding them. */
export default function TrapezoidToRectangleTransform() {
  const t = useTranslations("tools.area-calculator.education.trapezoidTransform");
  const trapezoid = tool.execute({ shape: "trapezoid", base1: BASE1, base2: BASE2, height: HEIGHT }, { locale: "en-US" });
  const avgWidth = round2((BASE1 + BASE2) / 2);
  const rectangle = tool.execute({ shape: "rectangle", width: avgWidth, height: HEIGHT }, { locale: "en-US" });
  if (!trapezoid.success || trapezoid.data.error || !rectangle.success || rectangle.data.error) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-end gap-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
          <p className="text-xs text-blue-600 dark:text-blue-400">{t("trapezoidLabel")}</p>
          <p className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{`b₁=${BASE1}, b₂=${BASE2}, h=${HEIGHT}`}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">{t("rectangleLabel")}</p>
          <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">{`w=${avgWidth}, h=${HEIGHT}`}</p>
        </div>
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.avgBase"), value: `(${BASE1}+${BASE2})/2 = ${avgWidth}` },
            { label: t("worked.trapezoidArea"), value: `${round2(trapezoid.data.area)}` },
            { label: t("worked.rectangleArea"), value: `${round2(rectangle.data.area)}`, emphasize: true, note: t("worked.note") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
