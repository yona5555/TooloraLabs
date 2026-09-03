"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function VolumeQuickReference() {
  const t = useTranslations("tools.volume-calculator.aboveFold.quickReference");
  const tForm = useTranslations("tools.volume-calculator.form");

  const rows: Array<{ shape: string; formula: string }> = [
    { shape: tForm("shape.cube"), formula: `${tForm("sideLabel")}³` },
    { shape: tForm("shape.rectangular-prism"), formula: `${tForm("lengthLabel")} × ${tForm("widthLabel")} × ${tForm("heightLabel")}` },
    { shape: tForm("shape.sphere"), formula: "(4/3) × π × r³" },
    { shape: tForm("shape.cylinder"), formula: `π × r² × ${tForm("heightLabel")}` },
    { shape: tForm("shape.cone"), formula: `(1/3) × π × r² × ${tForm("heightLabel")}` },
    { shape: tForm("shape.square-pyramid"), formula: `(1/3) × ${tForm("baseSideLabel")}² × ${tForm("heightLabel")}` },
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
