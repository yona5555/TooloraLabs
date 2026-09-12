"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { StandardDeviationCalculator as StdDevTool } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { STANDARD_DEVIATION_SCENARIOS, parseDataSet } from "./types";

const tool = new StdDevTool();

type ZoneKey = "low" | "moderate" | "high";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "low", from: 0, to: 10, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "moderate", from: 10, to: 30, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "high", from: 30, to: 60, colorClass: "stroke-red-500 dark:stroke-red-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  low: "fill-green-500 dark:fill-green-400",
  moderate: "fill-amber-500 dark:fill-amber-400",
  high: "fill-red-500 dark:fill-red-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 60;
const TICKS = [0, 10, 30, 60];

function zoneForCv(cv: number): ZoneKey {
  const zone = ZONES.find((z) => cv < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function CoefficientOfVariationGauge() {
  const t = useTranslations("tools.standard-deviation-calculator.education.intro.cvGauge");
  const tScenarios = useTranslations("tools.standard-deviation-calculator.scenarios");
  const tZones = useTranslations("tools.standard-deviation-calculator.education.intro.cvGauge.zones");
  const [selectedKey, setSelectedKey] = useState(STANDARD_DEVIATION_SCENARIOS[0].key);

  const cvByScenario = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of STANDARD_DEVIATION_SCENARIOS) {
      const values = parseDataSet(s.rawData);
      const output = tool.execute({ values }, { locale: "en-US" });
      if (!output.data.error && output.data.mean !== 0) {
        map.set(s.key, Math.abs(output.data.populationStdDev / output.data.mean) * 100);
      }
    }
    return map;
  }, []);

  const cv = cvByScenario.get(selectedKey) ?? 0;
  const zone = zoneForCv(cv);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={cv}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${cv.toFixed(1)}%`}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {STANDARD_DEVIATION_SCENARIOS.map((s) => (
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { cv: cv.toFixed(1) })}</p>
    </EncyclopediaLiveWidget>
  );
}
