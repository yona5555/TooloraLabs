"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Same fixed example (12, 18) as GcfLcmConceptDiagram (Venn diagram) and
 * GcfLcmLadderDiagram (repeated division) so a reader can follow one pair of
 * numbers through three distinct lenses — but this one is specific to LCM:
 * marking each number's multiples on a shared number line up to 36 makes the
 * "first shared multiple" definition of LCM directly visible, which neither
 * the prime-factor Venn diagram nor the ladder method actually show.
 */
const A = 12;
const B = 18;
const MAX = 36;
const MULTIPLES_A = [12, 24, 36];
const MULTIPLES_B = [18, 36];
const LCM = 36;

const WIDTH = 360;
const AXIS_Y_A = 34;
const AXIS_Y_B = 74;
const PLOT_LEFT = 16;
const PLOT_RIGHT = WIDTH - 16;

function xFor(value: number) {
  return PLOT_LEFT + (value / MAX) * (PLOT_RIGHT - PLOT_LEFT);
}

export default function GcfLcmMultiplesNumberLineDiagram() {
  const d = useTranslations("tools.gcf-lcm-calculator.multiplesDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro", { a: A, b: B })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} 100`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-md text-current">
          <line x1={PLOT_LEFT} y1={AXIS_Y_A} x2={PLOT_RIGHT} y2={AXIS_Y_A} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
          <line x1={PLOT_LEFT} y1={AXIS_Y_B} x2={PLOT_RIGHT} y2={AXIS_Y_B} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          {MULTIPLES_A.map((m) => (
            <g key={`a-${m}`}>
              <circle cx={xFor(m)} cy={AXIS_Y_A} r={m === LCM ? 7 : 5} className={m === LCM ? "fill-emerald-500" : "fill-blue-500"} />
              <text x={xFor(m)} y={AXIS_Y_A - 12} textAnchor="middle" fontSize={11} fill="currentColor">
                {m}
              </text>
            </g>
          ))}
          {MULTIPLES_B.map((m) => (
            <g key={`b-${m}`}>
              <circle cx={xFor(m)} cy={AXIS_Y_B} r={m === LCM ? 7 : 5} className={m === LCM ? "fill-emerald-500" : "fill-amber-500"} />
              <text x={xFor(m)} y={AXIS_Y_B + 20} textAnchor="middle" fontSize={11} fill="currentColor">
                {m}
              </text>
            </g>
          ))}

          <line x1={xFor(LCM)} y1={AXIS_Y_A - 4} x2={xFor(LCM)} y2={AXIS_Y_B + 4} className="stroke-emerald-500" strokeWidth={2} strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {d("rowA", { a: A })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {d("rowB", { b: B })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {d("rowLcm")}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{d("caption", { lcm: LCM })}</p>
    </SectionCard>
  );
}
