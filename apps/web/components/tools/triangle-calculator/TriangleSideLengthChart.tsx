"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { EXAMPLE } from "./triangleEducationMath";

/** Labeled Bar Chart (#1 in the approved diagram library) — the example triangle's three real side lengths compared side by side. */
export default function TriangleSideLengthChart() {
  const t = useTranslations("tools.triangle-calculator.education.lab.sideLengths");
  const tw = useTranslations("tools.triangle-calculator.education.lab.sideLengths.worked");

  const bars = [
    { label: t("sideA"), value: EXAMPLE.a, formatted: `${EXAMPLE.a}` },
    { label: t("sideB"), value: EXAMPLE.b, formatted: `${EXAMPLE.b}` },
    { label: t("sideC"), value: EXAMPLE.c, formatted: `${EXAMPLE.c}`, highlight: true },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <EduBarChart bars={bars} ariaLabel={t("title")} />
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: t("sideA"), value: `${EXAMPLE.a}` },
            { label: t("sideB"), value: `${EXAMPLE.b}` },
            { label: t("sideC"), value: `${EXAMPLE.c}` },
            { label: tw("perimeter"), value: `${EXAMPLE.perimeter}`, emphasize: true, note: tw("perimeterNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
