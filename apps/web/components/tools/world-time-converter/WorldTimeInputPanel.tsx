"use client";
import { useTranslations } from "next-intl";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorldTimeCityPicker from "./WorldTimeCityPicker";
import { WORLD_TIME_SCENARIOS, type WorldTimeScenario } from "./types";

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
  onScenarioPreset: (scenario: WorldTimeScenario) => void;
  onClear: () => void;
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
  onScenarioPreset,
  onClear,
}: WorldTimeInputPanelProps) {
  const t = useTranslations("tools.world-time-converter.aboveFold");
  const tScenarios = useTranslations("tools.world-time-converter.scenarios");

  return (
    <SectionCard title={t("converterTitle")}>
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {WORLD_TIME_SCENARIOS.map((scenario) => (
            <button
              key={scenario.key}
              type="button"
              onClick={() => onScenarioPreset(scenario)}
              className="rounded-lg border border-current/20 bg-transparent px-3 py-1.5 text-xs font-medium text-current/70 transition hover:border-blue-300 hover:text-current sm:text-sm"
            >
              {tScenarios(scenario.key)}
            </button>
          ))}
        </div>
      </div>
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

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={16} />
          {t("clearLabel")}
        </button>
      </div>
    </SectionCard>
  );
}
