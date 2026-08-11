"use client";
import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorldTimeCityPicker from "./WorldTimeCityPicker";

type WorldTimeInputPanelProps = {
  fromCityId: string;
  onFromCityChange: (id: string) => void;
  toCityId: string;
  onToCityChange: (id: string) => void;
  onSwap: () => void;
  useNow: boolean;
  onUseNowChange: (value: boolean) => void;
  customDateTime: string;
  onCustomDateTimeChange: (value: string) => void;
};

export default function WorldTimeInputPanel({
  fromCityId,
  onFromCityChange,
  toCityId,
  onToCityChange,
  onSwap,
  useNow,
  onUseNowChange,
  customDateTime,
  onCustomDateTimeChange,
}: WorldTimeInputPanelProps) {
  const t = useTranslations("tools.world-time-converter.aboveFold");

  return (
    <SectionCard title={t("converterTitle")}>
      <div className="space-y-5">
        <WorldTimeCityPicker label={t("fromLabel")} value={fromCityId} onChange={onFromCityChange} />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSwap}
            aria-label={t("swapLabel")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <ArrowUpDown size={18} />
          </button>
        </div>

        <WorldTimeCityPicker label={t("toLabel")} value={toCityId} onChange={onToCityChange} />

        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!useNow}
              onChange={(e) => onUseNowChange(!e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("customTimeLabel")}</span>
          </label>

          {!useNow && (
            <div className="mt-3">
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => onCustomDateTimeChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("customTimeHint")}</p>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
