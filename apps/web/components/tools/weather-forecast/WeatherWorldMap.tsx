"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapIcon } from "lucide-react";
import { getWeatherCategory } from "@tooloralabs/tools";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import SectionCard from "@/components/tool-ui/SectionCard";
import WeatherDataSourceNote from "./WeatherDataSourceNote";
import type { WorldMapWeather } from "./types";

type WeatherWorldMapProps = {
  cities: WorldMapWeather[];
};

const PIN_SVG = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34"><path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/><circle cx="13" cy="13" r="5.5" fill="white"/></svg>`;

export default function WeatherWorldMap({ cities }: WeatherWorldMapProps) {
  const t = useTranslations("tools.weather-forecast.worldMap");
  const tCategory = useTranslations("tools.weather-forecast.category");
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || loaded) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoaded(true);
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !containerRef.current || mapRef.current) return;
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, 10],
        zoom: 2,
        minZoom: 1,
        maxBounds: [
          [-85, -180],
          [85, 180],
        ],
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> | ' + t("attribution.openMeteo"),
        maxZoom: 8,
      }).addTo(map);

      for (const city of cities) {
        const color = city.temperatureC >= 20 ? "#0d9488" : "#2563eb";
        const icon = L.divIcon({
          html: PIN_SVG(color),
          className: "",
          iconSize: [26, 34],
          iconAnchor: [13, 34],
          popupAnchor: [0, -30],
        });
        const cityName = t(`cities.${city.nameKey}`);
        const conditionLabel = tCategory(getWeatherCategory(city.weatherCode));
        const popupHtml = `
          <div style="font-family: inherit; min-width: 140px;">
            <p style="margin:0 0 4px;font-weight:700;font-size:13px;">${cityName}</p>
            <p style="margin:0;font-size:18px;font-weight:700;" dir="ltr">${Math.round(city.temperatureC)}°C</p>
            <p style="margin:2px 0 0;font-size:12px;opacity:0.75;">${conditionLabel}</p>
          </div>`;
        L.marker([city.latitude, city.longitude], { icon }).addTo(map).bindPopup(popupHtml);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  return (
    <SectionCard id="world-map" title={t("title")}>
      <p className="mb-4 text-sm leading-6 opacity-80">{t("intro")}</p>

      <div className="relative">
        <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />

        {!loaded && (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-zinc-100/90 text-sm font-semibold text-zinc-600 backdrop-blur-sm transition hover:bg-zinc-100 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <MapIcon size={28} className="text-blue-600 dark:text-blue-400" />
            {t("showMapButton")}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          &copy;{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline decoration-dotted underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-400">
            OpenStreetMap contributors
          </a>
        </p>
        <WeatherDataSourceNote />
      </div>
    </SectionCard>
  );
}
