"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { EXAMPLE, round } from "./triangleEducationMath";
import StationTimeline from "@/components/tool-ui/StationTimeline";

/** Timeline with Stations (#9) — the actual SSS solving sequence this tool runs, in order, with the real intermediate value produced at each step. */
export default function TriangleSolvingTimeline() {
  const t = useTranslations("tools.triangle-calculator.education.lab.timeline");

  const stations = [
    { key: "given", value: `a=${EXAMPLE.a}, b=${EXAMPLE.b}, c=${EXAMPLE.c}` },
    { key: "angleA", value: `${round(EXAMPLE.angleA)}°` },
    { key: "angleB", value: `${round(EXAMPLE.angleB)}°` },
    { key: "angleC", value: `${round(EXAMPLE.angleC)}° (180° − A − B)` },
    { key: "area", value: `${round(EXAMPLE.area)}` },
  ];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-5 overflow-x-auto">
        <StationTimeline minWidth="min-w-[560px]" stations={stations.map((s) => ({ key: s.key, label: t(`stations.${s.key}`), value: s.value }))} />
      </div>
    </SectionCard>
  );
}
