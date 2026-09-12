"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import RatioGauge from "@/components/tool-ui/RatioGauge";

type WeatherHumidityGaugeProps = {
  relativeHumidity: number;
  digitStyle: DigitStyle;
};

type ZoneKey = "dry" | "comfortable" | "humid";

const ZONES: { key: ZoneKey; from: number; to: number; colorClass: string; fillClass: string }[] = [
  { key: "dry", from: 0, to: 30, colorClass: "stroke-amber-500 dark:stroke-amber-400", fillClass: "fill-amber-500 dark:fill-amber-400" },
  { key: "comfortable", from: 30, to: 60, colorClass: "stroke-green-500 dark:stroke-green-400", fillClass: "fill-green-500 dark:fill-green-400" },
  { key: "humid", from: 60, to: 100, colorClass: "stroke-blue-600 dark:stroke-blue-400", fillClass: "fill-blue-600 dark:fill-blue-400" },
];

function classify(value: number): ZoneKey {
  const zone = ZONES.find((z) => value >= z.from && value <= z.to);
  return zone ? zone.key : value < 0 ? "dry" : "humid";
}

export default function WeatherHumidityGauge({ relativeHumidity, digitStyle }: WeatherHumidityGaugeProps) {
  const t = useTranslations("tools.weather-forecast.humidityGauge");
  const zoneKey = classify(relativeHumidity);
  const zone = ZONES.find((z) => z.key === zoneKey) ?? ZONES[1];
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  return (
    <SectionCard title={t("title")}>
      <RatioGauge
        value={relativeHumidity}
        domainMin={0}
        domainMax={100}
        zones={ZONES.map((z) => ({ key: z.key, from: z.from, to: z.to, colorClass: z.colorClass }))}
        valueLabel={`${fmt(relativeHumidity)}%`}
        caption={t(`zones.${zoneKey}`)}
        captionColorClass={zone.fillClass}
        ticks={[0, 30, 60, 100]}
        tickFormatter={(tick) => `${tick}%`}
      />
      <p className="mt-3 text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(`advice.${zoneKey}`)}</p>
    </SectionCard>
  );
}
