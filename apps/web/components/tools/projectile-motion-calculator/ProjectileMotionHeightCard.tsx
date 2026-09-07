"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type ProjectileMotionHeightCardProps = {
  maxHeight: number;
  digitStyle: DigitStyle;
};

const FLOOR_HEIGHT_M = 3;

export default function ProjectileMotionHeightCard({ maxHeight, digitStyle }: ProjectileMotionHeightCardProps) {
  const t = useTranslations("tools.projectile-motion-calculator.heightCard");
  const floors = maxHeight / FLOOR_HEIGHT_M;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      {maxHeight > 0 && (
        <p className="mt-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          {t("result", { floors: formatLocalizedNumber(floors, digitStyle, { maximumFractionDigits: 1 }) })}
        </p>
      )}
    </SectionCard>
  );
}
