"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const VIEW_W = 880;
const VIEW_H = 300;
const TOP_Y = 80;
const BASE_Y = 240;
const BAR_H = BASE_Y - TOP_Y;
const BAR_W = 90;
const BAR_XS = [150, 350, 550, 750];
/** Illustrative principal share of the payment at four evenly spaced points across the loan's life — a fixed-rate loan's payment stays constant, but this split shifts steadily from mostly interest toward mostly principal. */
const PRINCIPAL_FRACTIONS = [0.25, 0.45, 0.65, 0.85];

/**
 * Static, illustrative concept diagram — fixed example fractions, not the user's live schedule.
 * Answers "why does my payment split change over time": the payment itself stays the same, but
 * each period's interest charge shrinks as the balance it's charged on shrinks, so a growing share
 * of the same payment goes toward principal instead.
 */
export default function LoanConceptDiagram() {
  const d = useTranslations("tools.loan-calculator.aboveFold.conceptDiagram");

  const splitYs = PRINCIPAL_FRACTIONS.map((frac) => TOP_Y + (1 - frac) * BAR_H);

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          <defs>
            <marker id="loan-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-zinc-400 dark:fill-zinc-500" />
            </marker>
          </defs>

          <line x1={110} y1={BASE_Y} x2={790} y2={BASE_Y} stroke="currentColor" strokeWidth={1.5} opacity={0.25} markerEnd="url(#loan-arrow)" />
          <text x={794} y={BASE_Y + 4} fontSize={12} fill="currentColor" opacity={0.55}>
            {d("timeLabel")}
          </text>

          {BAR_XS.map((x, i) => (
            <g key={x}>
              <rect x={x} y={TOP_Y} width={BAR_W} height={splitYs[i] - TOP_Y} rx={3} className="fill-amber-400 dark:fill-amber-500" />
              <rect x={x} y={splitYs[i]} width={BAR_W} height={BASE_Y - splitYs[i]} rx={3} className="fill-blue-600 dark:fill-blue-400" />
            </g>
          ))}

          {/* crossover line tracing the split point across payments */}
          <polyline
            points={BAR_XS.map((x, i) => `${x + BAR_W / 2},${splitYs[i]}`).join(" ")}
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 4"
            className="stroke-zinc-500 dark:stroke-zinc-300"
          />
          {BAR_XS.map((x, i) => (
            <circle key={x} cx={x + BAR_W / 2} cy={splitYs[i]} r={3.5} className="fill-zinc-700 dark:fill-zinc-100" />
          ))}

          {/* legend */}
          <rect x={150} y={44} width={12} height={12} rx={2} className="fill-amber-400 dark:fill-amber-500" />
          <text x={168} y={54} fontSize={13} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
            {d("interestLabel")}
          </text>
          <rect x={280} y={44} width={12} height={12} rx={2} className="fill-blue-600 dark:fill-blue-400" />
          <text x={298} y={54} fontSize={13} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {d("principalLabel")}
          </text>

          {/* first/last period call-outs */}
          <text x={BAR_XS[0] + BAR_W / 2} y={BASE_Y + 26} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50">
            {d("earlyLabel")}
          </text>
          <text x={BAR_XS[0] + BAR_W / 2} y={BASE_Y + 44} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {d("mostlyInterestCaption")}
          </text>
          <text x={BAR_XS[3] + BAR_W / 2} y={BASE_Y + 26} fontSize={12} fontWeight={700} textAnchor="middle" className="fill-zinc-900 dark:fill-zinc-50">
            {d("lateLabel")}
          </text>
          <text x={BAR_XS[3] + BAR_W / 2} y={BASE_Y + 44} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {d("mostlyPrincipalCaption")}
          </text>

          {/* same payment amount annotation */}
          <line x1={BAR_XS[0] - 14} y1={TOP_Y - 14} x2={BAR_XS[3] + BAR_W + 14} y2={TOP_Y - 14} strokeWidth={1} className="stroke-zinc-400 dark:stroke-zinc-500" opacity={0.6} />
          <text x={(BAR_XS[0] + BAR_XS[3] + BAR_W) / 2} y={TOP_Y - 22} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.6}>
            {d("samePaymentCaption")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
