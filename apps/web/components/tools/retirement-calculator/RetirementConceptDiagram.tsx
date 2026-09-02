"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 300;
const BASE_Y = 240;
const START_X = 110;
const END_X = 780;
const CURVE = `C 320,225 560,150 ${END_X},60`;

/**
 * Static, illustrative concept diagram framed around the age timeline specifically (not just
 * "time" in the abstract, which is Compound Interest's own diagram) — not tied to the user's live
 * age/contribution inputs. Answers "what does this calculator actually project": a starting
 * balance plus regular contributions compound from today's age up to retirement age, accelerating
 * as the balance itself grows.
 */
export default function RetirementConceptDiagram() {
  const d = useTranslations("tools.retirement-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          <defs>
            <marker id="ret-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-zinc-400 dark:fill-zinc-500" />
            </marker>
          </defs>

          {/* age timeline */}
          <line x1={START_X} y1={BASE_Y} x2={830} y2={BASE_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.25} markerEnd="url(#ret-arrow)" />
          <text x={834} y={BASE_Y + 4} fontSize={12} fill="currentColor" opacity={0.55}>
            {d("ageAxisLabel")}
          </text>
          <text x={START_X} y={BASE_Y + 26} fontSize={12} fontWeight={600} fill="currentColor" opacity={0.7}>
            {d("todayLabel")}
          </text>
          <text x={END_X} y={BASE_Y + 26} fontSize={12} fontWeight={600} textAnchor="end" fill="currentColor" opacity={0.7}>
            {d("retirementDayLabel")}
          </text>

          {/* retirement age marker */}
          <line x1={END_X} y1={BASE_Y} x2={END_X} y2={60} strokeWidth={1.5} strokeDasharray="4 4" className="stroke-zinc-400 dark:stroke-zinc-500" />

          {/* growth curve fill + outline */}
          <path d={`M${START_X},${BASE_Y} ${CURVE} L${END_X},${BASE_Y} Z`} className="fill-blue-600/25 dark:fill-blue-400/20" />
          <path d={`M${START_X},${BASE_Y} ${CURVE}`} fill="none" strokeWidth={3} className="stroke-blue-600 dark:stroke-blue-400" />

          {/* recurring contribution ticks along the early curve */}
          {[190, 270, 350].map((x) => (
            <line key={x} x1={x} y1={BASE_Y - 4} x2={x} y2={BASE_Y - 24} strokeWidth={2} className="stroke-blue-700/60 dark:stroke-blue-300/60" />
          ))}
          <text x={270} y={BASE_Y - 34} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
            {d("contributionsLabel")}
          </text>

          {/* starting savings marker */}
          <circle cx={START_X} cy={BASE_Y} r={5} className="fill-zinc-700 dark:fill-zinc-200" />
          <text x={START_X} y={64} fontSize={13} fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
            {d("startingSavingsLabel")}
          </text>

          {/* compounding marker + label over the steep part of the curve — the middle of the three
              always-visible points along this diagram (starting savings, this one, retirement goal) */}
          <circle cx={470} cy={140} r={5} className="fill-amber-500 dark:fill-amber-300" />
          <line x1={470} y1={140} x2={560} y2={100} strokeWidth={1.5} className="stroke-amber-700 dark:stroke-amber-300" opacity={0.7} />
          <text x={565} y={98} fontSize={13} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
            {d("compoundingLabel")}
          </text>

          {/* retirement goal marker */}
          <circle cx={END_X} cy={60} r={6} className="fill-amber-500 dark:fill-amber-300" />
          <text x={END_X} y={42} fontSize={14} fontWeight={700} textAnchor="end" className="fill-zinc-900 dark:fill-zinc-50">
            {d("goalLabel")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
