"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, round, type VolumeNumericDims } from "./volumeEducationMath";
import type { Solid3DShape } from "@tooloralabs/tools";

type Station = { key: string; value: string };

function stationsFor(shape: Solid3DShape, n: VolumeNumericDims, volume: number): Station[] {
  switch (shape) {
    case "cube":
      return [
        { key: "given", value: `s = ${round(n.side ?? 0)}` },
        { key: "cube", value: `s³ = ${round(volume)}` },
      ];
    case "rectangular-prism": {
      const lw = (n.length ?? 0) * (n.width ?? 0);
      return [
        { key: "given", value: `l=${round(n.length ?? 0)}, w=${round(n.width ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "multiply", value: `l×w = ${round(lw)}` },
        { key: "timesHeight", value: `×h = ${round(volume)}` },
      ];
    }
    case "sphere": {
      const cubed = (n.radius ?? 0) ** 3;
      return [
        { key: "given", value: `r = ${round(n.radius ?? 0)}` },
        { key: "cubeIt", value: `r³ = ${round(cubed)}` },
        { key: "fourThirdsPi", value: `×(4/3)π = ${round(volume)}` },
      ];
    }
    case "cylinder": {
      const squared = (n.radius ?? 0) ** 2;
      return [
        { key: "given", value: `r=${round(n.radius ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "square", value: `r² = ${round(squared)}` },
        { key: "piTimesH", value: `×πh = ${round(volume)}` },
      ];
    }
    case "cone": {
      const squared = (n.radius ?? 0) ** 2;
      return [
        { key: "given", value: `r=${round(n.radius ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "square", value: `r² = ${round(squared)}` },
        { key: "oneThirdPiH", value: `×(1/3)πh = ${round(volume)}` },
      ];
    }
    case "square-pyramid": {
      const squared = (n.baseSide ?? 0) ** 2;
      return [
        { key: "given", value: `b=${round(n.baseSide ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "square", value: `b² = ${round(squared)}` },
        { key: "oneThirdH", value: `×(1/3)h = ${round(volume)}` },
      ];
    }
  }
}

/** Type #9 (Timeline with Stations): the real sequence of operations the engine performs for the live active solid, each station carrying its own actual intermediate value. */
export default function ComputationStepsTimeline() {
  const t = useTranslations("tools.volume-calculator.education.computationSteps");
  const { dims } = useVolumeLive();
  const n = parseVolumeDims(dims);
  const volume = computeVolumeFor(n);
  const stations = stationsFor(dims.shape, n, volume);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full overflow-x-auto lg:flex-1">
          <ol className="flex min-w-[420px] items-start justify-between gap-2">
            {stations.map((s, i) => (
              <li key={s.key} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-px flex-1 ${i === 0 ? "opacity-0" : "bg-blue-300 dark:bg-blue-500/40"}`} />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</div>
                  <div className={`h-px flex-1 ${i === stations.length - 1 ? "opacity-0" : "bg-blue-300 dark:bg-blue-500/40"}`} />
                </div>
                <p className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t(`stations.${s.key}`)}</p>
                <p className="mt-1 font-mono text-xs text-blue-700 dark:text-blue-300">{s.value}</p>
              </li>
            ))}
          </ol>
        </div>
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.volume"), value: `${round(volume)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
