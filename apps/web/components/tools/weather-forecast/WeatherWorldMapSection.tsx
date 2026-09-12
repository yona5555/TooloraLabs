import { WORLD_MAP_CITIES, getWorldMapSnapshot } from "@/lib/weather/open-meteo";
import WeatherWorldMap from "./WeatherWorldMap";

/**
 * Server-side data fetch for the world map, kept as its own component (like
 * `education`) so it can be rendered as a prop passed into the client
 * `WeatherTracker` — placed directly after the above-the-fold panel rather
 * than buried inside the encyclopedia section below.
 */
export default async function WeatherWorldMapSection() {
  const cities = await getWorldMapSnapshot(WORLD_MAP_CITIES).catch(() => []);
  return <WeatherWorldMap cities={cities} />;
}
