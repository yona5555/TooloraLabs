"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import AreaLiveShape from "./AreaLiveShape";
import AreaShareExportModal from "./AreaShareExportModal";
import type { AreaDraft, AreaResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  draft: AreaDraft;
  hasCalculated: boolean;
};

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = Number(s.replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

export default function AreaResult({ result, digitStyle, draft, hasCalculated }: Props) {
  const t = useTranslations("tools.area-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 6 });

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
    const messageKey = result.error === "missing-dimension" ? "missingDimension" : "invalidDimension";
    return (
      <SectionCard title={t("heading")}>
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={t("heading")} action={<AreaShareExportModal result={result} digitStyle={digitStyle} draft={draft} />}>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.area)}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("squareUnits")}</p>
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <AreaLiveShape
            shape={draft.shape}
            side={toNum(draft.side)}
            width={toNum(draft.width)}
            height={toNum(draft.height)}
            base={toNum(draft.base)}
            radius={toNum(draft.radius)}
            semiMajorAxis={toNum(draft.semiMajorAxis)}
            semiMinorAxis={toNum(draft.semiMinorAxis)}
            base1={toNum(draft.base1)}
            base2={toNum(draft.base2)}
            angleDegrees={toNum(draft.angleDegrees)}
          />
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{t("shapePreviewCaption")}</p>
        </div>
      </div>
    </SectionCard>
  );
}
