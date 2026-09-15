"use client";
import { useTranslations } from "next-intl";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import SectionCard from "@/components/tool-ui/SectionCard";

type Props = {
  goldUsdPerOunce: number;
  silverUsdPerOunce: number;
};

/**
 * The gold/silver ratio (how many ounces of silver buy one ounce of gold) is a
 * widely-tracked real metric among commodities traders — not an invented one —
 * used to judge whether silver is cheap or expensive relative to gold. Zone
 * boundaries follow its commonly-cited historical range (roughly 40-50 "tight"
 * up through 90+ "historically wide", with 100-year average landing near 60-70).
 */
const ZONES = [
  { key: "tight", from: 0, to: 50, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "average", from: 50, to: 80, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "wide", from: 80, to: 100, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
  { key: "extreme", from: 100, to: 130, colorClass: "stroke-red-500 dark:stroke-red-400" },
];
const CAPTION_COLOR: Record<string, string> = {
  tight: "fill-green-500 dark:fill-green-400",
  average: "fill-blue-500 dark:fill-blue-400",
  wide: "fill-amber-500 dark:fill-amber-400",
  extreme: "fill-red-500 dark:fill-red-400",
};
const DOMAIN_MIN = 0;
const DOMAIN_MAX = 130;
const TICKS = [0, 50, 80, 100, 130];

function zoneFor(ratio: number) {
  return ZONES.find((z) => ratio < z.to) ?? ZONES[ZONES.length - 1];
}

export default function CommodityGoldSilverRatioGauge({ goldUsdPerOunce, silverUsdPerOunce }: Props) {
  const t = useTranslations("tools.commodities-tracker.goldSilverRatio");

  if (!goldUsdPerOunce || !silverUsdPerOunce) return null;

  const ratio = goldUsdPerOunce / silverUsdPerOunce;
  const zone = zoneFor(ratio);
  const clampedRatio = Math.min(ratio, DOMAIN_MAX);

  return (
    <SectionCard title={t("title")}>
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr">
        <RatioGauge
          value={clampedRatio}
          domainMin={DOMAIN_MIN}
          domainMax={DOMAIN_MAX}
          zones={ZONES}
          valueLabel={ratio.toFixed(1)}
          caption={t(`zones.${zone.key}`)}
          captionColorClass={CAPTION_COLOR[zone.key]}
          ticks={TICKS}
        />
      </div>
      <p className="mt-3 text-center text-sm leading-6 opacity-80">{t("fact")}</p>
    </SectionCard>
  );
}
