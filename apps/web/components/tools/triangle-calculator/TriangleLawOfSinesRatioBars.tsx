"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import EduBarChart from "./EduBarChart";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { EXAMPLE, lawOfSinesRatios, circumdiameter, round } from "./triangleEducationMath";

/** Ranked Horizontal Bar List (#5), reused deliberately: all three bars land at (almost) the same length, which is itself the proof that a/sinA = b/sinB = c/sinC. */
export default function TriangleLawOfSinesRatioBars() {
  const t = useTranslations("tools.triangle-calculator.education.lab.lawOfSines");
  const tw = useTranslations("tools.triangle-calculator.education.lab.lawOfSines.worked");

  const bars = [
    { label: t("ratioA"), value: lawOfSinesRatios.a, formatted: round(lawOfSinesRatios.a).toString() },
    { label: t("ratioB"), value: lawOfSinesRatios.b, formatted: round(lawOfSinesRatios.b).toString() },
    { label: t("ratioC"), value: lawOfSinesRatios.c, formatted: round(lawOfSinesRatios.c).toString(), highlight: true },
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
            { label: t("ratioA"), value: `${round(lawOfSinesRatios.a)}`, note: `sin(${round(EXAMPLE.angleA)}°)` },
            { label: t("ratioB"), value: `${round(lawOfSinesRatios.b)}`, note: `sin(${round(EXAMPLE.angleB)}°)` },
            { label: t("ratioC"), value: `${round(lawOfSinesRatios.c)}`, note: `sin(${round(EXAMPLE.angleC)}°)` },
            { label: tw("circumdiameter"), value: `${round(circumdiameter)}`, emphasize: true, note: tw("circumdiameterNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
