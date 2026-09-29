"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { EXAMPLE, exampleSideCFeet, round } from "./triangleEducationMath";

/** Side-by-Side Equivalence (#11) — the same real side length re-expressed in a second unit system, proving both describe the same physical distance. */
export default function TriangleUnitConversionEquivalence() {
  const t = useTranslations("tools.triangle-calculator.education.lab.unitConversion");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5 flex flex-wrap items-center justify-center gap-4">
        <div className="rounded-xl border border-blue-200 bg-blue-500/5 px-6 py-4 text-center dark:border-blue-500/30 dark:bg-blue-400/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("meters")}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{EXAMPLE.c} m</p>
        </div>
        <span className="text-2xl font-bold opacity-50">=</span>
        <div className="rounded-xl border border-amber-200 bg-amber-500/5 px-6 py-4 text-center dark:border-amber-500/30 dark:bg-amber-400/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("feet")}</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{round(exampleSideCFeet)} ft</p>
        </div>
      </div>
      <p className="mt-4 text-center text-xs opacity-60">{t("note")}</p>
    </SectionCard>
  );
}
