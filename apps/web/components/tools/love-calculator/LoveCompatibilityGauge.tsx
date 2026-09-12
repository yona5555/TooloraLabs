"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { LoveCalculator as LoveTool } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

const tool = new LoveTool();

type ZoneKey = "low" | "medium" | "high";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "low", from: 0, to: 40, colorClass: "stroke-pink-300 dark:stroke-pink-400" },
  { key: "medium", from: 40, to: 70, colorClass: "stroke-pink-500 dark:stroke-pink-500" },
  { key: "high", from: 70, to: 100, colorClass: "stroke-rose-600 dark:stroke-rose-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  low: "fill-pink-400 dark:fill-pink-300",
  medium: "fill-pink-600 dark:fill-pink-500",
  high: "fill-rose-600 dark:fill-rose-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 100;
const TICKS = [0, 40, 70, 100];

const EXAMPLES = [
  { key: "romeoJuliet", name1: "Romeo", name2: "Juliet" },
  { key: "jackRose", name1: "Jack", name2: "Rose" },
  { key: "mickeyMinnie", name1: "Mickey", name2: "Minnie" },
  { key: "batmanCatwoman", name1: "Batman", name2: "Catwoman" },
];

function zoneForPercent(percent: number): ZoneKey {
  const zone = ZONES.find((z) => percent < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function LoveCompatibilityGauge() {
  const t = useTranslations("tools.love-calculator.education.intro.compatibilityGauge");
  const tExamples = useTranslations("tools.love-calculator.education.intro.compatibilityGauge.examples");
  const tZones = useTranslations("tools.love-calculator.education.intro.compatibilityGauge.zones");
  const [selectedKey, setSelectedKey] = useState("romeoJuliet");

  const percentages = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of EXAMPLES) {
      const output = tool.execute({ name1: e.name1, name2: e.name2 }, { locale: "en-US" });
      if (!output.data.error) map.set(e.key, output.data.percentage);
    }
    return map;
  }, []);

  const percent = percentages.get(selectedKey) ?? 0;
  const zone = zoneForPercent(percent);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={percent}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${Math.round(percent)}%`}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.key}
            type="button"
            role="tab"
            aria-selected={selectedKey === example.key}
            onClick={() => setSelectedKey(example.key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              selectedKey === example.key
                ? "border-pink-400 bg-pink-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-pink-300 hover:text-current"
            }`}
          >
            {tExamples(example.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tExamples(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { percent: Math.round(percent) })}</p>
    </EncyclopediaLiveWidget>
  );
}
