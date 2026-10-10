"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import GraphLive3D from "./GraphLive3D";
import GraphShareExportModal from "./GraphShareExportModal";
import { useGraphLive } from "./GraphLiveContext";
import { fmtNum } from "./types";

const EXPORT_ROWS = 9;

/** Result card: the function itself, then the deep live table (left) beside the live 2D/3D drawing (right). */
export default function GraphResult() {
  const t = useTranslations("tools.graphing-calculator.result");
  const tl = useTranslations("tools.graphing-calculator.live3d");
  const { expression, xMin, xMax, f, analysis } = useGraphLive();

  const tableRows = Array.from({ length: EXPORT_ROWS }, (_, i) => {
    const x = xMin + (i / (EXPORT_ROWS - 1)) * (xMax - xMin);
    return { x: Number(x.toPrecision(10)), y: f(x) };
  });

  return (
    <SectionCard
      title={t("heading")}
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
      action={
        <GraphShareExportModal
          expression={expression}
          xMin={xMin}
          xMax={xMax}
          yMin={analysis.yMin ?? 0}
          yMax={analysis.yMax ?? 0}
          tableRows={tableRows}
        />
      }
    >
      <p dir="ltr" className="text-center font-mono text-2xl font-bold text-blue-700 [overflow-wrap:anywhere] dark:text-blue-400">
        f(x) = {expression}
      </p>
      <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {tl("caption", { roots: analysis.roots.length, xMin: fmtNum(xMin), xMax: fmtNum(xMax) })}
      </p>
      <div className="mt-4 flex-1">
        <GraphLive3D />
      </div>
    </SectionCard>
  );
}
