"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BMRCalculator as BMRTool } from "@tooloralabs/tools";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { BMR_SCENARIOS } from "./types";

const tool = new BMRTool();

const MIN_AGE = 18;
const MAX_AGE = 80;
const AGE_STEP = 2;

const WIDTH = 320;
const HEIGHT = 140;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export default function BMRAgeCurveDiagram() {
  const t = useTranslations("tools.bmr-calculator.education.intro.ageCurve");
  const tScenarios = useTranslations("tools.bmr-calculator.scenarios");
  const [selectedKey, setSelectedKey] = useState("average");

  const scenario = BMR_SCENARIOS.find((s) => s.key === selectedKey) ?? BMR_SCENARIOS[0];

  const points = useMemo(() => {
    const ages: { age: number; bmr: number }[] = [];
    for (let age = MIN_AGE; age <= MAX_AGE; age += AGE_STEP) {
      const output = tool.execute(
        { gender: scenario.gender, weightKg: Number(scenario.weightKg), heightCm: Number(scenario.heightCm), age, formula: "mifflinStJeor" },
        { locale: "en-US" },
      );
      ages.push({ age, bmr: output.data.mifflinStJeor ?? 0 });
    }
    return ages;
  }, [scenario]);

  const minBmr = Math.min(...points.map((p) => p.bmr));
  const maxBmr = Math.max(...points.map((p) => p.bmr));
  const bmrRange = Math.max(maxBmr - minBmr, 1);

  const xFor = (age: number) => PAD_LEFT + ((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const yFor = (bmr: number) => HEIGHT - PAD_BOTTOM - ((bmr - minBmr) / bmrRange) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.age).toFixed(1)} ${yFor(p.bmr).toFixed(1)}`).join(" ");

  const currentAge = Number(scenario.age);
  const currentPoint = points.reduce((closest, p) => (Math.abs(p.age - currentAge) < Math.abs(closest.age - currentAge) ? p : closest), points[0]);

  const digitStyle = resolveDigitStyle(String(Math.round(currentPoint.bmr)));
  const fmt = (value: number) => formatLocalizedNumber(Math.round(value), digitStyle);

  const bmrAt20 = points[0].bmr;
  const bmrAt70 = points[points.length - 1].bmr;
  const declinePercent = Math.round(((bmrAt20 - bmrAt70) / bmrAt20) * 100);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr" className="w-full">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("ariaLabel")} className="w-full">
          {[MIN_AGE, 30, 40, 50, 60, 70, MAX_AGE].map((age) => (
            <line
              key={age}
              x1={xFor(age)}
              y1={PAD_TOP}
              x2={xFor(age)}
              y2={HEIGHT - PAD_BOTTOM}
              className="stroke-current/10"
              strokeWidth={1}
            />
          ))}
          {[MIN_AGE, 30, 40, 50, 60, 70, MAX_AGE].map((age) => (
            <text key={age} x={xFor(age)} y={HEIGHT - 6} fontSize="9" textAnchor="middle" className="fill-current/50">
              {age}
            </text>
          ))}

          <path d={pathD} fill="none" strokeWidth={2.5} className="stroke-blue-500 dark:stroke-blue-400" />

          <circle cx={xFor(currentPoint.age)} cy={yFor(currentPoint.bmr)} r={5} className="fill-blue-600 dark:fill-blue-300" />
          <text
            x={xFor(currentPoint.age)}
            y={yFor(currentPoint.bmr) - 10}
            fontSize="10"
            textAnchor="middle"
            fontWeight="600"
            className="fill-blue-700 dark:fill-blue-300"
          >
            {fmt(currentPoint.bmr)}
          </text>
        </svg>
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {BMR_SCENARIOS.map((s) => (
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
        {t("verdict", { example: tScenarios(selectedKey), percent: declinePercent })}
      </p>
    </EncyclopediaLiveWidget>
  );
}
