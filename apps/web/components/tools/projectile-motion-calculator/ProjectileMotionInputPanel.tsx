"use client";
import type { FormEvent } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import ProjectileGravityTabs from "./ProjectileGravityTabs";
import ProjectileVelocityComponentsDiagram from "./ProjectileVelocityComponentsDiagram";
import { parseLocalizedNumber } from "@tooloralabs/core";
import type { GravityPreset } from "./types";

type ProjectileMotionInputPanelProps = {
  speed: string;
  onSpeedChange: (value: string) => void;
  angle: string;
  onAngleChange: (value: string) => void;
  height: string;
  onHeightChange: (value: string) => void;
  gravity: string;
  onGravityChange: (value: string) => void;
  gravityPreset: GravityPreset;
  onGravityPresetChange: (preset: GravityPreset) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function ProjectileMotionInputPanel({
  speed,
  onSpeedChange,
  angle,
  onAngleChange,
  height,
  onHeightChange,
  gravity,
  onGravityChange,
  gravityPreset,
  onGravityPresetChange,
  onCalculate,
  onClear,
}: ProjectileMotionInputPanelProps) {
  const t = useTranslations("tools.projectile-motion-calculator.form");
  const angleValue = parseLocalizedNumber(angle) || 0;

  return (
    <SectionCard title={t("inputTitle")}>
      <ProjectileVelocityComponentsDiagram
        angleDegrees={angleValue}
        vxLabel={t("vxLabel")}
        vyLabel={t("vyLabel")}
        vLabel={t("vLabel")}
        caption={t("componentsCaption")}
      />

      <form onSubmit={onCalculate} className="mt-4 space-y-5">
        <ToolInput
          label={t("speedLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("speedPlaceholder")}
          value={speed}
          onChange={(e) => onSpeedChange(e.target.value)}
        />
        <ToolInput
          label={t("angleLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("anglePlaceholder")}
          value={angle}
          onChange={(e) => onAngleChange(e.target.value)}
        />
        <ToolInput
          label={t("heightLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("heightPlaceholder")}
          value={height}
          onChange={(e) => onHeightChange(e.target.value)}
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
            value={gravity}
            onChange={(e) => onGravityChange(e.target.value)}
          />
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
