"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { GcfLcmCalculator as GcfLcmTool } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { GCF_LCM_SCENARIOS } from "./types";

const tool = new GcfLcmTool();

type ZoneKey = "closelyRelated" | "moderatelyRelated" | "looselyRelated";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "closelyRelated", from: 0, to: 1, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "moderatelyRelated", from: 1, to: 2, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "looselyRelated", from: 2, to: 3, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  closelyRelated: "fill-green-500 dark:fill-green-400",
  moderatelyRelated: "fill-blue-500 dark:fill-blue-400",
  looselyRelated: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 3;
const TICKS = [0, 1, 2, 3];

function zoneForLogRatio(log: number): ZoneKey {
  const zone = ZONES.find((z) => log < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

function tickLabel(tick: number): string {
  return `${Math.round(10 ** tick)}×`;
}

export default function GcfLcmRatioGauge() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.intro.ratioGauge");
  const tScenarios = useTranslations("tools.gcf-lcm-calculator.scenarios");
  const tZones = useTranslations("tools.gcf-lcm-calculator.education.intro.ratioGauge.zones");
  const [selectedKey, setSelectedKey] = useState("twoNumbers");

  const ratios = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of GCF_LCM_SCENARIOS) {
      const output = tool.execute({ numbers: s.numbers.map(Number) }, { locale: "en-US" });
      if (!output.data.error && output.data.gcf > 0) map.set(s.key, output.data.lcm / output.data.gcf);
    }
    return map;
  }, []);

  const ratio = ratios.get(selectedKey) ?? 1;
  const logRatio = Math.log10(ratio);
  const zone = zoneForLogRatio(logRatio);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={logRatio}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${Math.round(ratio)}×`}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
          tickFormatter={tickLabel}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {GCF_LCM_SCENARIOS.map((s) => (
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { ratio: Math.round(ratio) })}</p>
    </EncyclopediaLiveWidget>
  );
}
