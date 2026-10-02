"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, round, type AreaNumericDims } from "./areaEducationMath";
import type { AreaShape } from "@tooloralabs/tools";

type Station = { key: string; value: string };

function stationsFor(shape: AreaShape, n: AreaNumericDims, area: number): Station[] {
  switch (shape) {
    case "square":
      return [
        { key: "given", value: `s = ${round(n.side ?? 0)}` },
        { key: "square", value: `s² = ${round(area)}` },
      ];
    case "rectangle":
      return [
        { key: "given", value: `w=${round(n.width ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "multiply", value: `w×h = ${round(area)}` },
      ];
    case "triangle": {
      const full = (n.base ?? 0) * (n.height ?? 0);
      return [
        { key: "given", value: `b=${round(n.base ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "multiply", value: `b×h = ${round(full)}` },
        { key: "half", value: `×½ = ${round(area)}` },
      ];
    }
    case "parallelogram":
      return [
        { key: "given", value: `b=${round(n.base ?? 0)}, h=${round(n.height ?? 0)}` },
        { key: "multiply", value: `b×h = ${round(area)}` },
      ];
    case "circle": {
      const squared = (n.radius ?? 0) ** 2;
      return [
        { key: "given", value: `r = ${round(n.radius ?? 0)}` },
        { key: "square", value: `r² = ${round(squared)}` },
        { key: "pi", value: `×π = ${round(area)}` },
      ];
    }
    case "ellipse": {
      const product = (n.semiMajorAxis ?? 0) * (n.semiMinorAxis ?? 0);
      return [
        { key: "given", value: `a=${round(n.semiMajorAxis ?? 0)}, b=${round(n.semiMinorAxis ?? 0)}` },
        { key: "multiply", value: `a×b = ${round(product)}` },
        { key: "pi", value: `×π = ${round(area)}` },
      ];
    }
    case "trapezoid": {
      const sum = (n.base1 ?? 0) + (n.base2 ?? 0);
      const product = sum * (n.height ?? 0);
      return [
        { key: "given", value: `b₁=${round(n.base1 ?? 0)}, b₂=${round(n.base2 ?? 0)}` },
        { key: "sum", value: `b₁+b₂ = ${round(sum)}` },
        { key: "multiply", value: `×h = ${round(product)}` },
        { key: "half", value: `×½ = ${round(area)}` },
      ];
    }
    case "sector": {
      const fullCircle = Math.PI * (n.radius ?? 0) ** 2;
      return [
        { key: "given", value: `r=${round(n.radius ?? 0)}, θ=${round(n.angleDegrees ?? 0, 1)}°` },
        { key: "fullCircle", value: `πr² = ${round(fullCircle)}` },
        { key: "fraction", value: `×(θ/360) = ${round(area)}` },
      ];
    }
  }
}

/** Type #9 (Timeline with Stations): the real sequence of operations the engine performs for the live active shape, each station carrying its own actual intermediate value. */
export default function ComputationStepsTimeline() {
  const t = useTranslations("tools.area-calculator.education.computationSteps");
  const { dims } = useAreaLive();
  const n = parseAreaDims(dims);
  const area = computeAreaFor(n);
  const stations = stationsFor(dims.shape, n, area);

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
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.area"), value: `${round(area)}`, emphasize: true }]} />
      </div>
    </SectionCard>
  );
}
