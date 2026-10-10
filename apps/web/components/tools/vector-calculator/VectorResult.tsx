"use client";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { LiveTableFill } from "@/components/tool-ui/three/LiveTable3DLayout";
import VectorLive3D from "./VectorLive3D";
import VectorShareExportModal from "./VectorShareExportModal";
import type { VectorResult as Result } from "./types";

type Props = {
  result: Result;
  ax: number;
  ay: number;
  az: number;
  bx: number;
  by: number;
  bz: number;
  digitStyle: DigitStyle;
  className?: string;
};

/** Result = the deep live table (left) + live 3D vectors (right); stacks in the narrow above-the-fold column. */
export default function VectorResult({ result, ax, ay, az, bx, by, bz, digitStyle, className = "" }: Props) {
  const t = useTranslations("tools.vector-calculator.result");

  return (
    <SectionCard
      title={t("heading")}
      className={`lg:flex lg:h-full lg:flex-col ${className}`}
      bodyClassName="p-4 lg:p-6 lg:flex lg:flex-1 lg:flex-col"
      action={<VectorShareExportModal result={result} ax={ax} ay={ay} az={az} bx={bx} by={by} bz={bz} digitStyle={digitStyle} />}
    >
      {result.error === "zero-vector-a" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("zeroVectorA")}</p>}
      {result.error === "zero-vector-b" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("zeroVectorB")}</p>}
      <div className="lg:flex lg:flex-1 lg:flex-col">
        <LiveTableFill>
          <VectorLive3D />
        </LiveTableFill>
      </div>
    </SectionCard>
  );
}
