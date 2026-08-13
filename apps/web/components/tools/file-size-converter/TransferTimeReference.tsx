"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { estimateTransferSeconds } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type TransferTimeReferenceProps = {
  bytes: number;
  digitStyle: DigitStyle;
};

const PRESETS = [
  { key: "dialUp", mbps: 0.056 },
  { key: "mobile4g", mbps: 25 },
  { key: "broadbandWifi", mbps: 100 },
  { key: "gigabitFiber", mbps: 1000 },
] as const;

export default function TransferTimeReference({ bytes, digitStyle }: TransferTimeReferenceProps) {
  const t = useTranslations("tools.file-size-converter.aboveFold.transferTime");

  function formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${formatLocalizedNumber(seconds, digitStyle, { maximumFractionDigits: 1 })} ${t("seconds")}`;
    }
    if (seconds < 3600) {
      return `${formatLocalizedNumber(seconds / 60, digitStyle, { maximumFractionDigits: 1 })} ${t("minutes")}`;
    }
    if (seconds < 86400) {
      return `${formatLocalizedNumber(seconds / 3600, digitStyle, { maximumFractionDigits: 1 })} ${t("hours")}`;
    }
    return `${formatLocalizedNumber(seconds / 86400, digitStyle, { maximumFractionDigits: 1 })} ${t("days")}`;
  }

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-2.5">
        {PRESETS.map(({ key, mbps }) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-800/60">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{t(`presets.${key}`)}</span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {bytes > 0 ? formatDuration(estimateTransferSeconds(bytes, mbps)) : "—"}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
