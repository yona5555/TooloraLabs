"use client";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { LOREM_UNITS, LOREM_STYLES } from "./types";
import type { LoremUnit, LoremStyle } from "./types";

type Props = {
  unit: LoremUnit;
  onUnitChange: (value: LoremUnit) => void;
  count: string;
  onCountChange: (value: string) => void;
  style: LoremStyle;
  onStyleChange: (value: LoremStyle) => void;
  startWithLorem: boolean;
  onStartWithLoremChange: (value: boolean) => void;
  onGenerate: () => void;
};

export default function LoremInputPanel({
  unit,
  onUnitChange,
  count,
  onCountChange,
  style,
  onStyleChange,
  startWithLorem,
  onStartWithLoremChange,
  onGenerate,
}: Props) {
  const t = useTranslations("tools.lorem-ipsum-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("styleLabel")}</span>
          <div className="flex gap-2">
            {LOREM_STYLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStyleChange(s)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  style === s
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {t(`styles.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("unitLabel")}</span>
          <div className="flex flex-wrap gap-1.5">
            {LOREM_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => onUnitChange(u)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  unit === u
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {t(`units.${u}`)}
              </button>
            ))}
          </div>
        </div>

        <ToolInput
          label={t("countLabel")}
          type="text"
          inputMode="numeric"
          value={count}
          onChange={(e) => onCountChange(e.target.value)}
        />

        {style === "classic" && (
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => onStartWithLoremChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-blue-600 dark:border-zinc-600"
            />
            {t("startWithLorem")}
          </label>
        )}

        <button
          type="button"
          onClick={onGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={18} />
          {t("generate")}
        </button>
      </div>
    </SectionCard>
  );
}
