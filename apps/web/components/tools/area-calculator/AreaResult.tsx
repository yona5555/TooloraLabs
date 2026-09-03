import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import CopyButton from "@/components/tool-ui/CopyButton";
import AreaLiveShape from "./AreaLiveShape";
import type { AreaDraft, AreaResult as Result } from "./types";

type Props = {
  result: Result;
  digitStyle: DigitStyle;
  draft: AreaDraft;
};

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = Number(s.replace(",", "."));
  return Number.isNaN(n) ? undefined : n;
}

export default function AreaResult({ result, digitStyle, draft }: Props) {
  const t = useTranslations("tools.area-calculator.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 6 });

  if (result.error) {
    const messageKey = result.error === "missing-dimension" ? "missingDimension" : "invalidDimension";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={`${fmt(result.area)} ${t("squareUnits")}`} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6 text-center">
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
    </div>
  );
}
