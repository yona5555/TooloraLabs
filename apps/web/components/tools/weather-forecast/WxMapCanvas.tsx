"use client";
import { useEffect, useRef } from "react";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { quakeRadius, type Hazard } from "@tooloralabs/tools";
import { EVENT_COLORS, TEMP_STOPS, type MapCity, type MapLayers } from "./wx";

type Props = {
  cities: MapCity[];
  hazards: Hazard[];
  layers: MapLayers;
  center: { lat: number; lon: number };
  dark: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
};

/** OpenFreeMap vector styles (commercial use allowed, attribution added by MapLibre). Never the OSM tile servers. */
const STYLE = { light: "https://tiles.openfreemap.org/styles/positron", dark: "https://tiles.openfreemap.org/styles/dark" };

const fc = (features: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({ type: "FeatureCollection", features });
const point = (lon: number, lat: number, properties: Record<string, unknown>): GeoJSON.Feature => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [lon, lat] },
  properties,
});

function cityData(cities: MapCity[]) {
  return fc(cities.map((c) => point(c.lon, c.lat, { id: c.id, t: c.tempC, label: c.label })));
}
function hazardData(hazards: Hazard[], kind: Hazard["kind"]) {
  return fc(hazards.filter((h) => h.kind === kind).map((h) => point(h.lon, h.lat, { id: h.id, r: quakeRadius(h.magnitude) })));
}

const HAZARD_KINDS = ["earthquake", "wildfire", "storm", "volcano"] as const;

/** MapLibre canvas: temperature layer for the curated cities plus USGS / EONET hazard layers. */
export default function WxMapCanvas({ cities, hazards, layers, center, dark, selectedId, onSelect, ariaLabel }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const ready = useRef(false);
  const latest = useRef({ cities, hazards, layers, selectedId, onSelect });
  useEffect(() => {
    latest.current = { cities, hazards, layers, selectedId, onSelect };
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ml = await import("maplibre-gl");
      if (cancelled || !el.current) return;
      // Bundling moves maplibre-gl.mjs, so its sibling-file worker lookup breaks; point it at the bundled worker asset.
      ml.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);
      const m = new ml.Map({
        container: el.current,
        style: dark ? STYLE.dark : STYLE.light,
        center: [center.lon, center.lat],
        zoom: 1.4,
        minZoom: 0.8,
        maxZoom: 9,
        attributionControl: { compact: false },
        cooperativeGestures: true,
      });
      map.current = m;
      m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      m.on("load", () => {
        const { cities: cs, hazards: hz } = latest.current;
        const tempColor: unknown[] = ["interpolate", ["linear"], ["get", "t"], ...TEMP_STOPS.flat()];
        m.addSource("wx-cities", { type: "geojson", data: cityData(cs) });
        m.addLayer({
          id: "wx-temperature",
          type: "circle",
          source: "wx-cities",
          paint: { "circle-radius": 13, "circle-color": tempColor as never, "circle-opacity": 0.88, "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.2 },
        });
        m.addLayer({
          id: "wx-temperature-label",
          type: "symbol",
          source: "wx-cities",
          layout: { "text-field": ["get", "label"], "text-font": ["Noto Sans Bold"], "text-size": 10, "text-allow-overlap": true },
          paint: { "text-color": "#ffffff" },
        });
        for (const kind of HAZARD_KINDS) {
          m.addSource(`wx-${kind}`, { type: "geojson", data: hazardData(hz, kind) });
          m.addLayer({
            id: `wx-${kind}`,
            type: "circle",
            source: `wx-${kind}`,
            paint: {
              "circle-radius": kind === "earthquake" ? ["get", "r"] : 6,
              "circle-color": EVENT_COLORS[kind],
              "circle-opacity": kind === "earthquake" ? 0.45 : 0.85,
              "circle-stroke-color": kind === "earthquake" ? EVENT_COLORS.earthquake : "#ffffff",
              "circle-stroke-width": 1.5,
            },
          });
          m.on("click", `wx-${kind}`, (e) => {
            const id = e.features?.[0]?.properties?.id;
            if (typeof id === "string") latest.current.onSelect(id);
          });
          m.on("mouseenter", `wx-${kind}`, () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", `wx-${kind}`, () => (m.getCanvas().style.cursor = ""));
        }
        m.addSource("wx-selected", { type: "geojson", data: fc([]) });
        m.addLayer({
          id: "wx-selected",
          type: "circle",
          source: "wx-selected",
          paint: { "circle-radius": 16, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": "#2563eb", "circle-stroke-width": 3 },
        });
        ready.current = true;
        sync();
      });
    })();
    return () => {
      cancelled = true;
      ready.current = false;
      map.current?.remove();
      map.current = null;
    };
    // The map is rebuilt only when the theme flips (new base style); data changes are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  function sync() {
    const m = map.current;
    if (!m || !ready.current) return;
    const { cities: cs, hazards: hz, layers: ly, selectedId: sel } = latest.current;
    (m.getSource("wx-cities") as GeoJSONSource | undefined)?.setData(cityData(cs));
    for (const kind of HAZARD_KINDS) {
      (m.getSource(`wx-${kind}`) as GeoJSONSource | undefined)?.setData(hazardData(hz, kind));
      m.setLayoutProperty(`wx-${kind}`, "visibility", ly[kind] ? "visible" : "none");
    }
    m.setLayoutProperty("wx-temperature", "visibility", ly.temperature ? "visible" : "none");
    m.setLayoutProperty("wx-temperature-label", "visibility", ly.temperature ? "visible" : "none");
    const h = hz.find((x) => x.id === sel);
    (m.getSource("wx-selected") as GeoJSONSource | undefined)?.setData(fc(h ? [point(h.lon, h.lat, {})] : []));
  }

  useEffect(sync, [cities, hazards, layers, selectedId]);

  useEffect(() => {
    map.current?.easeTo({ center: [center.lon, center.lat], duration: 900 });
  }, [center.lat, center.lon]);

  useEffect(() => {
    const h = hazards.find((x) => x.id === selectedId);
    if (h) map.current?.easeTo({ center: [h.lon, h.lat], zoom: Math.max(map.current.getZoom(), 3), duration: 900 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={el} role="region" aria-label={ariaLabel} className="h-full w-full" style={{ direction: "ltr" }} />;
}
