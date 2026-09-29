"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { inradius, circumradius, round } from "./triangleEducationMath";

/** Side-by-Side Comparison Cards (#16) — the incircle and circumcircle, same field structure (formula, radius, diameter), for a direct read of how the two differ for this triangle. */
export default function TriangleRadiiComparisonCards() {
  const t = useTranslations("tools.triangle-calculator.education.lab.radii");

  const cards = [
    {
      key: "incircle",
      colorClass: "border-blue-200 dark:border-blue-500/30",
      dotClass: "bg-blue-500 dark:bg-blue-400",
      formula: "r = Area / s",
      radius: inradius,
    },
    {
      key: "circumcircle",
      colorClass: "border-amber-200 dark:border-amber-500/30",
      dotClass: "bg-amber-500 dark:bg-amber-400",
      formula: "R = a / (2·sinA)",
      radius: circumradius,
    },
  ] as const;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <div key={card.key} className={`rounded-xl border p-4 ${card.colorClass}`}>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${card.dotClass}`} />
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{t(`${card.key}.title`)}</p>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t(`${card.key}.description`)}</p>
            <p className="mt-3 font-mono text-xs opacity-60">{card.formula}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {t("radiusLabel")} = {round(card.radius)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("diameterLabel")} = {round(card.radius * 2)}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs opacity-60">{t("note", { ratio: round(circumradius / inradius) })}</p>
    </SectionCard>
  );
}
