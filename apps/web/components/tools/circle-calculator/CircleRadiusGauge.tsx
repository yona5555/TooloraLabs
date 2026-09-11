"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import EncyclopediaLiveWidget from "@/components/tool-ui/EncyclopediaLiveWidget";

type ScaleKey = "pocket" | "room" | "landmark";

const ZONES: { key: ScaleKey; from: number; to: number; colorClass: string }[] = [
  { key: "pocket", from: 0, to: 1, colorClass: "stroke-emerald-500 dark:stroke-emerald-400" },
  { key: "room", from: 1, to: 2, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "landmark", from: 2, to: 4, colorClass: "stroke-indigo-600 dark:stroke-indigo-400" },
];

const CAPTION_COLOR: Record<ScaleKey, string> = {
  pocket: "fill-emerald-500 dark:fill-emerald-400",
  room: "fill-blue-500 dark:fill-blue-400",
  landmark: "fill-indigo-600 dark:fill-indigo-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 4;
const TICKS = [0, 1, 2, 3, 4];

// Radius in centimeters.
const EXAMPLES = [
  { key: "coin", radiusCm: 1.2 },
  { key: "dinnerPlate", radiusCm: 13 },
  { key: "bicycleWheel", radiusCm: 33 },
  { key: "runningTrack", radiusCm: 6370 },
  { key: "ferrisWheel", radiusCm: 6000 },
];

function scaleForRadius(radiusCm: number): ScaleKey {
  const log = Math.log10(radiusCm);
  const zone = ZONES.find((z) => log < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

function formatRadius(radiusCm: number): string {
  if (radiusCm >= 100) return `${(radiusCm / 100).toFixed(1)} m`;
  return `${radiusCm} cm`;
}

function tickLabel(tick: number): string {
  return formatRadius(10 ** tick);
}

export default function CircleRadiusGauge() {
  const t = useTranslations("tools.circle-calculator.education.intro.radiusGauge");
  const tExamples = useTranslations("tools.circle-calculator.education.intro.radiusGauge.examples");
  const tScales = useTranslations("tools.circle-calculator.education.intro.radiusGauge.scales");
  const [selectedKey, setSelectedKey] = useState("bicycleWheel");

  const selected = useMemo(() => EXAMPLES.find((e) => e.key === selectedKey) ?? EXAMPLES[2], [selectedKey]);
  const scale = scaleForRadius(selected.radiusCm);
  const classification = tScales(scale);
  const logValue = Math.log10(selected.radiusCm);

  return (
    <EncyclopediaLiveWidget title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div dir="ltr">
        <RatioGauge
          value={logValue}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={formatRadius(selected.radiusCm)}
          caption={classification}
          captionColorClass={CAPTION_COLOR[scale]}
          ticks={TICKS}
          tickFormatter={tickLabel}
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
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { radius: formatRadius(selected.radiusCm) })}</p>
    </EncyclopediaLiveWidget>
  );
}
