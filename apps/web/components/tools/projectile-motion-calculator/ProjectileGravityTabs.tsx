"use client";
import { useTranslations } from "next-intl";
import { GRAVITY_PRESETS, type GravityPreset } from "./types";

type ProjectileGravityTabsProps = {
  preset: GravityPreset;
  onPresetChange: (preset: GravityPreset) => void;
};

export default function ProjectileGravityTabs({ preset, onPresetChange }: ProjectileGravityTabsProps) {
  const t = useTranslations("tools.projectile-motion-calculator.form");

  return (
    <div role="tablist" aria-label={t("gravityPresetLabel")} className="flex flex-wrap gap-1.5">
      {GRAVITY_PRESETS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={preset === value}
          onClick={() => onPresetChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            preset === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
          }`}
        >
          {t(`gravityPreset.${value}`)}
        </button>
      ))}
    </div>
  );
}
