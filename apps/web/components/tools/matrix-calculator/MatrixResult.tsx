"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import MatrixLive3D from "./MatrixLive3D";
import MatrixShareExportModal from "./MatrixShareExportModal";
import type { MatrixResult as Result } from "./types";

type Matrices = { a11: number; a12: number; a21: number; a22: number; b11: number; b12: number; b21: number; b22: number };

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  matrices: Matrices;
  className?: string;
};

export default function MatrixResult({ result, digitStyle, matrices, className = "" }: Props) {
  const t = useTranslations("tools.matrix-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });

  return (
    <SectionCard
      title={t("heading")}
      className={`lg:flex lg:h-full lg:flex-col ${className}`}
      bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col"
      action={<MatrixShareExportModal result={result} digitStyle={digitStyle} matrices={matrices} />}
    >
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">{t("determinantA")}</p>
          <p dir="ltr" className="font-mono text-2xl font-bold text-blue-700 dark:text-blue-300">{fmt(result.determinantA)}</p>
        </div>
        <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("determinantB")}</p>
          <p dir="ltr" className="font-mono text-2xl font-bold text-zinc-800 dark:text-zinc-100">{fmt(result.determinantB)}</p>
        </div>
      </div>
      {result.error === "singular-matrix-a" && <p className="mt-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("singularMatrixA")}</p>}
      <div className="mt-4 border-t border-zinc-100 pt-4 lg:flex lg:flex-1 lg:flex-col dark:border-zinc-800">
        <LiveTableFill>
          <MatrixLive3D />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
