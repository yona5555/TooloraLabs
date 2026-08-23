"use client";
import { useTranslations } from "next-intl";
import { Shuffle } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { HarmonyType } from "@tooloralabs/tools";

type ColorPaletteInputPanelProps = {
  baseHex: string;
  onBaseHexChange: (value: string) => void;
  onRandomize: () => void;
  harmony: HarmonyType;
  onHarmonyChange: (value: HarmonyType) => void;
  error: string;
};

const HARMONIES: HarmonyType[] = [
  "complementary",
  "analogous",
  "triadic",
  "splitComplementary",
  "tetradic",
  "monochromatic",
];

export default function ColorPaletteInputPanel({
  baseHex,
  onBaseHexChange,
  onRandomize,
  harmony,
  onHarmonyChange,
  error,
}: ColorPaletteInputPanelProps) {
  const t = useTranslations("tools.color-palette-generator");
  const isValidForSwatch = /^#[0-9a-fA-F]{6}$/.test(baseHex);

  return (
    <SectionCard title={t("form.inputTitle")}>
      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.baseColorLabel")}
          </span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={isValidForSwatch ? baseHex : "#3b82f6"}
              onChange={(e) => onBaseHexChange(e.target.value)}
              className="h-12 w-14 cursor-pointer rounded-lg border border-zinc-300 bg-transparent dark:border-zinc-700"
              aria-label={t("form.baseColorLabel")}
            />
            <input
              type="text"
              dir="ltr"
              value={baseHex}
              onChange={(e) => onBaseHexChange(e.target.value)}
              placeholder="#3B82F6"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={onRandomize}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Shuffle size={16} />
              {t("form.randomButton")}
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.harmonyLabel")}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {HARMONIES.map((value) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                  harmony === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="harmony"
                  value={value}
                  checked={harmony === value}
                  onChange={() => onHarmonyChange(value)}
                  className="sr-only"
                />
                {t(`form.harmony.${value}`)}
              </label>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
