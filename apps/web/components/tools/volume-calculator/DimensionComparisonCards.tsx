"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, round, type VolumeNumericDims } from "./volumeEducationMath";
import type { Solid3DShape } from "@tooloralabs/tools";

type Dim = { labelKey: string; value: number } | null;

function dimsFor(shape: Solid3DShape, n: VolumeNumericDims): [Dim, Dim] {
  switch (shape) {
    case "cube":
      return [{ labelKey: "side", value: n.side ?? 0 }, null];
    case "rectangular-prism":
      return [
        { labelKey: "length", value: n.length ?? 0 },
        { labelKey: "height", value: n.height ?? 0 },
      ];
    case "sphere":
      return [{ labelKey: "radius", value: n.radius ?? 0 }, null];
    case "cylinder":
    case "cone":
      return [
        { labelKey: "radius", value: n.radius ?? 0 },
        { labelKey: "height", value: n.height ?? 0 },
      ];
    case "square-pyramid":
      return [
        { labelKey: "baseSide", value: n.baseSide ?? 0 },
        { labelKey: "height", value: n.height ?? 0 },
      ];
  }
}

/** Type #16 (Side-by-Side Comparison Cards): the live solid's own two most defining dimensions, placed card by card — which one is actually larger right now, directly from the real numbers, not assumed. */
export default function DimensionComparisonCards() {
  const t = useTranslations("tools.volume-calculator.education.dimensionCompare");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const [a, b] = dimsFor(dims.shape, n);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="grid shrink-0 grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-500/30 dark:bg-blue-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">{a ? t(`labels.${a.labelKey}`) : t("labels.none")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{a ? round(a.value) : "—"}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500 dark:text-emerald-400">{b ? t(`labels.${b.labelKey}`) : t("labels.none")}</p>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-700 dark:text-emerald-300">{b ? round(b.value) : t("singleDimension")}</p>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            b
              ? { label: t("worked.larger"), value: a!.value >= b.value ? t(`labels.${a!.labelKey}`) : t(`labels.${b.labelKey}`), emphasize: true }
              : { label: t("worked.note"), value: t("worked.onlyOneDimension"), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
