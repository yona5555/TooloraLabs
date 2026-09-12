"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";

type WeatherUVIndexGaugeProps = {
  uvIndexMax: number;
  digitStyle: DigitStyle;
};

type ZoneKey = "low" | "moderate" | "high" | "veryHigh" | "extreme";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string; fillClass: string }[] = [
  { key: "low", from: 0, to: 3, colorClass: "stroke-green-500 dark:stroke-green-400", fillClass: "fill-green-500 dark:fill-green-400" },
  { key: "moderate", from: 3, to: 6, colorClass: "stroke-yellow-400 dark:stroke-yellow-300", fillClass: "fill-yellow-500 dark:fill-yellow-400" },
  { key: "high", from: 6, to: 8, colorClass: "stroke-orange-500 dark:stroke-orange-400", fillClass: "fill-orange-500 dark:fill-orange-400" },
  { key: "veryHigh", from: 8, to: 11, colorClass: "stroke-red-600 dark:stroke-red-400", fillClass: "fill-red-600 dark:fill-red-400" },
  { key: "extreme", from: 11, to: 14, colorClass: "stroke-purple-600 dark:stroke-purple-400", fillClass: "fill-purple-600 dark:fill-purple-400" },
];

function classify(value: number): ZoneKey {
  const zone = ZONES.find((z) => value >= z.from && value < z.to);
  return zone ? zone.key : value >= 14 ? "extreme" : "low";
}

export default function WeatherUVIndexGauge({ uvIndexMax, digitStyle }: WeatherUVIndexGaugeProps) {
  const t = useTranslations("tools.weather-forecast.uvGauge");
  const zoneKey = classify(uvIndexMax);
  const zone = ZONES.find((z) => z.key === zoneKey) ?? ZONES[0];
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  return (
    <SectionCard title={t("title")}>
      <RatioGauge
        value={uvIndexMax}
        domainMin={0}
        domainMax={14}
        zones={ZONES.map((z) => ({ key: z.key, from: z.from, to: z.to, colorClass: z.colorClass }))}
        valueLabel={fmt(uvIndexMax)}
        caption={t(`zones.${zoneKey}`)}
        captionColorClass={zone.fillClass}
        ticks={[0, 3, 6, 8, 11, 14]}
      />
      <p className="mt-3 text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(`advice.${zoneKey}`)}</p>
    </SectionCard>
  );
}
