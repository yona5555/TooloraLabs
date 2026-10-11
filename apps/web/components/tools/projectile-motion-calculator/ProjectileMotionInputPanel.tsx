"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ProjectileGravityTabs from "./ProjectileGravityTabs";
import type { GravityPreset, ProjectileInputs } from "./types";

type ProjectileMotionInputPanelProps = {
  inputs: ProjectileInputs;
  onFieldChange: (key: keyof ProjectileInputs, value: string) => void;
  gravityPreset: GravityPreset;
  onGravityPresetChange: (preset: GravityPreset) => void;
  onClear: () => void;
};

/** Live inputs: every keystroke updates the Result card, the 3D drawing and every indicator. */
export default function ProjectileMotionInputPanel({ inputs, onFieldChange, gravityPreset, onGravityPresetChange, onClear }: ProjectileMotionInputPanelProps) {
  const t = useTranslations("tools.projectile-motion-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("speedLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("speedPlaceholder")}
          value={inputs.speed}
          onChange={(e) => onFieldChange("speed", e.target.value)}
        />
        <ToolInput
          label={t("angleLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("anglePlaceholder")}
          value={inputs.angle}
          onChange={(e) => onFieldChange("angle", e.target.value)}
        />
        <ToolInput
          label={t("heightLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("heightPlaceholder")}
          value={inputs.height}
          onChange={(e) => onFieldChange("height", e.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("gravityPresetLabel")}</span>
          <ProjectileGravityTabs preset={gravityPreset} onPresetChange={onGravityPresetChange} />
        </div>

        {gravityPreset === "custom" && (
          <ToolInput
            label={t("gravityLabel")}
            hint={t("gravityHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("gravityPlaceholder")}
            value={inputs.gravity}
            onChange={(e) => onFieldChange("gravity", e.target.value)}
          />
        )}

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("clear")}
        </button>
      </div>
    </SectionCard>
  );
}
