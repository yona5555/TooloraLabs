"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { EXAMPLE, round } from "./triangleEducationMath";

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
        <ol className="flex min-w-[560px] items-start justify-between gap-2">
          {stations.map((s, i) => (
            <li key={s.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={`h-px flex-1 ${i === 0 ? "opacity-0" : "bg-blue-300 dark:bg-blue-500/40"}`} />
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</div>
                <div className={`h-px flex-1 ${i === stations.length - 1 ? "opacity-0" : "bg-blue-300 dark:bg-blue-500/40"}`} />
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t(`stations.${s.key}`)}</p>
              <p className="mt-1 font-mono text-xs text-blue-700 dark:text-blue-300">{s.value}</p>
            </li>
          ))}
        </ol>
      </div>
    </SectionCard>
  );
}
