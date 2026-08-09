"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin, Search as SearchIcon } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { PRIORITY_CITIES } from "@/lib/weather/open-meteo";
import type { CitySearchResult, SelectedCity } from "./types";

type CityPanelProps = {
  selectedCity: SelectedCity;
  onSelectCity: (city: SelectedCity) => void;
};

export default function CityPanel({ selectedCity, onSelectCity }: CityPanelProps) {
  const t = useTranslations("tools.weather-forecast.aboveFold");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(normalized)}`);
        const json = (await res.json()) as { cities: CitySearchResult[] };
        if (!cancelled) setResults(json.cities);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSearchResult(city: CitySearchResult) {
    const label = city.admin1 ? `${city.name}, ${city.admin1}, ${city.country}` : `${city.name}, ${city.country}`;
    onSelectCity({ label, latitude: city.latitude, longitude: city.longitude });
    setIsOpen(false);
    setQuery("");
  }

  return (
    <SectionCard title={t("cityPanelTitle")}>
      <div className="space-y-5">
        <div ref={containerRef} className="relative">
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("searchLabel")}</span>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start dark:border-zinc-700 dark:bg-zinc-800"
          >
            <span className="flex min-w-0 items-center gap-2">
              <MapPin size={16} className="shrink-0 text-zinc-400" />
              <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{selectedCity.label}</span>
            </span>
            <ChevronDown size={16} className="shrink-0 text-zinc-400" />
          </button>

          {isOpen && (
            <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <SearchIcon size={16} className="shrink-0 text-zinc-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>

              <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
                {results.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onClick={() => selectSearchResult(city)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <MapPin size={14} className="shrink-0 text-zinc-400" />
                      <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">
                        {city.name}
                        {city.admin1 ? `, ${city.admin1}` : ""}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-400">{city.country}</span>
                    </button>
                  </li>
                ))}

                {query.trim().length >= 2 && results.length === 0 && (
                  <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {isSearching ? t("searching") : t("noResults")}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("priorityCitiesLabel")}</span>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITY_CITIES.map((city) => {
              const isActive = selectedCity.latitude === city.latitude && selectedCity.longitude === city.longitude;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => onSelectCity({ label: t(`priorityCity.${city.nameKey}`), latitude: city.latitude, longitude: city.longitude })}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {t(`priorityCity.${city.nameKey}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
