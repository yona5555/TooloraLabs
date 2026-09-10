export type { WorldCity } from "@/lib/worldtime/cities";

export type WorldTimeScenario = { key: string; fromCityId: string; toCityId: string };

/** Real, commonly-searched city pairs spanning very different offsets and DST behavior. */
export const WORLD_TIME_SCENARIOS: WorldTimeScenario[] = [
  { key: "nyToTokyo", fromCityId: "America/New_York", toCityId: "Asia/Tokyo" },
  { key: "londonToSydney", fromCityId: "Europe/London", toCityId: "Australia/Sydney" },
  { key: "laToDubai", fromCityId: "America/Los_Angeles", toCityId: "Asia/Dubai" },
];
