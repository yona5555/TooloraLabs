/**
 * Live natural-hazard events for the weather map: USGS earthquake GeoJSON feeds (public domain)
 * and NASA EONET v3 events (wildfires, severe storms, volcanoes). Only identifiers, positions,
 * magnitudes and links are kept — EONET's non-NASA sources are linked, never copied.
 */
import { haversineKm } from "./WeatherScience";

export type HazardKind = "earthquake" | "wildfire" | "storm" | "volcano";

export type Hazard = {
  id: string;
  kind: HazardKind;
  title: string;
  lat: number;
  lon: number;
  /** Event time (earthquake origin time, or the latest EONET observation). */
  timeMs: number;
  magnitude: number | null;
  magnitudeUnit: string | null;
  /** Earthquake depth in km. */
  depthKm: number | null;
  /** USGS flags a possible tsunami for large oceanic events. */
  tsunami: boolean;
  /** Link to the original source page. */
  url: string | null;
  /** Who produced the record (USGS, or the EONET source id such as "JTWC", "IRWIN"). */
  source: string;
};

type UsgsFeature = {
  id: string;
  properties: { mag: number | null; place: string | null; time: number; url: string | null; title: string | null; tsunami: number | null };
  geometry: { coordinates: [number, number, number] };
};
export type UsgsFeed = { features?: UsgsFeature[] };

export function parseUsgsFeed(json: UsgsFeed): Hazard[] {
  return (json?.features ?? [])
    .filter((f) => Array.isArray(f?.geometry?.coordinates))
    .map((f) => ({
      id: `usgs-${f.id}`,
      kind: "earthquake" as const,
      title: f.properties.place ?? f.properties.title ?? "",
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      timeMs: f.properties.time,
      magnitude: typeof f.properties.mag === "number" ? f.properties.mag : null,
      magnitudeUnit: null,
      depthKm: typeof f.geometry.coordinates[2] === "number" ? f.geometry.coordinates[2] : null,
      tsunami: f.properties.tsunami === 1,
      url: f.properties.url,
      source: "USGS",
    }));
}

type EonetGeometry = { date: string; type: string; coordinates: unknown; magnitudeValue?: number | null; magnitudeUnit?: string | null };
type EonetEvent = {
  id: string;
  title: string;
  categories: { id: string }[];
  sources: { id: string; url: string }[];
  geometry: EonetGeometry[];
};
export type EonetFeed = { events?: EonetEvent[] };

const EONET_KINDS: Record<string, HazardKind> = { wildfires: "wildfire", severeStorms: "storm", volcanoes: "volcano" };

function pointOf(g: EonetGeometry): [number, number] | null {
  if (g.type === "Point" && Array.isArray(g.coordinates)) return g.coordinates as [number, number];
  if (g.type === "Polygon" && Array.isArray(g.coordinates)) {
    const ring = (g.coordinates as [number, number][][])[0] ?? [];
    if (ring.length === 0) return null;
    const lon = ring.reduce((a, p) => a + p[0], 0) / ring.length;
    const lat = ring.reduce((a, p) => a + p[1], 0) / ring.length;
    return [lon, lat];
  }
  return null;
}

export function parseEonetFeed(json: EonetFeed): Hazard[] {
  const out: Hazard[] = [];
  for (const e of json?.events ?? []) {
    const kind = e.categories.map((c) => EONET_KINDS[c.id]).find(Boolean);
    if (!kind || !e.geometry?.length) continue;
    const latest = [...e.geometry].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
    const pt = pointOf(latest);
    if (!pt) continue;
    out.push({
      id: `eonet-${e.id}`,
      kind,
      title: e.title,
      lon: pt[0],
      lat: pt[1],
      timeMs: Date.parse(latest.date),
      magnitude: typeof latest.magnitudeValue === "number" ? latest.magnitudeValue : null,
      magnitudeUnit: latest.magnitudeUnit ?? null,
      depthKm: null,
      tsunami: false,
      url: e.sources?.[0]?.url ?? null,
      source: e.sources?.[0]?.id ?? "EONET",
    });
  }
  return out;
}

/** Circle radius (px) for an earthquake marker: grows with magnitude, 3 px at M2.5 to 20 px at M8+. */
export function quakeRadius(magnitude: number | null): number {
  const m = magnitude ?? 2.5;
  return Math.round(Math.min(20, Math.max(3, 3 + (m - 2.5) * 3.1)) * 10) / 10;
}

export type HazardWithDistance = Hazard & { distanceKm: number };

/** Events sorted by distance from a point, nearest first. */
export function hazardsByDistance(list: Hazard[], point: { lat: number; lon: number }): HazardWithDistance[] {
  return list
    .map((h) => ({ ...h, distanceKm: haversineKm(point, { lat: h.lat, lon: h.lon }) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function countHazards(list: Hazard[]): Record<HazardKind, number> {
  const c: Record<HazardKind, number> = { earthquake: 0, wildfire: 0, storm: 0, volcano: 0 };
  for (const h of list) c[h.kind]++;
  return c;
}
