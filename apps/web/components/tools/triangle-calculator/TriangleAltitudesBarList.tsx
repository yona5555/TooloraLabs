"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { EXAMPLE, altitudes, round } from "./triangleEducationMath";

/** Ranked Horizontal Bar List (#5) — the three altitudes (heights), ranked longest to shortest, showing the longest side always carries the shortest altitude. */
export default function TriangleAltitudesBarList() {
  const t = useTranslations("tools.triangle-calculator.education.lab.altitudes");
  const tw = useTranslations("tools.triangle-calculator.education.lab.altitudes.worked");

  const rows = [
    { key: "toA", side: EXAMPLE.a, h: altitudes.toA, label: t("toSide", { side: EXAMPLE.a }) },
    { key: "toB", side: EXAMPLE.b, h: altitudes.toB, label: t("toSide", { side: EXAMPLE.b }) },
    { key: "toC", side: EXAMPLE.c, h: altitudes.toC, label: t("toSide", { side: EXAMPLE.c }) },
  ].sort((x, y) => y.h - x.h);

  const bars = rows.map((r, i) => ({ label: r.label, value: r.h, formatted: `${round(r.h)}`, highlight: i === 0 }));

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={rows.map((r, i) => ({
            label: r.label,
            value: `${round(r.h)}`,
            emphasize: i === 0,
            note: i === 0 ? tw("longestNote") : undefined,
          }))}
        />
      </div>
    </SectionCard>
  );
}
