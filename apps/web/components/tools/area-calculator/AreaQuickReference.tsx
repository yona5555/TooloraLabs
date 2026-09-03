"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function AreaQuickReference() {
  const t = useTranslations("tools.area-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Square: side²</p>
        <p>Rectangle: width × height</p>
        <p>Triangle: ½ × base × height</p>
        <p>Circle: π × r²</p>
        <p>Ellipse: π × a × b</p>
        <p>Trapezoid: ½ × (b₁ + b₂) × height</p>
        <p>Parallelogram: base × height</p>
        <p>Sector: (θ/360) × π × r²</p>
      </div>
    </SectionCard>
  );
}
