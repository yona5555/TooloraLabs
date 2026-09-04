"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import VectorDiagram from "./VectorDiagram";
import VectorAngleDiagram from "./VectorAngleDiagram";
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
  hasCalculated: boolean;
};

export default function VectorResult({ result, ax, ay, az, bx, by, bz, digitStyle, hasCalculated }: Props) {
  const t = useTranslations("tools.vector-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });
  const na = t("notApplicable");

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

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title={t("heading")} action={<VectorShareExportModal result={result} ax={ax} ay={ay} az={az} bx={bx} by={by} bz={bz} digitStyle={digitStyle} />}>
        {result.error === "zero-vector-a" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("zeroVectorA")}</p>}
        {result.error === "zero-vector-b" && <p className="mb-3 text-center text-sm text-amber-600 dark:text-amber-400">{t("zeroVectorB")}</p>}

        <VectorDiagram
          ax={ax}
          ay={ay}
          bx={bx}
          by={by}
          resultX={result.sumX}
          resultY={result.sumY}
          labelA={t("diagramA")}
          labelB={t("diagramB")}
          labelResult={t("diagramSum")}
          caption={t("diagramCaption")}
        />

        <dl dir="ltr" className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-4 text-sm sm:grid-cols-3 dark:border-zinc-800">
          <Stat label={t("magnitudeA")} value={fmt(result.magnitudeA)} />
          <Stat label={t("magnitudeB")} value={fmt(result.magnitudeB)} />
          <Stat label={t("dotProduct")} value={fmt(result.dotProduct)} />
          <Stat label={t("sum")} value={`(${fmt(result.sumX)}, ${fmt(result.sumY)}, ${fmt(result.sumZ)})`} />
          <Stat label={t("difference")} value={`(${fmt(result.differenceX)}, ${fmt(result.differenceY)}, ${fmt(result.differenceZ)})`} />
          <Stat label={t("crossProduct")} value={`(${fmt(result.crossX)}, ${fmt(result.crossY)}, ${fmt(result.crossZ)})`} />
          <Stat label={t("angleBetween")} value={result.angleBetweenDegrees === null ? na : `${fmt(result.angleBetweenDegrees)}°`} />
          <Stat
            label={t("unitVectorA")}
            value={result.unitAX === null ? na : `(${fmt(result.unitAX)}, ${fmt(result.unitAY!)}, ${fmt(result.unitAZ!)})`}
          />
          <Stat
            label={t("projectionAOntoB")}
            value={result.projectionX === null ? na : `(${fmt(result.projectionX)}, ${fmt(result.projectionY!)}, ${fmt(result.projectionZ!)})`}
          />
        </dl>
      </SectionCard>

      <SectionCard title={t("angleDiagramTitle")}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("angleDiagramIntro")}</p>
        <VectorAngleDiagram
          ax={ax}
          ay={ay}
          bx={bx}
          by={by}
          angleDegrees={result.angleBetweenDegrees}
          labelA={t("diagramA")}
          labelB={t("diagramB")}
          angleLabel={result.angleBetweenDegrees === null ? "" : `θ = ${fmt(result.angleBetweenDegrees)}°`}
          caption={t("angleDiagramCaption")}
        />
      </SectionCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}
