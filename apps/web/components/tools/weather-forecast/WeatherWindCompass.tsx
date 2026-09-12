"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { convertWindSpeed } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

type WeatherWindCompassProps = {
  windSpeedKmh: number;
  windDirectionDeg: number;
  unitSystem: "metric" | "us";
  digitStyle: DigitStyle;
};

const DIRECTION_KEYS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;

function directionKey(deg: number): (typeof DIRECTION_KEYS)[number] {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return DIRECTION_KEYS[index];
}

const SIZE = 160;
const CENTER = SIZE / 2;
const RADIUS = 66;
// The N/E/S/W labels sit at RADIUS + 14 from center, i.e. right at the
// SIZE x SIZE box's own edge — with dominantBaseline="middle" and
// non-trivial glyph width (especially Arabic direction words like "شمال"),
// that clips the label against the viewBox boundary. Padding the viewBox
// on all four sides, without moving any coordinate in the drawing itself,
// gives the labels room to render fully.
const PAD = 26;

export default function WeatherWindCompass({ windSpeedKmh, windDirectionDeg, unitSystem, digitStyle }: WeatherWindCompassProps) {
  const t = useTranslations("tools.weather-forecast.windCompass");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });

  const speed = unitSystem === "us" ? convertWindSpeed(windSpeedKmh, "kmh", "mph") : windSpeedKmh;
  const unitLabel = unitSystem === "us" ? t("mph") : t("kmh");

  // SVG 0deg points right (east); meteorological bearings are measured
  // clockwise from north, so rotate -90deg to align the arrow with north-up.
  const angle = windDirectionDeg - 90;
  const tipX = CENTER + RADIUS * Math.cos((angle * Math.PI) / 180);
  const tipY = CENTER + RADIUS * Math.sin((angle * Math.PI) / 180);
  const tailAngle = angle + 180;
  const tailX = CENTER + (RADIUS - 30) * Math.cos((tailAngle * Math.PI) / 180);
  const tailY = CENTER + (RADIUS - 30) * Math.sin((tailAngle * Math.PI) / 180);

  const compassLabels: { key: (typeof DIRECTION_KEYS)[number]; deg: number }[] = [
    { key: "n", deg: 0 },
    { key: "e", deg: 90 },
    { key: "s", deg: 180 },
    { key: "w", deg: 270 },
  ];

  return (
    <SectionCard title={t("title")}>
      <div dir="ltr" className="flex flex-col items-center">
        <svg
          viewBox={`${-PAD} ${-PAD} ${SIZE + PAD * 2} ${SIZE + PAD * 2}`}
          role="img"
          aria-label={t("ariaLabel", { direction: t(`directions.${directionKey(windDirectionDeg)}`), speed: `${fmt(speed)} ${unitLabel}` })}
          className="w-40"
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" strokeWidth={2} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS - 18} fill="none" strokeWidth={1} strokeDasharray="2 3" className="stroke-zinc-200 dark:stroke-zinc-700" />

          {compassLabels.map(({ key, deg }) => {
            const a = deg - 90;
            const x = CENTER + (RADIUS + 14) * Math.cos((a * Math.PI) / 180);
            const y = CENTER + (RADIUS + 14) * Math.sin((a * Math.PI) / 180);
            return (
              <text key={key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
                {t(`directions.${key}`)}
              </text>
            );
          })}

          <line x1={tailX} y1={tailY} x2={tipX} y2={tipY} strokeWidth={4} strokeLinecap="round" className="stroke-blue-600 dark:stroke-blue-400" />
          <circle cx={tipX} cy={tipY} r={7} className="fill-blue-600 dark:fill-blue-400" />
          <circle cx={CENTER} cy={CENTER} r={4} className="fill-zinc-700 dark:fill-zinc-300" />
        </svg>

        <p className="mt-2 text-center text-sm leading-6">
          <span dir="ltr" className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {fmt(speed)} {unitLabel}
          </span>{" "}
          <span className="text-zinc-600 dark:text-zinc-300">{t("fromDirection", { direction: t(`directions.${directionKey(windDirectionDeg)}`) })}</span>
        </p>
      </div>
    </SectionCard>
  );
}
