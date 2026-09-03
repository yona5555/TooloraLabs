"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function AreaQuickReference() {
  const t = useTranslations("tools.area-calculator.aboveFold.quickReference");
  const tForm = useTranslations("tools.area-calculator.form");

  const rows: Array<{ shape: string; formula: string }> = [
    { shape: tForm("shape.square"), formula: `${tForm("sideLabel")}²` },
    { shape: tForm("shape.rectangle"), formula: `${tForm("widthLabel")} × ${tForm("heightLabel")}` },
    { shape: tForm("shape.triangle"), formula: `½ × ${tForm("baseLabel")} × ${tForm("heightLabel")}` },
    { shape: tForm("shape.circle"), formula: "π × r²" },
    { shape: tForm("shape.ellipse"), formula: "π × a × b" },
    { shape: tForm("shape.trapezoid"), formula: `½ × (b₁ + b₂) × ${tForm("heightLabel")}` },
    { shape: tForm("shape.parallelogram"), formula: `${tForm("baseLabel")} × ${tForm("heightLabel")}` },
    { shape: tForm("shape.sector"), formula: "(θ/360) × π × r²" },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        {rows.map((row) => (
          <p key={row.shape}>
            {row.shape}: <span dir="ltr" className="inline-block">{row.formula}</span>
          </p>
        ))}
      </div>
    </SectionCard>
  );
}
