"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

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

const EXAMPLES: { key: string; weeksAlong: number; trimester: TrimesterKey }[] = [
  { key: "firstTrimester", weeksAlong: 8, trimester: "firstTrimester" },
  { key: "secondTrimester", weeksAlong: 20, trimester: "secondTrimester" },
  { key: "thirdTrimester", weeksAlong: 34, trimester: "thirdTrimester" },
];

export default function DueDateWeekGauge() {
  const t = useTranslations("tools.due-date-calculator.education.intro.weekGauge");
  const tExamples = useTranslations("tools.due-date-calculator.education.intro.weekGauge.examples");
  const [selectedKey, setSelectedKey] = useState("secondTrimester");

  const selected = EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[1];
  const classification = tExamples(selected.trimester);

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
          captionColorClass={CAPTION_COLOR[selected.trimester]}
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
                ? "border-blue-400 bg-blue-600 text-white"
                : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
            }`}
          >
            {tExamples(example.key)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { weeks: selected.weeksAlong, classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { weeks: selected.weeksAlong })}</p>
    </EncyclopediaLiveWidget>
  );
}
