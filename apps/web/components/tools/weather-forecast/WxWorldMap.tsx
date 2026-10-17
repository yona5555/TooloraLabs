"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { ExternalLink, MapIcon } from "lucide-react";
import { countHazards, hazardsByDistance, wxCityName, wxFindCity, type Hazard } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { EVENT_COLORS, TEMP_STOPS, useWxT, type MapCity, type MapLayers, type WxDerived, type WxFmt } from "./wx";
import WxCredits from "./WxCredits";

const WxMapCanvas = dynamic(() => import("./WxMapCanvas"), { ssr: false });

type MapPoint = { id: string; tempC: number; symbol: string | null };
type HazardSnap = { hazards: Hazard[]; quakesOk: boolean; eventsOk: boolean; fetchedAt: number };

const KINDS = ["earthquake", "wildfire", "storm", "volcano"] as const;

/**
 * World map (lazy: MapLibre and both data requests start only when the card nears the viewport).
 * Temperature layer for the curated cities (MET Norway), USGS M4.5+ earthquakes of the past
 * week and open NASA EONET wildfire / storm / volcano events, each linking to its original source.
 */
export default function WxWorldMap({ d, f }: { d: WxDerived; f: WxFmt }) {
  const t = useWxT();
  const locale = useLocale();
  const dark = useIsDarkMode();
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [points, setPoints] = useState<MapPoint[] | null>(null);
  const [snap, setSnap] = useState<HazardSnap | null>(null);
  const [failed, setFailed] = useState(false);
  const [layers, setLayers] = useState<MapLayers>({ temperature: true, earthquake: true, wildfire: true, storm: true, volcano: true });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    const loadHazards = () =>
      fetch("/api/weather/hazards")
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("hazards"))))
        .then((j: HazardSnap) => !cancelled && setSnap(j))
        .catch(() => !cancelled && setFailed(true));
    fetch("/api/weather/map")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("map"))))
      .then((j: { points: MapPoint[] }) => !cancelled && setPoints(j.points))
      .catch(() => !cancelled && setFailed(true));
    loadHazards();
    const id = setInterval(loadHazards, 10 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [visible]);

  const cities: MapCity[] = useMemo(
    () =>
      (points ?? []).flatMap((p) => {
        const c = wxFindCity(p.id);
        return c ? [{ id: c.id, name: wxCityName(c, locale), lat: c.lat, lon: c.lon, tempC: p.tempC, label: f.deg(p.tempC) }] : [];
      }),
    [points, locale, f],
  );
  const hazards = useMemo(() => snap?.hazards ?? [], [snap]);
  const counts = countHazards(hazards);
  const near = useMemo(() => hazardsByDistance(hazards, { lat: d.place.lat, lon: d.place.lon }), [hazards, d.place.lat, d.place.lon]);
  const sel = near.find((h) => h.id === selected) ?? null;
  const hottest = cities.length ? cities.reduce((a, c) => (c.tempC > a.tempC ? c : a)) : null;
  const coldest = cities.length ? cities.reduce((a, c) => (c.tempC < a.tempC ? c : a)) : null;
  const km = (n: number) => t("units.km", { n: f.num(n) });
  const describe = (h: Hazard) =>
    h.kind === "earthquake"
      ? `M ${h.magnitude !== null ? f.num(h.magnitude, 1) : "?"}`
      : h.magnitude !== null
        ? `${f.num(h.magnitude)} ${h.magnitudeUnit ?? ""}`.trim()
        : t(`map.kind.${h.kind}`);

  return (
    <SectionCard id="wx-map" title={t("map.title")}>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{t("map.intro")}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["temperature", ...KINDS] as const).map((k) => (
          <label key={k} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold dark:border-zinc-700">
            <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers((l) => ({ ...l, [k]: e.target.checked }))} className="accent-blue-600" />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: k === "temperature" ? "linear-gradient(90deg,#2563eb,#eab308,#dc2626)" : EVENT_COLORS[k] }} />
            {t(`map.layer.${k}`)}
            {k !== "temperature" && snap && <span className="text-zinc-500">({f.num(counts[k])})</span>}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div ref={box} className="relative h-[460px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
          {visible ? (
            <WxMapCanvas
              key={dark ? "dark" : "light"}
              cities={cities}
              hazards={hazards}
              layers={layers}
              center={{ lat: d.place.lat, lon: d.place.lon }}
              dark={dark}
              selectedId={selected}
              onSelect={setSelected}
              ariaLabel={t("map.title")}
            />
          ) : (
            <button type="button" onClick={() => setVisible(true)} className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              <MapIcon size={28} className="text-blue-600" />
              {t("map.load")}
            </button>
          )}
          {visible && (!points || !snap) && !failed && (
            <p className="pointer-events-none absolute start-2 top-2 rounded bg-white/90 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200">{t("map.loading")}</p>
          )}
          {failed && <p className="absolute start-2 top-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{t("map.error")}</p>}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40" data-bp-inner>
            <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{t("ind.worked")}</p>
            {sel ? (
              <dl className="mt-2 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2"><dt className="text-zinc-500">{t("map.d.type")}</dt><dd className="font-semibold" style={{ color: EVENT_COLORS[sel.kind] }}>{t(`map.kind.${sel.kind}`)}</dd></div>
                <div><dt className="text-zinc-500">{t("map.d.place")}</dt><dd dir="auto" className="font-semibold text-zinc-800 dark:text-zinc-100">{sel.title}</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-zinc-500">{t("map.d.size")}</dt><dd dir="ltr" className="font-semibold">{describe(sel)}</dd></div>
                {sel.depthKm !== null && <div className="flex justify-between gap-2"><dt className="text-zinc-500">{t("map.d.depth")}</dt><dd dir="ltr">{km(sel.depthKm)}</dd></div>}
                <div className="flex justify-between gap-2"><dt className="text-zinc-500">{t("map.d.time")}</dt><dd dir="ltr">{f.dateTime(sel.timeMs, "UTC")} UTC</dd></div>
                <div className="flex justify-between gap-2"><dt className="text-zinc-500">{t("map.d.distance", { city: d.place.name })}</dt><dd dir="ltr" className="font-bold text-blue-700 dark:text-blue-300">{km(sel.distanceKm)}</dd></div>
                {sel.tsunami && <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{t("map.d.tsunami")}</p>}
                <div className="flex justify-between gap-2"><dt className="text-zinc-500">{t("map.d.source")}</dt><dd>{sel.source}</dd></div>
                {sel.url && (
                  <a href={sel.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 underline dark:text-blue-300">
                    {t("map.d.open")} <ExternalLink size={13} />
                  </a>
                )}
              </dl>
            ) : (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t("map.pick")}</p>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700">
            <p className="border-b border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{t("map.nearest", { city: d.place.name })}</p>
            <ul className="max-h-[220px] overflow-y-auto text-sm">
              {near.slice(0, 8).map((h) => (
                <li key={h.id}>
                  <button type="button" onClick={() => setSelected(h.id)} className={`flex w-full items-center gap-2 px-3 py-1.5 text-start ${selected === h.id ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"}`}>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: EVENT_COLORS[h.kind] }} />
                    <span dir="auto" className="min-w-0 flex-1 truncate">{h.title}</span>
                    <span dir="ltr" className="shrink-0 text-xs text-zinc-500">{km(h.distanceKm)}</span>
                  </button>
                </li>
              ))}
              {snap && near.length === 0 && <li className="px-3 py-2 text-zinc-500">{t("map.none")}</li>}
            </ul>
          </div>

          {hottest && coldest && (
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg bg-red-50 p-2 dark:bg-red-500/10"><p className="text-zinc-500">{t("map.hottest")}</p><p className="font-bold">{hottest.name} {hottest.label}</p></div>
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-500/10"><p className="text-zinc-500">{t("map.coldest")}</p><p className="font-bold">{coldest.name} {coldest.label}</p></div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-300">
        <span dir="ltr" className="flex items-center gap-1">
          {TEMP_STOPS.map(([c, col]) => (
            <span key={c} className="flex flex-col items-center"><span className="h-2 w-6" style={{ background: col }} /><span className="text-[9px]">{f.deg(c)}</span></span>
          ))}
        </span>
        <span className="flex items-center gap-1">
          {[4.5, 6, 7.5].map((m) => (
            <span key={m} className="inline-block rounded-full border border-red-600 bg-red-600/40" style={{ width: (3 + (m - 2.5) * 3.1) * 2, height: (3 + (m - 2.5) * 3.1) * 2 }} />
          ))}
          {t("map.quakeScale")}
        </span>
      </div>
      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">{t("map.safety")}</p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {t("map.limits")}
        {snap && ` ${t("map.fetched", { time: f.dateTime(snap.fetchedAt, d.place.zone) })}`}
      </p>
      <WxCredits className="mt-3" hazards />
    </SectionCard>
  );
}
