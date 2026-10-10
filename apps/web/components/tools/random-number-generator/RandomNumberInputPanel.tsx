"use client";
import { useTranslations } from "next-intl";
import { Dices, RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { PRESETS, SORT_ORDERS, type PresetKey, type SortOrder } from "./types";

type Props = {
  min: string;
  onMinChange: (value: string) => void;
  max: string;
  onMaxChange: (value: string) => void;
  count: string;
  onCountChange: (value: string) => void;
  allowDuplicates: boolean;
  onAllowDuplicatesChange: (value: boolean) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  seed: string;
  onSeedChange: (value: string) => void;
  activePreset: PresetKey | null;
  onPreset: (key: PresetKey) => void;
  onGenerate: () => void;
  onClear: () => void;
};

const pill = (on: boolean) =>
  `rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
    on ? "border-blue-400 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
  }`;

export default function RandomNumberInputPanel(p: Props) {
  const t = useTranslations("tools.random-number-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("minLabel")} type="text" inputMode="decimal" value={p.min} onChange={(e) => p.onMinChange(e.target.value)} data-testid="rng-min" />
          <ToolInput label={t("maxLabel")} type="text" inputMode="decimal" value={p.max} onChange={(e) => p.onMaxChange(e.target.value)} data-testid="rng-max" />
        </div>

        <ToolInput label={t("countLabel")} type="text" inputMode="numeric" value={p.count} onChange={(e) => p.onCountChange(e.target.value)} data-testid="rng-count" />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("duplicatesLabel")}</span>
          <div className="flex gap-2">
            <button type="button" aria-pressed={p.allowDuplicates} onClick={() => p.onAllowDuplicatesChange(true)} className={`flex-1 ${pill(p.allowDuplicates)}`}>
              {t("duplicatesAllow")}
            </button>
            <button type="button" aria-pressed={!p.allowDuplicates} onClick={() => p.onAllowDuplicatesChange(false)} className={`flex-1 ${pill(!p.allowDuplicates)}`} data-testid="rng-nodup">
              {t("duplicatesDisallow")}
            </button>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("sortOrderLabel")}</span>
          <div className="flex flex-wrap gap-1.5">
            {SORT_ORDERS.map((order) => (
              <button key={order} type="button" aria-pressed={p.sortOrder === order} onClick={() => p.onSortOrderChange(order)} className={pill(p.sortOrder === order)}>
                {t(`sortOrders.${order}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <ToolInput label={t("seedLabel")} type="text" inputMode="numeric" value={p.seed} onChange={(e) => p.onSeedChange(e.target.value)} data-testid="rng-seed" />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("seedHint")}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={p.onGenerate}
            data-testid="rng-generate"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Dices size={18} />
            {t("generate")}
          </button>
          <button
            type="button"
            onClick={p.onClear}
            className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={16} />
            {t("clear")}
          </button>
        </div>

        {/* §20 quick picks: each one sets every input to a real-world draw. */}
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("presetsLabel")}</span>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                aria-pressed={p.activePreset === preset.key}
                onClick={() => p.onPreset(preset.key)}
                data-testid={`rng-preset-${preset.key}`}
                className={`flex flex-col items-start rounded-lg border px-2.5 py-1.5 text-start transition ${
                  p.activePreset === preset.key
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{t(`presets.${preset.key}`)}</span>
                <span dir="ltr" className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  {`${preset.settings.min}–${preset.settings.max} · ×${preset.settings.count}${preset.settings.allowDuplicates ? "" : " ≠"}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
