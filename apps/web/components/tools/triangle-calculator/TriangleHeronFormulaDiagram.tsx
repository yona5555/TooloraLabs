"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import { heron, round } from "./triangleEducationMath";

const BOX_W = 56;
const BOX_H = 40;
const GAP = 14;
const boxes = [
  { label: "s", value: heron.s },
  { label: "s−a", value: heron.sMinusA },
  { label: "s−b", value: heron.sMinusB },
  { label: "s−c", value: heron.sMinusC },
];

/** Formula Diagram (#18) — Heron's formula walked step by step: the four terms multiplied under the square root, ending at the real computed area. */
export default function TriangleHeronFormulaDiagram() {
  const t = useTranslations("tools.triangle-calculator.education.lab.heron");
  const tw = useTranslations("tools.triangle-calculator.education.lab.heron.worked");

  const totalW = boxes.length * BOX_W + (boxes.length - 1) * GAP + 90;
  const H = 90;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg viewBox={`0 0 ${totalW} ${H}`} role="img" aria-label={t("title")} className="mx-auto block w-full max-w-[440px]">
            {boxes.map((b, i) => {
              const x = i * (BOX_W + GAP);
              return (
                <g key={b.label}>
                  <rect x={x} y={20} width={BOX_W} height={BOX_H} rx={6} className="fill-blue-500/10 stroke-blue-500 dark:fill-blue-400/10 dark:stroke-blue-400" strokeWidth={1.5} />
                  <text x={x + BOX_W / 2} y={38} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">
                    {b.label}
                  </text>
                  <text x={x + BOX_W / 2} y={54} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
                    {round(b.value)}
                  </text>
                  {i < boxes.length - 1 && (
                    <text x={x + BOX_W + GAP / 2} y={44} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor" opacity={0.5}>
                      ×
                    </text>
                  )}
                </g>
              );
            })}
            <text x={boxes.length * (BOX_W + GAP) - GAP + 20} y={44} textAnchor="middle" fontSize={16} fontWeight={700} fill="currentColor">
              =
            </text>
            <rect x={boxes.length * (BOX_W + GAP) - GAP + 34} y={20} width={56} height={BOX_H} rx={6} className="fill-amber-500/15 stroke-amber-500 dark:fill-amber-400/15 dark:stroke-amber-400" strokeWidth={1.5} />
            <text x={boxes.length * (BOX_W + GAP) - GAP + 62} y={38} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
              √{round(heron.product, 0)}
            </text>
            <text x={boxes.length * (BOX_W + GAP) - GAP + 62} y={54} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-amber-600 dark:fill-amber-400">
              {round(Math.sqrt(heron.product))}
            </text>
          </svg>
        </div>
        <TriangleWorkedExampleNote
          title={tw("title")}
          rows={[
            { label: "s", value: `${round(heron.s)}` },
            { label: "s−a", value: `${round(heron.sMinusA)}` },
            { label: "s−b", value: `${round(heron.sMinusB)}` },
            { label: "s−c", value: `${round(heron.sMinusC)}` },
            { label: tw("area"), value: `${round(Math.sqrt(heron.product))}`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
