"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import CityPanel from "./CityPanel";
import CurrentWeatherResult from "./CurrentWeatherResult";
import WeatherDisclaimer from "./WeatherDisclaimer";
import SevenDayForecastPanel from "./SevenDayForecastPanel";
import type { SelectedCity, WeatherSnapshot } from "./types";

type WeatherTrackerProps = {
  initialCity: SelectedCity;
  initialSnapshot: WeatherSnapshot;
  education: ReactNode;
};

export default function WeatherTracker({ initialCity, initialSnapshot, education }: WeatherTrackerProps) {
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
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
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
              <WeatherDisclaimer />
              {snapshot && <SevenDayForecastPanel daily={snapshot.daily} unitSystem={unitSystem} digitStyle={digitStyle} />}
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
