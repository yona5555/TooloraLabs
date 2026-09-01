"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 260;
const BAR_X = 60;
const BAR_Y = 130;
const BAR_W = 760;
const BAR_H = 56;
const HOUSING_FRAC = 0.28;
const DEBT_FRAC = 0.36;

const housingW = BAR_W * HOUSING_FRAC;
const debtW = BAR_W * DEBT_FRAC;

/**
 * Static, illustrative concept diagram for the standard 28/36 affordability rule — fixed example
 * proportions, not the user's live income/debt split. Answers "what actually caps my home price":
 * housing costs alone capped at 28% of income, and housing plus every other debt capped at 36%.
 */
export default function HouseAffordabilityConceptDiagram() {
  const d = useTranslations("tools.house-affordability-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          {/* income label above the bar */}
          <text x={BAR_X + BAR_W / 2} y={30} fontSize={14} fontWeight={700} textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50">
            {d("incomeLabel")}
          </text>
          <line x1={BAR_X} y1={40} x2={BAR_X + BAR_W} y2={40} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" opacity={0.5} />
          <line x1={BAR_X} y1={36} x2={BAR_X} y2={44} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />
          <line x1={BAR_X + BAR_W} y1={36} x2={BAR_X + BAR_W} y2={44} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" />

          {/* 36% back-end bracket, spans housing + other debt */}
          <path
            d={`M${BAR_X},60 L${BAR_X},52 L${BAR_X + debtW},52 L${BAR_X + debtW},60`}
            fill="none"
            strokeWidth={1.5}
            className="stroke-orange-500 dark:stroke-orange-400"
          />
          <text x={BAR_X + debtW / 2} y={48} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-orange-600 dark:fill-orange-400">
            {d("backEndCapLabel")}
          </text>

          {/* 28% front-end bracket, housing only */}
          <path d={`M${BAR_X},96 L${BAR_X},88 L${BAR_X + housingW},88 L${BAR_X + housingW},96`} fill="none" strokeWidth={1.5} className="stroke-blue-600 dark:stroke-blue-400" />
          <text x={BAR_X + housingW / 2} y={84} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
            {d("frontEndCapLabel")}
          </text>

          {/* the income bar itself, segmented */}
          <rect x={BAR_X} y={BAR_Y} width={housingW} height={BAR_H} className="fill-blue-600 dark:fill-blue-400" />
          <rect x={BAR_X + housingW} y={BAR_Y} width={debtW - housingW} height={BAR_H} className="fill-orange-400 dark:fill-orange-500" />
          <rect x={BAR_X + debtW} y={BAR_Y} width={BAR_W - debtW} height={BAR_H} className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={BAR_H} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
          <line x1={BAR_X + housingW} y1={BAR_Y} x2={BAR_X + housingW} y2={BAR_Y + BAR_H} strokeWidth={1.5} className="stroke-white dark:stroke-zinc-900" />
          <line x1={BAR_X + debtW} y1={BAR_Y} x2={BAR_X + debtW} y2={BAR_Y + BAR_H} strokeWidth={1.5} className="stroke-white dark:stroke-zinc-900" />

          {/* segment labels */}
          <text x={BAR_X + housingW / 2} y={BAR_Y + BAR_H / 2 + 5} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-white">
            {d("housingLabel")}
          </text>
          <text x={BAR_X + housingW + (debtW - housingW) / 2} y={BAR_Y + BAR_H / 2 + 5} fontSize={11} fontWeight={700} textAnchor="middle" className="fill-white">
            {d("otherDebtLabel")}
          </text>
          <text x={BAR_X + debtW + (BAR_W - debtW) / 2} y={BAR_Y + BAR_H / 2 + 5} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-zinc-700 dark:fill-zinc-200">
            {d("remainingLabel")}
          </text>

          {/* bottom captions */}
          <text x={BAR_X + housingW / 2} y={BAR_Y + BAR_H + 26} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {d("housingCaption")}
          </text>
          <text x={BAR_X + debtW + (BAR_W - debtW) / 2} y={BAR_Y + BAR_H + 26} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {d("remainingCaption")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
