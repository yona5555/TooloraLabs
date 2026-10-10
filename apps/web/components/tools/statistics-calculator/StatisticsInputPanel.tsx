"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { STATISTICS_EXAMPLES, STATISTICS_SCENARIOS, type StatisticsScenario } from "./types";

type StatisticsInputPanelProps = {
  rawData: string;
  onRawDataChange: (value: string) => void;
  onScenarioPreset: (scenario: StatisticsScenario) => void;
  onClear: () => void;
};

export default function StatisticsInputPanel({ rawData, onRawDataChange, onScenarioPreset, onClear }: StatisticsInputPanelProps) {
  const t = useTranslations("tools.statistics-calculator.form");
  const tScenarios = useTranslations("tools.statistics-calculator.scenarios");
  const tLive = useTranslations("tools.statistics-calculator.live3d");

  return (
    <SectionCard title={t("inputTitle")} className="flex flex-col lg:h-full" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
      <div className="mb-5">
        <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("scenarioLabel")}</span>
        <div className="flex flex-wrap gap-2">
          {STATISTICS_SCENARIOS.map((scenario) => (
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
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("inputLabel")}</span>
        <textarea
          value={rawData}
          onChange={(e) => onRawDataChange(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={8}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("inputHint")}</p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>

      {/* §17/§27: quick examples fill the column; one click loads a real data set. */}
      <div className="mt-5 flex flex-1 flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{tLive("quickExamples")}</span>
        <ul className="mt-2 flex flex-1 flex-col justify-between gap-1.5">
          {STATISTICS_EXAMPLES.map((example) => {
            const active = rawData === example.rawData;
            return (
              <li key={example.key}>
                <button
                  type="button"
                  onClick={() => onScenarioPreset(example)}
                  className={`flex w-full flex-col gap-0.5 rounded-lg border px-3 py-2 text-start text-sm transition ${active ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-700 dark:hover:bg-blue-500/5"}`}
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{tLive(`examples.${example.key}`)}</span>
                  <span dir="ltr" className="truncate text-start font-mono text-xs text-blue-700 dark:text-blue-300">{example.rawData}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionCard>
  );
}
