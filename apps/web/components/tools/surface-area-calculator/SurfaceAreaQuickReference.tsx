"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function SurfaceAreaQuickReference() {
  const t = useTranslations("tools.surface-area-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Cube: 6 × side²</p>
        <p>Rectangular Prism: 2(lw + lh + wh)</p>
        <p>Sphere: 4 × π × r²</p>
        <p>Cylinder: 2πr(r + height)</p>
        <p>Cone: πr(r + slant height)</p>
        <p>Square Pyramid: base² + 2 × base × slant height</p>
      </div>
    </SectionCard>
  );
}
