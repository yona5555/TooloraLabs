"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { wxFindCity, type WeatherUnitSystem, type WxForecast } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { usePersistedList } from "@/lib/use-persisted-list";
import WxInput, { cityPlace } from "./WxInput";
import WxResult from "./WxResult";
import WxWorldMap from "./WxWorldMap";
import WxCredits from "./WxCredits";
import { WxDailyCard, WxHourlyCard, WxHumidityCard, WxMoonCard, WxPressureCard, WxSunCard, WxUvCard, WxWindCard } from "./WxIndicators";
import WeatherPhoneCards from "./WeatherPhoneCards";
import { makeWxFmt, useWeatherDerived, useWxT, type WxPlace } from "./wx";
import { subscribeVisibleClock } from "@/components/tool-ui/motion/motion";

type Props = {
  initialCityId: string;
  initialForecast: WxForecast | null;
  /** Server render time, so the first client render matches the server HTML. */
  renderedAt: number;
  education: ReactNode;
};

/** Ticks once a minute so "now" (current hour, sun position, moon) stays live. */
function useMinuteClock(start: number) {
  const [now, setNow] = useState(start);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const stop = subscribeVisibleClock(60_000, tick); // tool-ui/motion: nothing while the page is hidden
    return () => {
      clearTimeout(first);
      stop();
    };
  }, []);
  return now;
}

export default function WeatherTracker({ initialCityId, initialForecast, renderedAt, education }: Props) {
  const t = useWxT();
  const locale = useLocale();
  const initialPlace = useMemo(() => cityPlace(wxFindCity(initialCityId)!, locale), [initialCityId, locale]);
  const [place, setPlace] = useState<WxPlace>(initialPlace);
  const [forecast, setForecast] = useState<WxForecast | null>(initialForecast);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(initialForecast ? "idle" : "loading");
  const favourites = usePersistedList<{ id: string }>("tooloralabs:weather:favourites:v1", 20);
  const unitPref = usePersistedList<{ id: string }>("tooloralabs:weather:units:v1", 1);
  const units: WeatherUnitSystem = unitPref.items[0]?.id === "us" ? "us" : "metric";
  const now = useMinuteClock(renderedAt);
  const f = useMemo(() => makeWxFmt(locale, units), [locale, units]);
  const d = useWeatherDerived(place, forecast, now);

  const loaded = useRef<string | null>(initialForecast ? `${initialPlace.lat},${initialPlace.lon}` : null);
  useEffect(() => {
    const key = `${place.lat},${place.lon}`;
    if (loaded.current === key) return;
    let cancelled = false;
    const ctrl = new AbortController();
    fetch(`/api/weather/forecast?lat=${place.lat}&lon=${place.lon}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("forecast"))))
      .then((j: WxForecast) => {
        if (cancelled) return;
        loaded.current = key;
        setForecast(j);
        setStatus("idle");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [place.lat, place.lon]);

  const choose = useCallback((p: WxPlace) => {
    if (loaded.current !== `${p.lat},${p.lon}`) setStatus("loading");
    setPlace(p);
  }, []);
  const toggleFavourite = useCallback(
    (id: string) => (favourites.items.some((x) => x.id === id) ? favourites.remove(id) : favourites.add({ id })),
    [favourites],
  );
  const setUnits = useCallback((u: WeatherUnitSystem) => (u === "us" ? unitPref.add({ id: "us" }) : unitPref.clear()), [unitPref]);

  const navItems = [
    { id: "tool", label: t("nav.tool") },
    { id: "wx-hourly", label: t("nav.hourly") },
    { id: "wx-daily", label: t("nav.daily") },
    { id: "wx-map", label: t("nav.map") },
    { id: "faq", label: t("nav.faq") },
    { id: "behind-the-tool", label: t("nav.behind") },
    { id: "notices", label: t("nav.notices") },
  ];

  const props = d ? { d, f } : null;

  return (
    <>
      {props && <WeatherPhoneCards {...props} />}
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <WxInput
              place={place}
              onPlace={choose}
              units={units}
              onUnits={setUnits}
              favourites={favourites.items.map((x) => x.id)}
              onToggleFavourite={toggleFavourite}
            />
          }
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              {props ? (
                <WxResult {...props} status={status} />
              ) : (
                <p role="status" className="rounded-xl border border-zinc-200 p-6 text-center text-sm dark:border-zinc-700">
                  {status === "error" ? t("result.error") : t("result.loading")}
                </p>
              )}
              <WxCredits />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="weather-forecast" category="weather" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="weather-forecast" />
              <SectionNav items={navItems} />
              {props && <WxHourlyCard {...props} />}
            </div>
          }
        />
      </div>

      {props && (
        <section className="mt-8 grid grid-cols-1 items-start gap-6">
          <WxDailyCard {...props} />
          <WxWorldMap {...props} />
          <WxWindCard {...props} />
          <WxPressureCard {...props} />
          <WxHumidityCard {...props} />
          <WxUvCard {...props} />
          <WxSunCard {...props} />
          <WxMoonCard {...props} />
        </section>
      )}

      {education}
    </>
  );
}
