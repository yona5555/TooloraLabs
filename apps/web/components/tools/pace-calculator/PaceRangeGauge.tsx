"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatClock } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ZoneKey = "elite" | "fast" | "moderate" | "easy" | "recovery";

// Mirrors the zone boundaries and colors used by the result-panel PaceGauge,
// so the two widgets classify the same pace value identically.
const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "elite", from: 180, to: 240, colorClass: "stroke-red-500 dark:stroke-red-400" },
  { key: "fast", from: 240, to: 300, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "moderate", from: 300, to: 390, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "easy", from: 390, to: 480, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "recovery", from: 480, to: 720, colorClass: "stroke-zinc-400 dark:stroke-zinc-500" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  elite: "fill-red-500 dark:fill-red-400",
  fast: "fill-amber-500 dark:fill-amber-400",
  moderate: "fill-green-500 dark:fill-green-400",
  easy: "fill-blue-500 dark:fill-blue-400",
  recovery: "fill-zinc-400 dark:fill-zinc-500",
};

const DOMAIN_MIN = 180;
const DOMAIN_MAX = 720;
const TICKS = [180, 240, 300, 390, 480, 720];

function zoneForPace(paceSeconds: number): ZoneKey {
  const zone = ZONES.find((z) => paceSeconds < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

const EXAMPLES = [
  { key: "eliteRunner", paceSecondsPerKm: 195 },
  { key: "competitiveRunner", paceSecondsPerKm: 270 },
  { key: "recreationalRunner", paceSecondsPerKm: 345 },
  { key: "casualJogger", paceSecondsPerKm: 420 },
  { key: "briskWalker", paceSecondsPerKm: 570 },
];

export default function PaceRangeGauge() {
  const t = useTranslations("tools.pace-calculator.education.intro.rangeGauge");
  const tExamples = useTranslations("tools.pace-calculator.education.intro.rangeGauge.examples");
  const tZones = useTranslations("tools.pace-calculator.gauge.zones");
  const [selectedKey, setSelectedKey] = useState("recreationalRunner");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[2], [selectedKey]);
  const zone = zoneForPace(selected.paceSecondsPerKm);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected.paceSecondsPerKm}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={formatClock(selected.paceSecondsPerKm)}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
          tickFormatter={(tick) => formatClock(tick)}
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
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tExamples(example.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tExamples(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { pace: formatClock(selected.paceSecondsPerKm) })}</p>
    </EncyclopediaLiveWidget>
  );
}
