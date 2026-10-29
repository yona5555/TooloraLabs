import { parseEonetFeed, parseUsgsFeed, type EonetFeed, type Hazard, type UsgsFeed } from "@tooloralabs/tools";
import { cachedJson } from "./upstream";
import { dataNow } from "@/lib/data-clock";

/** USGS: M4.5+ earthquakes of the past 7 days (public domain, "courtesy of the U.S. Geological Survey"). */
const USGS_FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
/** NASA EONET v3: open wildfire, severe-storm and volcano events (NASA data CC0; linked sources keep their own terms). */
const EONET_EVENTS = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires,severeStorms,volcanoes&limit=300";

export type HazardSnapshot = { hazards: Hazard[]; quakesOk: boolean; eventsOk: boolean; fetchedAt: number; expires: number };

export async function getHazards(): Promise<HazardSnapshot> {
  const [q, e] = await Promise.allSettled([
    cachedJson<UsgsFeed>(USGS_FEED, { minTtlMs: 5 * 60_000, fallbackTtlMs: 5 * 60_000 }),
    cachedJson<EonetFeed>(EONET_EVENTS, { minTtlMs: 15 * 60_000, fallbackTtlMs: 30 * 60_000 }),
  ]);
  const quakes = q.status === "fulfilled" ? parseUsgsFeed(q.value.data) : [];
  const events = e.status === "fulfilled" ? parseEonetFeed(e.value.data) : [];
  const expiries = [q, e].filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<{ expires: number }>).value.expires);
  return {
    hazards: [...quakes, ...events],
    quakesOk: q.status === "fulfilled",
    eventsOk: e.status === "fulfilled",
    fetchedAt: dataNow(),
    expires: expiries.length ? Math.min(...expiries) : Date.now() + 60_000,
  };
}
