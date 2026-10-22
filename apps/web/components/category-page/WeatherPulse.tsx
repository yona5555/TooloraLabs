import { getTranslations } from "next-intl/server";
import { buildDailyForecast, currentStep, isNightSymbol, metSymbolCategory, wxCityName, wxDefaultCity } from "@tooloralabs/tools";
import WeatherIcon from "@/components/tools/weather-forecast/WeatherIcon";
import { getForecast } from "@/lib/weather/met-norway";
import { getFetchTimestamp } from "@/lib/crypto/coingecko";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The weather section's indicators: the locale's default city (wxDefaultCity) read with exactly the
 * getForecast() call the weather tool makes for that locale on load, so it shares the tool's cached
 * MET Norway response and adds no request. Now, today's low/high, wind (with gust), humidity and
 * pressure come from the current forecast step and the tool's own daily grouping. With no forecast
 * the strip is hidden; a value MET does not give hides only its indicator.
 */
export default async function WeatherPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.weather" });
  const tPage = await getTranslations({ locale, namespace: "toolsPage" });
  const city = wxDefaultCity(locale);
  const wx = await getForecast(city.lat, city.lon).catch(() => null);
  const step = wx ? currentStep(wx.forecast.steps, getFetchTimestamp()) : null;
  if (!wx || !step) return null;

  const today = buildDailyForecast(wx.forecast.steps, city.zone)[0];
  const name = wxCityName(city, locale);
  const fmt = (v: number) => new Intl.NumberFormat(`${locale}-u-nu-latn`, { maximumFractionDigits: 0 }).format(Math.round(v) + 0);
  const ltr = (s: string) => <span dir="ltr">{s}</span>;
  const stamp = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(wx.forecast.updatedAt));
  const source = `${tPage("pulseUpdated", { time: `${stamp} UTC` })} · ${t("source", { city: name })}`;
  const href = "/tools/weather-forecast";

  const items: IndicatorItem[] = [
    {
      id: "now",
      href,
      label: t("now", { city: name }),
      value: ltr(`${fmt(step.tempC)}°C`),
      trailing: <WeatherIcon category={metSymbolCategory(step.symbol)} night={isNightSymbol(step.symbol)} size={20} className="shrink-0 text-amber-500" />,
      note: source,
    },
  ];
  if (today && Number.isFinite(today.minC) && Number.isFinite(today.maxC)) {
    items.push({ id: "range", href, label: t("range"), value: ltr(`${fmt(today.minC)}° / ${fmt(today.maxC)}°`), note: `${t("rangeNote")} ${source}` });
  }
  if (Number.isFinite(step.windKmh)) {
    const gust = step.gustKmh !== null && Number.isFinite(step.gustKmh) ? ` · ${t("gust", { kmh: fmt(step.gustKmh) })}` : "";
    items.push({ id: "wind", href, label: t("wind"), value: <span>{ltr(`${fmt(step.windKmh)} km/h`)}{gust}</span>, note: source });
  }
  if (Number.isFinite(step.rh)) {
    items.push({ id: "humidity", href, label: t("humidity"), value: ltr(`${fmt(step.rh)}%`), note: source });
  }
  if (Number.isFinite(step.pressureHpa)) {
    items.push({ id: "pressure", href, label: t("pressure"), value: ltr(`${fmt(step.pressureHpa)} hPa`), note: `${t("pressureNote")} ${source}` });
  }
  return <IndicatorStrip label={t("label")} items={items} />;
}
