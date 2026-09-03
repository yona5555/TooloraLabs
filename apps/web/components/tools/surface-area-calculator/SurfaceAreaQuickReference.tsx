"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function SurfaceAreaQuickReference() {
  const t = useTranslations("tools.surface-area-calculator.aboveFold.quickReference");
  const tForm = useTranslations("tools.surface-area-calculator.form");

  const rows: Array<{ shape: string; formula: string }> = [
    { shape: tForm("shape.cube"), formula: `6 × ${tForm("sideLabel")}²` },
    { shape: tForm("shape.rectangular-prism"), formula: "2(lw + lh + wh)" },
    { shape: tForm("shape.sphere"), formula: "4 × π × r²" },
    { shape: tForm("shape.cylinder"), formula: `2πr(r + ${tForm("heightLabel")})` },
    { shape: tForm("shape.cone"), formula: `πr(r + ${t("slantHeight")})` },
    { shape: tForm("shape.square-pyramid"), formula: `${tForm("baseSideLabel")}² + 2 × ${tForm("baseSideLabel")} × ${t("slantHeight")}` },
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
