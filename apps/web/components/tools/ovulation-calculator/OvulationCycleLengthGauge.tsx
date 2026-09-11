"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { OVULATION_SCENARIOS } from "./types";

type LengthKey = "short" | "typical" | "long";

const ZONES: { key: LengthKey; from: number; to: number; colorClass: string }[] = [
  { key: "short", from: 21, to: 26, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "typical", from: 26, to: 30, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "long", from: 30, to: 35, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
];

const CAPTION_COLOR: Record<LengthKey, string> = {
  short: "fill-amber-500 dark:fill-amber-400",
  typical: "fill-green-500 dark:fill-green-400",
  long: "fill-blue-500 dark:fill-blue-400",
};

const DOMAIN_MIN = 21;
const DOMAIN_MAX = 35;
const TICKS = [21, 26, 30, 35];

function lengthKeyForDays(days: number): LengthKey {
  const zone = ZONES.find((z) => days < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

const CLASSIFICATION_BY_SCENARIO: Record<string, LengthKey> = {
  shortCycle: "short",
  typicalCycle: "typical",
  longCycle: "long",
};

export default function OvulationCycleLengthGauge() {
  const t = useTranslations("tools.ovulation-calculator.education.intro.cycleGauge");
  const tScenarios = useTranslations("tools.ovulation-calculator.scenarios");
  const tClassifications = useTranslations("tools.ovulation-calculator.education.intro.cycleGauge.classifications");
  const [selectedKey, setSelectedKey] = useState("typicalCycle");

  const selected = useMemo(() => OVULATION_SCENARIOS.find((s) => s.key === selectedKey) ?? OVULATION_SCENARIOS[0], [selectedKey]);
  const cycleDays = Number(selected.cycleLengthDays);
  const lengthKey = lengthKeyForDays(cycleDays);
  const classification = tClassifications(CLASSIFICATION_BY_SCENARIO[selectedKey] ?? lengthKey);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={cycleDays}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={t("daysValue", { days: cycleDays })}
          caption={classification}
          captionColorClass={CAPTION_COLOR[lengthKey]}
          ticks={TICKS}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {OVULATION_SCENARIOS.map((s) => (
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

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tScenarios(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { days: cycleDays })}</p>
    </EncyclopediaLiveWidget>
  );
}
