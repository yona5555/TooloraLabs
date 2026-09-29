"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { EXAMPLE, round } from "./triangleEducationMath";

const W = 300;
const H = 48;
const SEGMENTS = [
  { key: "a", value: EXAMPLE.a, colorClass: "fill-blue-500 dark:fill-blue-400" },
  { key: "b", value: EXAMPLE.b, colorClass: "fill-emerald-500 dark:fill-emerald-400" },
  { key: "c", value: EXAMPLE.c, colorClass: "fill-amber-500 dark:fill-amber-400" },
] as const;

/** Stacked Segmented Bar (#15) — the perimeter broken into its three real side-length components, each labeled with its own share. */
export default function TrianglePerimeterStackedBar() {
  const t = useTranslations("tools.triangle-calculator.education.lab.perimeterBar");
  const tw = useTranslations("tools.triangle-calculator.education.lab.perimeterBar.worked");
  const tSeg = useTranslations("tools.triangle-calculator.education.lab.perimeterBar.segments");

  const segments = SEGMENTS.reduce<Array<(typeof SEGMENTS)[number] & { x: number; w: number; pct: number }>>((acc, s) => {
    const w = (s.value / EXAMPLE.perimeter) * W;
    const x = acc.length > 0 ? acc[acc.length - 1].x + acc[acc.length - 1].w : 0;
    return [...acc, { ...s, x, w, pct: (s.value / EXAMPLE.perimeter) * 100 }];
  }, []);

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto block w-full max-w-[300px]">
            {segments.map((s) => (
              <g key={s.key}>
                <rect x={s.x} y={8} width={Math.max(s.w, 1)} height={24} className={s.colorClass} />
                <text x={s.x + s.w / 2} y={24} textAnchor="middle" fontSize={11} fontWeight={700} fill="white">
                  {s.value}
                </text>
                <text x={s.x + s.w / 2} y={44} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7}>
                  {round(s.pct, 0)}%
                </text>
              </g>
            ))}
          </svg>
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={[
            ...segments.map((s) => ({ label: tSeg(s.key), value: `${s.value} (${round(s.pct, 0)}%)` })),
            { label: tw("total"), value: `${EXAMPLE.perimeter}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
