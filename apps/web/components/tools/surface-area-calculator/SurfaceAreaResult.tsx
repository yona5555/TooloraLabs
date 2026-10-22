"use client";
import { Calculator } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import SurfaceAreaLive3D from "./SurfaceAreaLive3D";
import SurfaceAreaShareExportModal from "./SurfaceAreaShareExportModal";
import { parseSurfaceDims, computeVolumeFor, round } from "./surfaceAreaEducationMath";
import type { Solid3DDraft, SurfaceAreaResult as Result } from "./types";

const M2_TO_FT2 = 10.7639;
const M2_TO_IN2 = 1550.0031;

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  draft: Solid3DDraft;
  hasCalculated: boolean;
};

export default function SurfaceAreaResult({ result, digitStyle, draft, hasCalculated }: Props) {
  const t = useTranslations("tools.surface-area-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 6 });

  if (!hasCalculated) {
    return (
      <SectionCard title={t("heading")} mobilePlain bodyClassName="max-md:p-[11px] md:p-4 lg:p-6">
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
      <SectionCard title={t("heading")} mobilePlain bodyClassName="max-md:p-[11px] md:p-4 lg:p-6">
        <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
      </SectionCard>
    );
  }

  // Phone standard (<768px, 2026-10-22, this tool only): the three figures re-using the same
  // existing unit-conversion math as "The Live Surface Area in Other Units" below (m² assumed as
  // the base unit, same as that section) plus the volume this tool's own VolumeCalculator already
  // derives from the identical dimensions — no new calculation logic, just the same numbers
  // surfaced in a compact row instead of the full 3D scene, which only fits at `md` and up.
  const m2 = result.surfaceArea;
  const ft2 = m2 * M2_TO_FT2;
  const in2 = m2 * M2_TO_IN2;
  const volume = computeVolumeFor(parseSurfaceDims(draft));

  return (
    <SectionCard title={t("heading")} mobilePlain bodyClassName="max-md:p-[11px] md:p-4 lg:p-6" action={<SurfaceAreaShareExportModal result={result} digitStyle={digitStyle} draft={draft} />}>
      <div className="text-center max-md:hidden">
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.surfaceArea)}</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("squareUnits")}</p>
      </div>
      <div className="mt-4 border-t border-zinc-100 pt-4 max-md:hidden dark:border-zinc-800">
        <SurfaceAreaLive3D draft={draft} />
      </div>

      {/* Mobile-only compact summary: hero number + unit, then one row of 3 derived values. */}
      <div className="text-center md:hidden">
        <p dir="ltr" className="text-[34px] leading-none font-bold text-blue-600 dark:text-blue-400">
          {fmt(result.surfaceArea)}
        </p>
        <p className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400">{t("squareUnits")}</p>
      </div>
      <div className="mt-4 grid grid-cols-3 border-t border-zinc-100 pt-3 text-center md:hidden dark:border-zinc-800">
        <div className="border-e border-zinc-100 px-1 dark:border-zinc-800">
          <p dir="ltr" className="font-mono text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">{`${round(ft2)} ft²`}</p>
        </div>
        <div className="border-e border-zinc-100 px-1 dark:border-zinc-800">
          <p dir="ltr" className="font-mono text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">{`${round(in2, 0)} in²`}</p>
        </div>
        <div className="px-1">
          <p dir="ltr" className="font-mono text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">{`${round(volume)} units³`}</p>
        </div>
      </div>
    </SectionCard>
  );
}
