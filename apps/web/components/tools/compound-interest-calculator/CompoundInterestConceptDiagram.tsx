"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 300;
const BASE_Y = 220;
const START_X = 90;
const END_X = 790;

const CONTRIB_END_Y = 150;
const TOTAL_END_Y = 58;

/** Contributions envelope: principal + steady monthly deposits, growing roughly linearly. */
const CONTRIB_CURVE = `C 290,208 500,190 ${END_X},${CONTRIB_END_Y}`;
const CONTRIB_CURVE_REVERSE = `C 500,190 290,208 ${START_X},${BASE_Y}`;
/** Total balance: the same envelope plus compounding, so it accelerates away from it over time. */
const TOTAL_CURVE = `C 300,200 560,120 ${END_X},${TOTAL_END_Y}`;

/**
 * Static, illustrative concept diagram — not tied to the user's live inputs (there are no real
 * numbers here at all). It exists purely to give a first-glance visual answer to "what does this
 * calculator actually do": a starting deposit plus regular contributions grow on their own (the
 * lower band), and compounding interest — interest earning interest — pulls the true balance
 * further ahead of that the longer the money stays invested (the upper band, widening over time).
 */
export default function CompoundInterestConceptDiagram() {
  const t = useTranslations("tools.compound-interest-calculator.aboveFold");
  const d = useTranslations("tools.compound-interest-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          <defs>
            <marker id="ci-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-zinc-400 dark:fill-zinc-500" />
            </marker>
          </defs>

          {/* baseline / time axis */}
          <line x1={START_X} y1={BASE_Y} x2={END_X + 30} y2={BASE_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.25} markerEnd="url(#ci-arrow)" />
          <text x={END_X + 34} y={BASE_Y + 4} fontSize={12} fill="currentColor" opacity={0.55}>
            {d("timeLabel")}
          </text>

          {/* interest band (between contributions curve and total curve) */}
          <path
            d={`M${START_X},${BASE_Y} ${TOTAL_CURVE} L${END_X},${CONTRIB_END_Y} ${CONTRIB_CURVE_REVERSE} Z`}
            className="fill-amber-400/70 dark:fill-amber-500/50"
          />
          {/* contributions + principal band (between contributions curve and baseline) */}
          <path d={`M${START_X},${BASE_Y} ${CONTRIB_CURVE} L${END_X},${BASE_Y} Z`} className="fill-blue-600/80 dark:fill-blue-400/60" />

          {/* curve outlines */}
          <path d={`M${START_X},${BASE_Y} ${CONTRIB_CURVE}`} fill="none" strokeWidth={2} strokeDasharray="5 4" className="stroke-blue-700 dark:stroke-blue-300" />
          <path d={`M${START_X},${BASE_Y} ${TOTAL_CURVE}`} fill="none" strokeWidth={2.5} className="stroke-amber-600 dark:stroke-amber-300" />

          {/* recurring contribution ticks along the baseline */}
          {[190, 300, 410, 520, 630].map((x) => (
            <line key={x} x1={x} y1={BASE_Y + 10} x2={x} y2={BASE_Y - 6} strokeWidth={2} className="stroke-blue-700/70 dark:stroke-blue-300/70" />
          ))}

          {/* starting amount marker + label */}
          <circle cx={START_X} cy={BASE_Y} r={5} className="fill-zinc-700 dark:fill-zinc-200" />
          <text x={START_X} y={BASE_Y + 34} fontSize={13} fontWeight={700} textAnchor="start" className="fill-zinc-900 dark:fill-zinc-50">
            {t("principalLabel")}
          </text>
          <text x={START_X} y={BASE_Y + 52} fontSize={11} textAnchor="start" fill="currentColor" opacity={0.6}>
            {d("startingAmountCaption")}
          </text>

          {/* contributions label */}
          <text x={410} y={BASE_Y + 34} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
            {t("contributionsLabel")}
          </text>
          <text x={410} y={BASE_Y + 52} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {d("contributionsCaption")}
          </text>

          {/* interest band marker + label with leader line — the middle of the three always-visible
              points along this diagram (starting amount, this one, future value), matching where
              the leader line meets the total curve */}
          <circle cx={505} cy={104} r={5} className="fill-amber-500 dark:fill-amber-300" />
          <line x1={560} y1={130} x2={505} y2={104} strokeWidth={1.5} className="stroke-amber-700 dark:stroke-amber-300" opacity={0.7} />
          <text x={565} y={134} fontSize={13} fontWeight={700} textAnchor="start" className="fill-amber-700 dark:fill-amber-300">
            {t("interestLabel")}
          </text>
          <text x={565} y={152} fontSize={11} textAnchor="start" fill="currentColor" opacity={0.6}>
            {d("interestCaption")}
          </text>

          {/* future value marker + label */}
          <circle cx={END_X} cy={TOTAL_END_Y} r={5} className="fill-amber-500 dark:fill-amber-300" />
          <text x={END_X - 14} y={38} fontSize={14} fontWeight={700} textAnchor="end" className="fill-zinc-900 dark:fill-zinc-50">
            {t("futureValueLabel")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
