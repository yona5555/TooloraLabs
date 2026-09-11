"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { calculateIdealWeight } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { IDEAL_WEIGHT_SCENARIOS } from "./types";

type FrameKey = "petite" | "average" | "larger";

const ZONES: { key: FrameKey; from: number; to: number; colorClass: string }[] = [
  { key: "petite", from: 40, to: 55, colorClass: "stroke-blue-400 dark:stroke-blue-300" },
  { key: "average", from: 55, to: 75, colorClass: "stroke-blue-600 dark:stroke-blue-500" },
  { key: "larger", from: 75, to: 100, colorClass: "stroke-indigo-700 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<FrameKey, string> = {
  petite: "fill-blue-400 dark:fill-blue-300",
  average: "fill-blue-600 dark:fill-blue-500",
  larger: "fill-indigo-700 dark:fill-indigo-400",
};

const DOMAIN_MIN = 40;
const DOMAIN_MAX = 100;
const TICKS = [40, 55, 75, 100];

function frameForWeight(kg: number): FrameKey {
  const zone = ZONES.find((z) => kg < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function IdealWeightRangeGauge() {
  const t = useTranslations("tools.ideal-weight-calculator.education.intro.rangeGauge");
  const tExamples = useTranslations("tools.ideal-weight-calculator.scenarios");
  const tFrames = useTranslations("tools.ideal-weight-calculator.education.intro.rangeGauge.frames");
  const [selectedKey, setSelectedKey] = useState("averageMale");

  const values = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of IDEAL_WEIGHT_SCENARIOS) {
      const result = calculateIdealWeight(s.gender, Number(s.heightCm));
      map.set(s.key, result.average);
    }
    return map;
  }, []);

  const selected = values.get(selectedKey) ?? 0;
  const frame = frameForWeight(selected);
  const classification = tFrames(frame);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={`${Math.round(selected)} kg`}
          caption={classification}
          captionColorClass={CAPTION_COLOR[frame]}
          ticks={TICKS}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {IDEAL_WEIGHT_SCENARIOS.map((s) => (
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
            {tExamples(s.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tExamples(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { weight: `${Math.round(selected)} kg` })}</p>
    </EncyclopediaLiveWidget>
  );
}
