"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type ProjectileMotionInputPanelProps = {
  speed: string;
  onSpeedChange: (value: string) => void;
  angle: string;
  onAngleChange: (value: string) => void;
  height: string;
  onHeightChange: (value: string) => void;
  gravity: string;
  onGravityChange: (value: string) => void;
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
}: ProjectileMotionInputPanelProps) {
  const t = useTranslations("tools.projectile-motion-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
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
        <ToolInput
          label={t("gravityLabel")}
          hint={t("gravityHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("gravityPlaceholder")}
          value={gravity}
          onChange={(e) => onGravityChange(e.target.value)}
        />
      </div>
    </SectionCard>
  );
}
