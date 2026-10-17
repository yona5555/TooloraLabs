"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { LocateFixed, Search as SearchIcon, Star } from "lucide-react";
import { wxCityName, wxFindCity, wxSearchCities, type WeatherUnitSystem, type WxCity } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useWxT, type WxPlace } from "./wx";

type Props = {
  place: WxPlace;
  onPlace: (p: WxPlace) => void;
  units: WeatherUnitSystem;
  onUnits: (u: WeatherUnitSystem) => void;
  favourites: string[];
  onToggleFavourite: (id: string) => void;
};

const noop = () => () => {};
/** False during SSR and hydration: country names come from Intl.DisplayNames, whose wording differs between Node and browser ICU. */
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function cityPlace(c: WxCity, locale: string): WxPlace {
  return { id: c.id, name: wxCityName(c, locale), lat: c.lat, lon: c.lon, zone: c.zone };
}

/** City search over the built-in list, favourites, "use my location" and the unit system. */
export default function WxInput({ place, onPlace, units, onUnits, favourites, onToggleFavourite }: Props) {
  const t = useWxT();
  const locale = useLocale();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [geo, setGeo] = useState<"idle" | "busy" | "denied" | "unsupported">("idle");
  const region = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const matches = useMemo(() => wxSearchCities(query), [query]);
  const favCities = favourites.map(wxFindCity).filter((c): c is WxCity => Boolean(c));

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeo("unsupported");
      return;
    }
    setGeo("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo("idle");
        onPlace({
          id: "geo",
          name: t("input.myLocation"),
          lat: Math.round(pos.coords.latitude * 100) / 100,
          lon: Math.round(pos.coords.longitude * 100) / 100,
          zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        });
      },
      () => setGeo("denied"),
      { maximumAge: 600_000, timeout: 15_000 },
    );
  };

  const row = (c: WxCity) => {
    const fav = favourites.includes(c.id);
    const active = place.id === c.id;
    return (
      <li key={c.id} className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onToggleFavourite(c.id)}
          aria-label={fav ? t("input.unfavourite") : t("input.favourite")}
          aria-pressed={fav}
          className="rounded p-1 text-zinc-400 hover:text-amber-500"
        >
          <Star size={14} className={fav ? "fill-amber-400 text-amber-500" : ""} />
        </button>
        <button
          type="button"
          onClick={() => onPlace(cityPlace(c, locale))}
          className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm ${
            active ? "bg-blue-600 font-semibold text-white" : "text-zinc-800 hover:bg-blue-50 dark:text-zinc-100 dark:hover:bg-blue-500/10"
          }`}
        >
          <span className="truncate">{wxCityName(c, locale)}</span>
          <span className={`shrink-0 truncate text-xs ${active ? "text-blue-100" : "text-zinc-500 dark:text-zinc-400"}`}>{hydrated ? (region?.of(c.country) ?? c.country) : c.country}</span>
        </button>
      </li>
    );
  };

  return (
    <SectionCard title={t("input.title")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="flex flex-col gap-3 p-4 lg:flex-1">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 text-sm dark:bg-zinc-800" role="radiogroup" aria-label={t("input.units")} data-bp-inner>
        {(["metric", "us"] as const).map((u) => (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={units === u}
            onClick={() => onUnits(u)}
            className={`rounded-md px-2 py-1.5 font-semibold ${units === u ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-300"}`}
          >
            {t(`input.${u}`)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={locate}
        disabled={geo === "busy"}
        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
          place.id === "geo" ? "border-blue-600 bg-blue-600 text-white" : "border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10"
        }`}
      >
        <LocateFixed size={16} />
        {geo === "busy" ? t("input.locating") : t("input.useLocation")}
      </button>
      {(geo === "denied" || geo === "unsupported") && <p className="text-xs text-amber-700 dark:text-amber-300">{t(`input.geo.${geo}`)}</p>}
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.geoNote")}</p>

      {favCities.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{t("input.favourites")}</p>
          <ul className="space-y-0.5">{favCities.map(row)}</ul>
        </div>
      )}

      <label className="relative block">
        <span className="sr-only">{t("input.search")}</span>
        <SearchIcon size={15} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("input.searchPlaceholder")}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 ps-8 pe-3 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
      </label>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("input.count", { n: matches.length })}</p>
      {matches.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("input.noResults")}</p>
      ) : (
        <ul className="max-h-[360px] min-h-0 space-y-0.5 overflow-y-auto pe-1 lg:max-h-none lg:flex-1 lg:basis-0">{matches.map(row)}</ul>
      )}
    </SectionCard>
  );
}
