"use client";
import { useTranslations } from "next-intl";
import { RichText } from "@/components/tool-ui/indicator-kit/CardKit";
import { MOLARITY_MODES, type MolarityMode } from "./types";

type MolarityModeTabsProps = {
  mode: MolarityMode;
  onModeChange: (mode: MolarityMode) => void;
};

export default function MolarityModeTabs({ mode, onModeChange }: MolarityModeTabsProps) {
  const t = useTranslations("tools.molarity-calculator.form");

  return (
    <div role="tablist" aria-label={t("modeLabel")} className="flex flex-wrap gap-1.5">
      {MOLARITY_MODES.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => onModeChange(value)}
          // Rims use the shared line token so every tab keeps ≥3:1 against the card in light and dark.
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            mode === value
              ? "border-blue-700 bg-blue-600 text-white dark:border-blue-300"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
          }`}
          style={mode === value ? undefined : { borderColor: "var(--ph-line)" }}
        >
          <RichText text={t(`mode.${value}`)} />
        </button>
      ))}
    </div>
  );
}
