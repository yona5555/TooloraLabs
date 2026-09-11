"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";
import { PREGNANCY_SCENARIOS } from "./types";

type TrimesterKey = "firstTrimester" | "secondTrimester" | "thirdTrimester";

const ZONES: { key: TrimesterKey; from: number; to: number; colorClass: string }[] = [
  { key: "firstTrimester", from: 0, to: 13, colorClass: "stroke-pink-400 dark:stroke-pink-300" },
  { key: "secondTrimester", from: 13, to: 27, colorClass: "stroke-purple-500 dark:stroke-purple-400" },
  { key: "thirdTrimester", from: 27, to: 42, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<TrimesterKey, string> = {
  firstTrimester: "fill-pink-400 dark:fill-pink-300",
  secondTrimester: "fill-purple-500 dark:fill-purple-400",
  thirdTrimester: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 42;
const TICKS = [0, 13, 27, 42];

function trimesterForWeek(week: number): TrimesterKey {
  const zone = ZONES.find((z) => week < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function PregnancyWeekGauge() {
  const t = useTranslations("tools.pregnancy-calculator.education.intro.weekGauge");
  const tScenarios = useTranslations("tools.pregnancy-calculator.scenarios");
  const [selectedKey, setSelectedKey] = useState("secondTrimester");

  const selected = useMemo(() => PREGNANCY_SCENARIOS.find((s) => s.key === selectedKey) ?? PREGNANCY_SCENARIOS[1], [selectedKey]);
  const trimester = trimesterForWeek(selected.weeksAlong);
  const classification = tScenarios(trimester);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={selected.weeksAlong}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={t("weekValue", { weeks: selected.weeksAlong })}
          caption={classification}
          captionColorClass={CAPTION_COLOR[trimester]}
          ticks={TICKS}
        />
      </div>

      <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
        {PREGNANCY_SCENARIOS.map((s) => (
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

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tScenarios(selectedKey), weeks: selected.weeksAlong })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { weeks: selected.weeksAlong })}</p>
    </EncyclopediaLiveWidget>
  );
}
