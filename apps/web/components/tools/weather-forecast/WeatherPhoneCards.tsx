"use client";
import { useTranslations } from "next-intl";
import { isNightSymbol } from "@tooloralabs/tools";
import PhoneMiniCards, { type PhoneMiniCard } from "@/components/tool-ui/PhoneMiniCards";
import WeatherIcon from "./WeatherIcon";
import type { WxCardProps } from "./wx";

/**
 * Phone top cards for the selected place, from the tool's own MET Norway forecast (they follow the
 * place picker and the °C/°F choice): now (temperature + condition icon) and the next 24 hours
 * (low / high + the hourly temperature line). No forecast step hides the card.
 */
export default function WeatherPhoneCards({ d, f }: WxCardProps) {
  const t = useTranslations("common.phoneTicker");
  const next = d.hours48.slice(0, 24).map((h) => h.tempC);
  const cards: PhoneMiniCard[] = [];
  if (d.cur) {
    cards.push({
      key: "now",
      label: t("wxNow", { city: d.place.name }),
      value: f.temp(d.cur.tempC),
      trailing: <WeatherIcon category={d.category} night={isNightSymbol(d.cur.symbol)} size={28} className="shrink-0 text-amber-500" />,
    });
  }
  if (next.length >= 2) {
    cards.push({
      key: "next24h",
      label: t("wxNext24h"),
      value: `${f.deg(Math.min(...next))} / ${f.deg(Math.max(...next))}`,
      trend: next,
      neutral: true,
    });
  }
  return <PhoneMiniCards label={t("label")} cards={cards} />;
}
