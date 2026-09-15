"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { calculateIdealWeight } from "@tooloralabs/tools";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { resolveDigitStyle } from "@/lib/digit-style";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { IDEAL_WEIGHT_SCENARIOS } from "./types";

const MIN_HEIGHT = 145;
const MAX_HEIGHT = 200;
const HEIGHT_STEP = 5;

const WIDTH = 320;
const HEIGHT = 140;
const PAD_LEFT = 32;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

export default function IdealWeightHeightCurveDiagram() {
  const t = useTranslations("tools.ideal-weight-calculator.heightCurve");
  const tScenarios = useTranslations("tools.ideal-weight-calculator.scenarios");
  const tForm = useTranslations("tools.ideal-weight-calculator.form");
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male");

  const points = useMemo(() => {
    const rows: { height: number; kg: number }[] = [];
    for (let height = MIN_HEIGHT; height <= MAX_HEIGHT; height += HEIGHT_STEP) {
      const result = calculateIdealWeight(selectedGender, height);
      rows.push({ height, kg: result.average });
    }
    return rows;
  }, [selectedGender]);

  const minKg = Math.min(...points.map((p) => p.kg));
  const maxKg = Math.max(...points.map((p) => p.kg));
  const kgRange = Math.max(maxKg - minKg, 1);

  const xFor = (h: number) => PAD_LEFT + ((h - MIN_HEIGHT) / (MAX_HEIGHT - MIN_HEIGHT)) * (WIDTH - PAD_LEFT - PAD_RIGHT);
  const yFor = (kg: number) => HEIGHT - PAD_BOTTOM - ((kg - minKg) / kgRange) * (HEIGHT - PAD_TOP - PAD_BOTTOM);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.height).toFixed(1)} ${yFor(p.kg).toFixed(1)}`).join(" ");

  const scenario = IDEAL_WEIGHT_SCENARIOS.find((s) => s.gender === selectedGender) ?? IDEAL_WEIGHT_SCENARIOS[0];
  const markedHeight = Number(scenario.heightCm);
  const markedKg = calculateIdealWeight(selectedGender, markedHeight).average;

  const digitStyle = resolveDigitStyle(String(Math.round(markedKg)));
  const fmt = (value: number) => formatLocalizedNumber(Math.round(value), digitStyle);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr" className="w-full">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={t("ariaLabel")} className="w-full">
          {[145, 160, 175, 190, 200].map((h) => (
            <line key={h} x1={xFor(h)} y1={PAD_TOP} x2={xFor(h)} y2={HEIGHT - PAD_BOTTOM} className="stroke-current/10" strokeWidth={1} />
          ))}
          {[145, 160, 175, 190, 200].map((h) => (
            <text key={h} x={xFor(h)} y={HEIGHT - 6} fontSize="9" textAnchor="middle" className="fill-current/50">
              {h}
            </text>
          ))}

          <path d={pathD} fill="none" strokeWidth={2.5} className={selectedGender === "male" ? "stroke-blue-500 dark:stroke-blue-400" : "stroke-pink-500 dark:stroke-pink-400"} />

          <circle
            cx={xFor(markedHeight)}
            cy={yFor(markedKg)}
            r={5}
            className={selectedGender === "male" ? "fill-blue-600 dark:fill-blue-300" : "fill-pink-600 dark:fill-pink-300"}
          />
          <text
            x={xFor(markedHeight)}
            y={yFor(markedKg) - 10}
            fontSize="10"
            textAnchor="middle"
            fontWeight="600"
            className={selectedGender === "male" ? "fill-blue-700 dark:fill-blue-300" : "fill-pink-700 dark:fill-pink-300"}
          >
            {fmt(markedKg)}
          </text>
        </svg>
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {(["male", "female"] as const).map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={selectedGender === g}
            onClick={() => setSelectedGender(g)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedGender === g
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tForm(g === "male" ? "genderMale" : "genderFemale")}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">
        {t("verdict", { example: tScenarios(scenario.key), height: markedHeight, kg: fmt(markedKg) })}
      </p>
    </EncyclopediaLiveWidget>
  );
}
