"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { COUNTDOWN_SCENARIOS } from "./types";

type ZoneKey = "soon" | "upcoming" | "farOff";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string }[] = [
  { key: "soon", from: 0, to: 1.3, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "upcoming", from: 1.3, to: 2, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "farOff", from: 2, to: 2.6, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ZoneKey, string> = {
  soon: "fill-green-500 dark:fill-green-400",
  upcoming: "fill-blue-500 dark:fill-blue-400",
  farOff: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 2.6;
const TICKS = [0, 1, 2];

function zoneForLogDays(log: number): ZoneKey {
  const zone = ZONES.find((z) => log < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

function tickLabel(tick: number): string {
  return `${Math.round(10 ** tick)}`;
}

export default function CountdownDistanceGauge() {
  const t = useTranslations("tools.countdown-to-event-calculator.education.intro.distanceGauge");
  const tScenarios = useTranslations("tools.countdown-to-event-calculator.scenarios");
  const tZones = useTranslations("tools.countdown-to-event-calculator.education.intro.distanceGauge.zones");
  const [selectedKey, setSelectedKey] = useState(COUNTDOWN_SCENARIOS[0].key);

  const selected = useMemo(() => COUNTDOWN_SCENARIOS.find((s) => s.key === selectedKey) ?? COUNTDOWN_SCENARIOS[0], [selectedKey]);
  const logDays = Math.log10(selected.daysFromNow);
  const zone = zoneForLogDays(logDays);
  const classification = tZones(zone);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={logDays}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={t("daysValue", { days: selected.daysFromNow })}
          caption={classification}
          captionColorClass={CAPTION_COLOR[zone]}
          ticks={TICKS}
          tickFormatter={tickLabel}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {COUNTDOWN_SCENARIOS.map((s) => (
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { days: selected.daysFromNow })}</p>
    </EncyclopediaLiveWidget>
  );
}
