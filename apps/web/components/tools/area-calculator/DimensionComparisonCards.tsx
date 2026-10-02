"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, round, type AreaNumericDims } from "./areaEducationMath";
import type { AreaShape } from "@tooloralabs/tools";

type Dim = { labelKey: string; value: number; unit: "length" | "angle" } | null;

function dimsFor(shape: AreaShape, n: AreaNumericDims): [Dim, Dim] {
  switch (shape) {
    case "square":
      return [{ labelKey: "side", value: n.side ?? 0, unit: "length" }, null];
    case "rectangle":
      return [
        { labelKey: "width", value: n.width ?? 0, unit: "length" },
        { labelKey: "height", value: n.height ?? 0, unit: "length" },
      ];
    case "triangle":
    case "parallelogram":
      return [
        { labelKey: "base", value: n.base ?? 0, unit: "length" },
        { labelKey: "height", value: n.height ?? 0, unit: "length" },
      ];
    case "circle":
      return [{ labelKey: "radius", value: n.radius ?? 0, unit: "length" }, null];
    case "ellipse":
      return [
        { labelKey: "semiMajorAxis", value: n.semiMajorAxis ?? 0, unit: "length" },
        { labelKey: "semiMinorAxis", value: n.semiMinorAxis ?? 0, unit: "length" },
      ];
    case "trapezoid":
      return [
        { labelKey: "base1", value: n.base1 ?? 0, unit: "length" },
        { labelKey: "base2", value: n.base2 ?? 0, unit: "length" },
      ];
    case "sector":
      return [
        { labelKey: "radius", value: n.radius ?? 0, unit: "length" },
        { labelKey: "angleDegrees", value: n.angleDegrees ?? 0, unit: "angle" },
      ];
  }
}

/** Type #16 (Side-by-Side Comparison Cards): the live shape's own two defining dimensions, placed card by card — which one is actually larger right now, directly from the real numbers, not assumed. */
export default function DimensionComparisonCards() {
  const t = useTranslations("tools.area-calculator.education.dimensionCompare");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const [a, b] = dimsFor(dims.shape, n);
  const comparable = a && b && a.unit === b.unit;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="grid shrink-0 grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{a ? t(`labels.${a.labelKey}`) : t("labels.none")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{a ? `${round(a.value)}${a.unit === "angle" ? "°" : ""}` : "—"}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">{b ? t(`labels.${b.labelKey}`) : t("labels.none")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{b ? `${round(b.value)}${b.unit === "angle" ? "°" : ""}` : t("singleDimension")}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            comparable
              ? { label: t("worked.larger"), value: (a!.value >= b!.value ? t(`labels.${a!.labelKey}`) : t(`labels.${b!.labelKey}`)), emphasize: true }
              : { label: t("worked.note"), value: b ? t("worked.differentUnits") : t("worked.onlyOneDimension"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
