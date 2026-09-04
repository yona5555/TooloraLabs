"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import GraphCanvas from "./GraphCanvas";
import GraphShareExportModal from "./GraphShareExportModal";
import type { GraphResult as Result } from "./types";

type Props = {
  result: Result;
  xMin: number;
  xMax: number;
  expression: string;
  hasCalculated: boolean;
};

const TABLE_ROWS = 9;

function fmt(n: number): string {
  const rounded = Math.round(n * 1000) / 1000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

export default function GraphResult({ result, xMin, xMax, expression, hasCalculated }: Props) {
  const t = useTranslations("tools.graphing-calculator.result");

  if (!hasCalculated) {
    return (
      <SectionCard title={t("heading")}>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <Calculator size={32} className="text-zinc-300 dark:text-zinc-700" />
          <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{t("emptyStateMessage")}</p>
        </div>
      </SectionCard>
    );
  }

  if (result.error) {
    const messageKey = result.error === "invalid-expression" ? "invalidExpression" : "invalidRange";
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
      </SectionCard>
    );
  }

  if (result.yMin === null || result.yMax === null) {
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("noValidPoints")}</p>
      </SectionCard>
    );
  }

  const gapCount = result.points.filter((p) => p.y === null).length;

  const tableRows = Array.from({ length: TABLE_ROWS }, (_, i) => {
    const targetX = xMin + (i / (TABLE_ROWS - 1)) * (xMax - xMin);
    let nearest = result.points[0];
    let bestDist = Infinity;
    for (const p of result.points) {
      const dist = Math.abs(p.x - targetX);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = p;
      }
    }
    return nearest;
  });

  return (
    <SectionCard
      title={t("heading")}
      action={<GraphShareExportModal expression={expression} xMin={xMin} xMax={xMax} yMin={result.yMin} yMax={result.yMax} tableRows={tableRows} />}
    >
      <GraphCanvas points={result.points} xMin={xMin} xMax={xMax} yMin={result.yMin} yMax={result.yMax} />

      <div dir="ltr" className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {t("yRangeLabel")}: [{fmt(result.yMin)}, {fmt(result.yMax)}]
        </span>
        {gapCount > 0 && (
          <span>
            {t("gapsLabel")}: {gapCount}
          </span>
        )}
      </div>

      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("tableOfValues")}</p>
        <div dir="ltr" className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-2 py-1.5 text-start font-semibold text-zinc-500 dark:text-zinc-400">x</th>
                <th className="px-2 py-1.5 text-start font-semibold text-zinc-500 dark:text-zinc-400">y</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-2 py-1.5 font-mono">{fmt(row.x)}</td>
                  <td className="px-2 py-1.5 font-mono">{row.y === null ? t("undefined") : fmt(row.y)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
