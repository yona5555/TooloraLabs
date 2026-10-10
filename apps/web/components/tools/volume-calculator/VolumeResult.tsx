"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import VolumeLive3D from "./VolumeLive3D";
import VolumeShareExportModal from "./VolumeShareExportModal";
import type { Solid3DDraft, VolumeResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  draft: Solid3DDraft;
  hasCalculated: boolean;
};

export default function VolumeResult({ result, digitStyle, draft, hasCalculated }: Props) {
  const t = useTranslations("tools.volume-calculator.result");
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
    <SectionCard title={t("heading")} action={<VolumeShareExportModal result={result} digitStyle={digitStyle} draft={draft} />}>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.volume)}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("cubicUnits")}</p>
      </div>
      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <VolumeLive3D draft={draft} />
      </div>
    </SectionCard>
  );
}
