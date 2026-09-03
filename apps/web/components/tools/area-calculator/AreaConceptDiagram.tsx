"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 260;

/**
 * Static, illustrative concept diagram — three representative shapes with fixed
 * example dimensions (not the user's live inputs), each showing the measurement
 * lines a closed-form area formula actually consumes: a rectangle's two
 * perpendicular sides, a circle's single radius, and a triangle's base plus its
 * perpendicular height (dashed, since it's rarely one of the triangle's own edges).
 */
export default function AreaConceptDiagram() {
  const t = useTranslations("tools.area-calculator.aboveFold");
  const d = useTranslations("tools.area-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          <defs>
            <marker id="area-tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
              <circle cx="5" cy="5" r="2.5" className="fill-zinc-500 dark:fill-zinc-400" />
            </marker>
          </defs>

          {/* Rectangle */}
          <g transform="translate(60,60)">
            <rect x="0" y="0" width="150" height="100" className="fill-blue-600/25 stroke-blue-700 dark:fill-blue-400/20 dark:stroke-blue-300" strokeWidth={2.5} />
            <line x1="0" y1="-16" x2="150" y2="-16" stroke="currentColor" strokeWidth={1.5} opacity={0.5} markerStart="url(#area-tick)" markerEnd="url(#area-tick)" />
            <text x="75" y="-24" fontSize={13} fontWeight={700} textAnchor="middle" fill="currentColor">
              {t("widthLabel")} (w)
            </text>
            <line x1="-16" y1="0" x2="-16" y2="100" stroke="currentColor" strokeWidth={1.5} opacity={0.5} markerStart="url(#area-tick)" markerEnd="url(#area-tick)" />
            <text x="-24" y="50" fontSize={13} fontWeight={700} textAnchor="middle" fill="currentColor" transform="rotate(-90 -24 50)">
              {t("heightLabel")} (h)
            </text>
            <text x="75" y="132" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
              A = w × h
            </text>
            <text x="75" y="150" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.55}>
              {d("rectangleCaption")}
            </text>
          </g>

          {/* Circle */}
          <g transform="translate(410,60)">
            <circle cx="60" cy="50" r="50" className="fill-amber-500/20 stroke-amber-600 dark:fill-amber-400/20 dark:stroke-amber-300" strokeWidth={2.5} />
            <line x1="60" y1="50" x2="110" y2="50" stroke="currentColor" strokeWidth={2} className="stroke-amber-700 dark:stroke-amber-300" />
            <circle cx="60" cy="50" r={3} className="fill-amber-700 dark:fill-amber-300" />
            <text x="85" y="42" fontSize={13} fontWeight={700} textAnchor="middle" fill="currentColor">
              r
            </text>
            <text x="60" y="132" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
              A = π × r²
            </text>
            <text x="60" y="150" fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.55}>
              {d("circleCaption")}
            </text>
          </g>

          {/* Triangle */}
          <g transform="translate(630,60)">
            <polygon points="0,100 170,100 55,0" className="fill-emerald-500/20 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-300" strokeWidth={2.5} />
            <line x1="55" y1="0" x2="55" y2="100" strokeDasharray="4 4" strokeWidth={1.5} className="stroke-emerald-700 dark:stroke-emerald-300" opacity={0.8} />
            <text x="66" y="55" fontSize={13} fontWeight={700} fill="currentColor">
              h
            </text>
            <line x1="0" y1="116" x2="170" y2="116" stroke="currentColor" strokeWidth={1.5} opacity={0.5} markerStart="url(#area-tick)" markerEnd="url(#area-tick)" />
            <text x="85" y="134" fontSize={13} fontWeight={700} textAnchor="middle" fill="currentColor">
              {t("baseLabel")} (b)
            </text>
            <text x="85" y="-12" fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75} fontFamily="monospace">
              A = ½ × b × h
            </text>
          </g>
        </svg>
      </div>
    </SectionCard>
  );
}
