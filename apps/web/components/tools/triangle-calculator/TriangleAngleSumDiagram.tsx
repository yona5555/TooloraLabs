"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * The classic "tear off the three corners and line them up" proof sketch
 * for why a triangle's interior angles always sum to 180°: the same three
 * colored wedges shown once inside a triangle, then again rearranged along
 * a straight line. Fixed illustrative angles (50°/60°/70°), since the point
 * is the sum itself, which holds for every triangle regardless of shape.
 */
export default function TriangleAngleSumDiagram() {
  const d = useTranslations("tools.triangle-calculator.angleSumDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox="0 0 260 190" role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-sm text-current">
          <polygon points="30,150 230,150 90,30" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
          <path d="M 30 150 L 55 150 A 25 25 0 0 0 45 128 Z" className="fill-blue-500/60 dark:fill-blue-400/60" />
          <path d="M 230 150 L 205 150 A 25 25 0 0 1 214 129 Z" className="fill-amber-500/60 dark:fill-amber-400/60" />
          <path d="M 90 30 L 78 50 A 22 22 0 0 0 103 50 Z" className="fill-green-500/60 dark:fill-green-400/60" />

          <line x1="20" y1="175" x2="240" y2="175" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1.5} />
          <path d="M 20 175 L 45 175 A 25 25 0 0 1 57 156 Z" className="fill-blue-500/60 dark:fill-blue-400/60" />
          <path d="M 57 156 L 60 175 A 25 25 0 0 1 90 168 Z" className="fill-amber-500/60 dark:fill-amber-400/60" />
          <path d="M 90 168 L 100 175 A 25 25 0 0 1 130 175 Z" className="fill-green-500/60 dark:fill-green-400/60" />

          <text x="130" y="22" fontSize={13} fontWeight={700} textAnchor="middle" fill="currentColor">
            {d("caption180")}
          </text>
        </svg>
      </div>
      <p className="mt-3 text-center text-sm opacity-80">{d("caption")}</p>
    </SectionCard>
  );
}
