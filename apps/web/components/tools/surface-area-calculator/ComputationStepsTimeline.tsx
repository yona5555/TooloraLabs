"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, slantHeightOf, round, type SurfaceNumericDims } from "./surfaceAreaEducationMath";
import type { Solid3DShape } from "@tooloralabs/tools";

type Station = { key: string; value: string };

function stationsFor(shape: Solid3DShape, n: SurfaceNumericDims, total: number): Station[] {
  switch (shape) {
    case "cube": {
      const squared = (n.side ?? 0) ** 2;
      return [
        { key: "given", value: `s = ${round(n.side ?? 0)}` },
        { key: "square", value: `s² = ${round(squared)}` },
        { key: "sixFaces", value: `×6 = ${round(total)}` },
      ];
    }
    case "rectangular-prism": {
      const lw = (n.length ?? 0) * (n.width ?? 0);
      const lh = (n.length ?? 0) * (n.height ?? 0);
      const wh = (n.width ?? 0) * (n.height ?? 0);
      return [
        { key: "given", value: `l=${round(n.length ?? 0)}, w=${round(n.width ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "pairProducts", value: `lw+lh+wh = ${round(lw + lh + wh)}` },
        { key: "double", value: `×2 = ${round(total)}` },
      ];
    }
    case "sphere": {
      const squared = (n.radius ?? 0) ** 2;
      return [
        { key: "given", value: `r = ${round(n.radius ?? 0)}` },
        { key: "square", value: `r² = ${round(squared)}` },
        { key: "fourPi", value: `×4π = ${round(total)}` },
      ];
    }
    case "cylinder": {
      const sum = (n.radius ?? 0) + (n.height ?? 0);
      return [
        { key: "given", value: `r=${round(n.radius ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "sum", value: `r+h = ${round(sum)}` },
        { key: "twoPiR", value: `×2πr = ${round(total)}` },
      ];
    }
    case "cone": {
      const slant = slantHeightOf(n) ?? 0;
      const sum = (n.radius ?? 0) + slant;
      return [
        { key: "given", value: `r=${round(n.radius ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "slant", value: `slant = ${round(slant)}` },
        { key: "sum", value: `r+slant = ${round(sum)}` },
        { key: "piR", value: `×πr = ${round(total)}` },
      ];
    }
    case "square-pyramid": {
      const slant = slantHeightOf(n) ?? 0;
      const baseArea = (n.baseSide ?? 0) ** 2;
      return [
        { key: "given", value: `b=${round(n.baseSide ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "slant", value: `slant = ${round(slant)}` },
        { key: "baseArea", value: `b² = ${round(baseArea)}` },
        { key: "addTriangles", value: `+2b×slant = ${round(total)}` },
      ];
    }
  }
}

/** Type #9 (Timeline with Stations): the real sequence of operations the engine performs for the live active solid, each station carrying its own actual intermediate value. */
export default function ComputationStepsTimeline() {
  const t = useTranslations("tools.surface-area-calculator.education.computationSteps");
  const { dims } = useSurfaceAreaLive();
  const n = parseSurfaceDims(dims);
  const total = computeSurfaceAreaFor(n);
  const stations = stationsFor(dims.shape, n, total);

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
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.total"), value: `${round(total)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
