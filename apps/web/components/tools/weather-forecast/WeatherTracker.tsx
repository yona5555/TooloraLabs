"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import CityPanel from "./CityPanel";
import CurrentWeatherResult from "./CurrentWeatherResult";
import SevenDayForecastPanel from "./SevenDayForecastPanel";
import WeatherWeekChart from "./WeatherWeekChart";
import WeatherHumidityGauge from "./WeatherHumidityGauge";
import WeatherWindCompass from "./WeatherWindCompass";
import WeatherUVIndexGauge from "./WeatherUVIndexGauge";
import type { SelectedCity, WeatherSnapshot } from "./types";

type WeatherTrackerProps = {
  initialCity: SelectedCity;
  initialSnapshot: WeatherSnapshot;
  worldMap: ReactNode;
  education: ReactNode;
};

export default function WeatherTracker({ initialCity, initialSnapshot, worldMap, education }: WeatherTrackerProps) {
  const tNav = useTranslations("tools.weather-forecast.nav");
  const [selectedCity, setSelectedCity] = useState<SelectedCity>(initialCity);
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(initialSnapshot);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("idle");
  const [unitSystem, setUnitSystem] = useState<"metric" | "us">("metric");

  const digitStyle: DigitStyle = "western";

  useEffect(() => {
    if (selectedCity.latitude === initialCity.latitude && selectedCity.longitude === initialCity.longitude) {
      return;
    }

    let cancelled = false;
    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/weather/forecast?lat=${selectedCity.latitude}&lon=${selectedCity.longitude}`);
        if (!res.ok) throw new Error("fetch_failed");
        const json = (await res.json()) as WeatherSnapshot;
        if (!cancelled) {
          setSnapshot(json);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity.latitude, selectedCity.longitude]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "forecast", label: tNav("forecast") },
    { id: "world-map", label: tNav("worldMap") },
    { id: "disasters", label: tNav("disasters") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tNav("notices") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<CityPanel selectedCity={selectedCity} onSelectCity={setSelectedCity} />}
          result={
            <CurrentWeatherResult
              cityLabel={selectedCity.label}
              snapshot={snapshot}
              status={status}
              unitSystem={unitSystem}
              onUnitSystemChange={setUnitSystem}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="weather-forecast" category="weather" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="weather-forecast" />
              {snapshot && (
                <>
                  <SevenDayForecastPanel daily={snapshot.daily} unitSystem={unitSystem} digitStyle={digitStyle} />
                  <WeatherWeekChart daily={snapshot.daily} unitSystem={unitSystem} digitStyle={digitStyle} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <WeatherHumidityGauge relativeHumidity={snapshot.current.relativeHumidity} digitStyle={digitStyle} />
                    <WeatherWindCompass
                      windSpeedKmh={snapshot.current.windSpeedKmh}
                      windDirectionDeg={snapshot.current.windDirectionDeg}
                      unitSystem={unitSystem}
                      digitStyle={digitStyle}
                    />
                  </div>
                  <WeatherUVIndexGauge uvIndexMax={snapshot.daily[0]?.uvIndexMax ?? 0} digitStyle={digitStyle} />
                </>
              )}
            </div>
          }
        />
      </div>

      {worldMap}

      {education}
    </>
  );
}
