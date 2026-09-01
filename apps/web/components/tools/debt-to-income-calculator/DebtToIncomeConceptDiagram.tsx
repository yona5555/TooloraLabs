"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 280;
const BAR_X = 60;
const BAR_Y = 140;
const BAR_W = 760;
const BAR_H = 56;

/** Illustrative example split of gross income across debt categories — fixed proportions, not the user's live figures. */
const SEGMENTS = [
  { key: "housing", frac: 0.25, colorClass: "fill-blue-600 dark:fill-blue-400" },
  { key: "car", frac: 0.05, colorClass: "fill-teal-500 dark:fill-teal-400" },
  { key: "student", frac: 0.04, colorClass: "fill-violet-500 dark:fill-violet-400" },
  { key: "creditCard", frac: 0.03, colorClass: "fill-rose-500 dark:fill-rose-400" },
  { key: "other", frac: 0.03, colorClass: "fill-zinc-400 dark:fill-zinc-500" },
] as const;
const DEBT_FRAC = SEGMENTS.reduce((sum, s) => sum + s.frac, 0);
const debtW = BAR_W * DEBT_FRAC;
const housingW = BAR_W * SEGMENTS[0].frac;

/**
 * Static, illustrative concept diagram — fixed example proportions, not the user's live income and
 * debt figures. Answers "what does DTI actually measure": every recurring debt payment, housing
 * included, summed and divided by gross income.
 */
export default function DebtToIncomeConceptDiagram() {
  const d = useTranslations("tools.debt-to-income-calculator.aboveFold.conceptDiagram");

  const { boxes: segmentBoxes } = SEGMENTS.reduce<{ boxes: ((typeof SEGMENTS)[number] & { x: number; w: number })[]; cursor: number }>(
    (acc, s) => {
      const w = BAR_W * s.frac;
      return { boxes: [...acc.boxes, { ...s, x: acc.cursor, w }], cursor: acc.cursor + w };
    },
    { boxes: [], cursor: BAR_X }
  );

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          <text x={BAR_X + BAR_W / 2} y={30} fontSize={14} fontWeight={700} textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50">
            {d("incomeLabel")}
          </text>
          <line x1={BAR_X} y1={40} x2={BAR_X + BAR_W} y2={40} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" opacity={0.5} />

          {/* bracket over every debt segment */}
          <path d={`M${BAR_X},64 L${BAR_X},56 L${BAR_X + debtW},56 L${BAR_X + debtW},64`} fill="none" strokeWidth={1.5} className="stroke-orange-500 dark:stroke-orange-400" />
          <text x={BAR_X + debtW / 2} y={52} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-orange-600 dark:fill-orange-400">
            {d("totalDebtLabel")}
          </text>

          {/* segmented bar */}
          {segmentBoxes.map((s) => (
            <rect key={s.key} x={s.x} y={BAR_Y} width={s.w} height={BAR_H} className={s.colorClass} />
          ))}
          <rect x={BAR_X + debtW} y={BAR_Y} width={BAR_W - debtW} height={BAR_H} className="fill-zinc-200 dark:fill-zinc-700" />
          {segmentBoxes.map((s) => (
            <line key={`div-${s.key}`} x1={s.x} y1={BAR_Y} x2={s.x} y2={BAR_Y + BAR_H} strokeWidth={1} className="stroke-white dark:stroke-zinc-900" />
          ))}
          <line x1={BAR_X + debtW} y1={BAR_Y} x2={BAR_X + debtW} y2={BAR_Y + BAR_H} strokeWidth={1.5} className="stroke-white dark:stroke-zinc-900" />
          <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />

          <text x={BAR_X + housingW / 2} y={BAR_Y + BAR_H / 2 + 5} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-white">
            {d("housingLabel")}
          </text>
          <text x={BAR_X + debtW + (BAR_W - debtW) / 2} y={BAR_Y + BAR_H / 2 + 5} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-200">
            {d("remainingLabel")}
          </text>

          {/* legend for the narrow debt segments */}
          <g>
            {(["car", "student", "creditCard", "other"] as const).map((key, i) => {
              const seg = SEGMENTS.find((s) => s.key === key)!;
              const x = BAR_X + i * 190;
              return (
                <g key={key}>
                  <rect x={x} y={BAR_Y + BAR_H + 20} width={11} height={11} rx={2} className={seg.colorClass} />
                  <text x={x + 17} y={BAR_Y + BAR_H + 29} fontSize={11} fill="currentColor" opacity={0.75}>
                    {d(`legend.${key}`)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ratio formula */}
          <text x={BAR_X} y={BAR_Y + BAR_H + 60} fontSize={13} fontWeight={600} fill="currentColor" opacity={0.7}>
            {d("formulaLabel")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
