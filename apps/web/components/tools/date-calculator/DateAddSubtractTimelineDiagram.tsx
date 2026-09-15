"use client";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { DateCalculator as DateTool } from "@tooloralabs/tools";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { DATE_SCENARIOS } from "./types";

const tool = new DateTool();

const ADD_SUBTRACT_SCENARIOS = DATE_SCENARIOS.filter((s) => s.mode === "addSubtract");

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const WIDTH = 340;
const HEIGHT = 60;
const MARGIN = 55;
const ARROW_INSET = 15;

export default function DateAddSubtractTimelineDiagram() {
  const t = useTranslations("tools.date-calculator.addSubtractTimeline");
  const tScenarios = useTranslations("tools.date-calculator.scenarios");
  const tUnits = useTranslations("tools.date-calculator.form.units");
  const tOperations = useTranslations("tools.date-calculator.form.operations");
  const locale = useLocale();
  const [selectedKey, setSelectedKey] = useState(ADD_SUBTRACT_SCENARIOS[0]?.key ?? "add90Days");

  const scenario = ADD_SUBTRACT_SCENARIOS.find((s) => s.key === selectedKey) ?? ADD_SUBTRACT_SCENARIOS[0];

  const { startISO, resultISO } = useMemo(() => {
    const startDate = isoDaysAgo(scenario.startDaysAgo);
    const output = tool.execute(
      { mode: "addSubtract", startDate, amount: Number(scenario.amount), unit: scenario.unit, operation: scenario.operation },
      { locale: "en-US" },
    );
    return { startISO: startDate, resultISO: output.data.resultDateISO ?? startDate };
  }, [scenario]);

  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }), [locale]);
  const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00`));

  const isForward = scenario.operation === "add";

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr" className="w-full">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("ariaLabel")} className="w-full">
          <line x1={MARGIN} y1={HEIGHT / 2} x2={WIDTH - MARGIN} y2={HEIGHT / 2} strokeWidth={3} className="stroke-current/15" />

          <circle cx={MARGIN} cy={HEIGHT / 2} r={7} className="fill-zinc-400 dark:fill-zinc-500" />
          <text x={MARGIN} y={HEIGHT / 2 - 14} fontSize="10" textAnchor="middle" className="fill-current/70">
            {t("startLabel")}
          </text>
          <text x={MARGIN} y={HEIGHT / 2 + 22} fontSize="10" textAnchor="middle" fontWeight="600" className="fill-current">
            {formatDate(startISO)}
          </text>

          <path
            d={
              isForward
                ? `M ${MARGIN + ARROW_INSET} ${HEIGHT / 2} L ${WIDTH - MARGIN - ARROW_INSET} ${HEIGHT / 2}`
                : `M ${WIDTH - MARGIN - ARROW_INSET} ${HEIGHT / 2} L ${MARGIN + ARROW_INSET} ${HEIGHT / 2}`
            }
            markerEnd="url(#arrowhead)"
            strokeWidth={2}
            className={isForward ? "stroke-blue-500 dark:stroke-blue-400" : "stroke-amber-500 dark:stroke-amber-400"}
          />
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" className={isForward ? "fill-blue-500 dark:fill-blue-400" : "fill-amber-500 dark:fill-amber-400"} />
            </marker>
          </defs>

          <circle cx={WIDTH - MARGIN} cy={HEIGHT / 2} r={7} className={isForward ? "fill-blue-600 dark:fill-blue-300" : "fill-amber-600 dark:fill-amber-300"} />
          <text x={WIDTH - MARGIN} y={HEIGHT / 2 - 14} fontSize="10" textAnchor="middle" className="fill-current/70">
            {t("resultLabel")}
          </text>
          <text x={WIDTH - MARGIN} y={HEIGHT / 2 + 22} fontSize="10" textAnchor="middle" fontWeight="600" className="fill-current">
            {formatDate(resultISO)}
          </text>
        </svg>
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {ADD_SUBTRACT_SCENARIOS.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === s.key}
            onClick={() => setSelectedKey(s.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === s.key
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tScenarios(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">
        {t("verdict", {
          amount: scenario.amount,
          unit: tUnits(scenario.unit),
          operation: tOperations(scenario.operation),
        })}
      </p>
    </EncyclopediaLiveWidget>
  );
}
