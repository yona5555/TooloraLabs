"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 280;

/**
 * Static, illustrative concept diagram — fixed example dimensions (not the user's live
 * inputs). Left: a cylinder as a stack of identical circular cross-sections (base area ×
 * height). Right: a cone drawn inside the same cylinder, since a cone's volume is exactly
 * one-third of the cylinder that shares its base and height — the reason for the ⅓ factor
 * in the cone (and, by the same logic, the square-pyramid) formula.
 */
export default function VolumeConceptDiagram() {
  const t = useTranslations("tools.volume-calculator.aboveFold");
  const d = useTranslations("tools.volume-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          {/* Cylinder as stacked disks */}
          <g transform="translate(120,40)">
            {[0, 30, 60, 90, 120, 150].map((y) => (
              <ellipse key={y} cx="0" cy={y} rx="70" ry="16" className="fill-blue-600/15 stroke-blue-700 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={1.5} />
            ))}
            <ellipse cx="0" cy="0" rx="70" ry="16" className="fill-blue-600/30 stroke-blue-700 dark:fill-blue-400/25 dark:stroke-blue-300" strokeWidth={2} />
            <line x1="-70" y1="0" x2="-70" y2="150" stroke="currentColor" strokeWidth={1.5} className="stroke-blue-700 dark:stroke-blue-300" opacity={0.6} />
            <line x1="70" y1="0" x2="70" y2="150" stroke="currentColor" strokeWidth={1.5} className="stroke-blue-700 dark:stroke-blue-300" opacity={0.6} />
          </g>
          <text x="120" y="222" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            πr² × {t("heightLabel")}
          </text>
          <text x="120" y="244" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.55}>
            {d("cylinderCaption")}
          </text>

          {/* Cone inside the same cylinder outline */}
          <g transform="translate(560,40)">
            <ellipse cx="0" cy="150" rx="70" ry="16" className="fill-none stroke-current" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.35} />
            <line x1="-70" y1="0" x2="-70" y2="150" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.35} />
            <line x1="70" y1="0" x2="70" y2="150" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.35} />
            <ellipse cx="0" cy="0" rx="70" ry="16" className="fill-none stroke-current" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.35} />

            <path
              d="M-70,150 L0,0 L70,150 A70,16 0 0 1 -70,150 Z"
              className="fill-amber-500/25 stroke-amber-600 dark:fill-amber-400/20 dark:stroke-amber-300"
              strokeWidth={2}
            />
            <ellipse cx="0" cy="150" rx="70" ry="16" className="fill-amber-500/25 stroke-amber-600 dark:fill-amber-400/20 dark:stroke-amber-300" strokeWidth={2} />
          </g>
          <text x="560" y="222" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
            ⅓ × πr² × {t("heightLabel")}
          </text>
          <text x="560" y="244" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.55}>
            {d("coneCaption")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
