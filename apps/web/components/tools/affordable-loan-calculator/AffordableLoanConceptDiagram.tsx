"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const BOX_W = 210;
const BOX_H = 66;
const ROW1_Y = 40;
const ROW2_Y = 180;
const COL_A_X = 30;
const COL_B_X = 335;
const COL_C_X = 640;
const VIEW_W = 880;
const VIEW_H = 300;

type FlowRowProps = {
  y: number;
  fromLabel: string;
  toLabel: string;
  rateLabel: string;
  termLabel: string;
  accent: "blue" | "amber";
};

function FlowRow({ y, fromLabel, toLabel, rateLabel, termLabel, accent }: FlowRowProps) {
  const midY = y + BOX_H / 2;
  const accentStroke = accent === "blue" ? "stroke-blue-600 dark:stroke-blue-400" : "stroke-amber-600 dark:stroke-amber-400";
  const accentFill = accent === "blue" ? "fill-blue-600 dark:fill-blue-400" : "fill-amber-500 dark:fill-amber-400";
  const accentText = accent === "blue" ? "fill-blue-700 dark:fill-blue-300" : "fill-amber-700 dark:fill-amber-300";

  return (
    <g>
      <rect x={COL_A_X} y={y} width={BOX_W} height={BOX_H} rx={10} className="fill-zinc-50 stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={1.5} />
      <foreignObject x={COL_A_X + 10} y={y} width={BOX_W - 20} height={BOX_H}>
        <div className="flex h-full items-center justify-center text-center text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">{fromLabel}</div>
      </foreignObject>

      <line x1={COL_A_X + BOX_W + 8} y1={midY} x2={COL_B_X - 8} y2={midY} strokeWidth={2} className={accentStroke} markerEnd="url(#afl-arrow)" />

      <circle cx={COL_B_X + BOX_W / 2} cy={midY} r={34} className={`${accentFill} opacity-90`} />
      <text x={COL_B_X + BOX_W / 2} y={midY - 4} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-white">
        {rateLabel}
      </text>
      <text x={COL_B_X + BOX_W / 2} y={midY + 13} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-white">
        {termLabel}
      </text>

      <line x1={COL_B_X + BOX_W / 2 + 34 + 8} y1={midY} x2={COL_C_X - 8} y2={midY} strokeWidth={2} className={accentStroke} markerEnd="url(#afl-arrow)" />

      <rect x={COL_C_X} y={y} width={BOX_W} height={BOX_H} rx={10} className="fill-zinc-50 stroke-zinc-300 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={1.5} />
      <foreignObject x={COL_C_X + 10} y={y} width={BOX_W - 20} height={BOX_H}>
        <div className={`flex h-full items-center justify-center text-center text-[13px] font-bold ${accentText}`}>{toLabel}</div>
      </foreignObject>
    </g>
  );
}

/**
 * Static, illustrative concept diagram showing the tool's two tabs as the exact same mechanism
 * (rate + term acting on a loan) run in opposite directions — not tied to the user's live inputs.
 */
export default function AffordableLoanConceptDiagram() {
  const t = useTranslations("tools.affordable-loan-calculator");
  const d = useTranslations("tools.affordable-loan-calculator.aboveFold.conceptDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="img" aria-label={d("ariaLabel")} className="mx-auto block w-full max-w-3xl text-current">
          <defs>
            <marker id="afl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-zinc-400 dark:fill-zinc-500" />
            </marker>
          </defs>

          <FlowRow y={ROW1_Y} fromLabel={t("form.monthlyPaymentLabel")} toLabel={t("aboveFold.maxLoanAmountLabel")} rateLabel={d("rateLabel")} termLabel={d("termLabel")} accent="blue" />
          <text x={30} y={ROW1_Y + BOX_H + 22} fontSize={12} fontWeight={600} fill="currentColor" opacity={0.6}>
            {d("row1Caption")}
          </text>

          <FlowRow y={ROW2_Y} fromLabel={t("form.loanAmountLabel")} toLabel={t("aboveFold.requiredPaymentLabel")} rateLabel={d("rateLabel")} termLabel={d("termLabel")} accent="amber" />
          <text x={30} y={ROW2_Y + BOX_H + 22} fontSize={12} fontWeight={600} fill="currentColor" opacity={0.6}>
            {d("row2Caption")}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
