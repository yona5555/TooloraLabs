"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Search as SearchIcon } from "lucide-react";
import { filterCitiesByQuery, WORLD_CITIES, type WorldCity } from "@/lib/worldtime/cities";

type WorldTimeCityPickerProps = {
  label: string;
  value: string;
  onChange: (id: string) => void;
};

export default function WorldTimeCityPicker({ label, value, onChange }: WorldTimeCityPickerProps) {
  const t = useTranslations("tools.world-time-converter.aboveFold");
  const locale = useLocale();
  const nameKey = locale === "ar" ? "ar" : "en";
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCity = WORLD_CITIES.find((city) => city.id === value);
  const matches = useMemo(() => filterCitiesByQuery(WORLD_CITIES, query, locale).slice(0, 12), [query, locale]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function labelFor(city: WorldCity) {
    return `${city.city[nameKey]} — ${city.country[nameKey]}`;
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start dark:border-zinc-700 dark:bg-zinc-800"
      >
        {selectedCity ? (
          <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{labelFor(selectedCity)}</span>
        ) : (
          <span className="text-zinc-400">{t("pickerPlaceholder")}</span>
        )}
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
              placeholder={t("pickerSearchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {matches.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(city.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{labelFor(city)}</span>
                </button>
              </li>
            ))}

            {matches.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">{t("pickerNoResults")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
