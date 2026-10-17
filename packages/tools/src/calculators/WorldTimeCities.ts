/**
 * City catalogue for the World Time Converter: IANA zone, ISO country code (names come from
 * Intl.DisplayNames in the UI, so every locale gets a native country name), coordinates for the
 * day/night map and sun times, and the official weekend used by the meeting planner.
 * Pure data and lookups; no DOM.
 */
import { weekendDays, type WeekendPreset } from "./DateTimeCore";

/** "thu-fri" covers Iran's government week; everything else is one of the shared presets. */
export type WtCityWeekend = WeekendPreset | "thu-fri";

export type WtCity = {
  /** Unique id: the IANA zone identifier (one canonical city per zone). */
  id: string;
  zone: string;
  name: { en: string; ar: string };
  /** ISO 3166-1 alpha-2 region code. */
  country: string;
  lat: number;
  lon: number;
  weekend: WtCityWeekend;
};

/** Weekday numbers (0 = Sunday … 6 = Saturday) that are the weekend for a preset. */
export function wtWeekendDays(w: WtCityWeekend): readonly number[] {
  return w === "thu-fri" ? [4, 5] : weekendDays(w);
}

// Weekend by country: Fri–Sat in Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, Iraq, Jordan,
// Syria, Algeria and Bangladesh; the UAE moved to Sat–Sun in January 2022.
const FRI_SAT = new Set(["SA", "QA", "KW", "BH", "OM", "EG", "IQ", "JO", "SY", "DZ", "BD"]);
const THU_FRI = new Set(["IR"]);

type Row = [zone: string, en: string, ar: string, country: string, lat: number, lon: number];

const ROWS: Row[] = [
  ["America/New_York", "New York", "نيويورك", "US", 40.71, -74.01],
  ["Europe/London", "London", "لندن", "GB", 51.51, -0.13],
  ["Asia/Dubai", "Dubai", "دبي", "AE", 25.2, 55.27],
  ["Asia/Riyadh", "Riyadh", "الرياض", "SA", 24.71, 46.68],
  ["Asia/Tokyo", "Tokyo", "طوكيو", "JP", 35.68, 139.69],
  ["Asia/Shanghai", "Beijing / Shanghai", "بكين / شنغهاي", "CN", 31.23, 121.47],
  ["Asia/Singapore", "Singapore", "سنغافورة", "SG", 1.35, 103.82],
  ["Australia/Sydney", "Sydney", "سيدني", "AU", -33.87, 151.21],
  ["Europe/Paris", "Paris", "باريس", "FR", 48.86, 2.35],
  ["Europe/Berlin", "Berlin", "برلين", "DE", 52.52, 13.4],
  ["America/Los_Angeles", "Los Angeles", "لوس أنجلوس", "US", 34.05, -118.24],
  ["America/Chicago", "Chicago", "شيكاغو", "US", 41.88, -87.63],
  ["Asia/Kolkata", "Mumbai / Delhi", "مومباي / دلهي", "IN", 19.08, 72.88],
  ["Africa/Cairo", "Cairo", "القاهرة", "EG", 30.04, 31.24],
  ["Europe/Istanbul", "Istanbul", "إسطنبول", "TR", 41.01, 28.98],
  ["Europe/Moscow", "Moscow", "موسكو", "RU", 55.76, 37.62],
  ["America/Sao_Paulo", "São Paulo", "ساو باولو", "BR", -23.55, -46.63],
  ["America/Mexico_City", "Mexico City", "مكسيكو سيتي", "MX", 19.43, -99.13],
  ["America/Toronto", "Toronto", "تورنتو", "CA", 43.65, -79.38],
  ["Asia/Hong_Kong", "Hong Kong", "هونغ كونغ", "HK", 22.32, 114.17],
  ["Asia/Seoul", "Seoul", "سول", "KR", 37.57, 126.98],
  ["Asia/Bangkok", "Bangkok", "بانكوك", "TH", 13.76, 100.5],
  ["Asia/Jakarta", "Jakarta", "جاكرتا", "ID", -6.21, 106.85],
  ["Asia/Kuala_Lumpur", "Kuala Lumpur", "كوالالمبور", "MY", 3.14, 101.69],
  ["Asia/Karachi", "Karachi", "كراتشي", "PK", 24.86, 67.0],
  ["Asia/Dhaka", "Dhaka", "دكا", "BD", 23.81, 90.41],
  ["Asia/Manila", "Manila", "مانيلا", "PH", 14.6, 120.98],
  ["Asia/Ho_Chi_Minh", "Ho Chi Minh City", "هو تشي منه", "VN", 10.82, 106.63],
  ["Asia/Tehran", "Tehran", "طهران", "IR", 35.69, 51.39],
  ["Asia/Baghdad", "Baghdad", "بغداد", "IQ", 33.31, 44.37],
  ["Asia/Amman", "Amman", "عمّان", "JO", 31.95, 35.93],
  ["Asia/Beirut", "Beirut", "بيروت", "LB", 33.89, 35.5],
  ["Asia/Damascus", "Damascus", "دمشق", "SY", 33.51, 36.28],
  ["Asia/Qatar", "Doha", "الدوحة", "QA", 25.29, 51.53],
  ["Asia/Kuwait", "Kuwait City", "مدينة الكويت", "KW", 29.38, 47.98],
  ["Asia/Bahrain", "Manama", "المنامة", "BH", 26.23, 50.59],
  ["Asia/Muscat", "Muscat", "مسقط", "OM", 23.59, 58.41],
  ["Africa/Casablanca", "Casablanca", "الدار البيضاء", "MA", 33.57, -7.59],
  ["Africa/Algiers", "Algiers", "الجزائر", "DZ", 36.75, 3.06],
  ["Africa/Tunis", "Tunis", "تونس", "TN", 36.81, 10.18],
  ["Africa/Lagos", "Lagos", "لاغوس", "NG", 6.52, 3.38],
  ["Africa/Nairobi", "Nairobi", "نيروبي", "KE", -1.29, 36.82],
  ["Africa/Johannesburg", "Johannesburg", "جوهانسبرغ", "ZA", -26.2, 28.05],
  ["Europe/Madrid", "Madrid", "مدريد", "ES", 40.42, -3.7],
  ["Europe/Rome", "Rome", "روما", "IT", 41.9, 12.5],
  ["Europe/Amsterdam", "Amsterdam", "أمستردام", "NL", 52.37, 4.9],
  ["Europe/Zurich", "Zurich", "زيورخ", "CH", 47.38, 8.54],
  ["Europe/Stockholm", "Stockholm", "ستوكهولم", "SE", 59.33, 18.07],
  ["Europe/Athens", "Athens", "أثينا", "GR", 37.98, 23.73],
  ["Europe/Warsaw", "Warsaw", "وارسو", "PL", 52.23, 21.01],
  ["Pacific/Auckland", "Auckland", "أوكلاند", "NZ", -36.85, 174.76],
  ["Australia/Perth", "Perth", "بيرث", "AU", -31.95, 115.86],
  ["America/Denver", "Denver", "دنفر", "US", 39.74, -104.99],
  ["America/Vancouver", "Vancouver", "فانكوفر", "CA", 49.28, -123.12],
  ["America/Bogota", "Bogotá", "بوغوتا", "CO", 4.71, -74.07],
  ["America/Argentina/Buenos_Aires", "Buenos Aires", "بوينس آيرس", "AR", -34.6, -58.38],
  ["Pacific/Honolulu", "Honolulu", "هونولولو", "US", 21.31, -157.86],
  ["America/Anchorage", "Anchorage", "أنكوريج", "US", 61.22, -149.9],
  ["Atlantic/Reykjavik", "Reykjavík", "ريكيافيك", "IS", 64.15, -21.94],
  ["Asia/Kathmandu", "Kathmandu", "كاتماندو", "NP", 27.72, 85.32],
  ["Australia/Adelaide", "Adelaide", "أديلايد", "AU", -34.93, 138.6],
  ["America/St_Johns", "St. John's", "سانت جونز", "CA", 47.56, -52.71],
];

export const WT_CITIES: WtCity[] = ROWS.map(([zone, en, ar, country, lat, lon]) => ({
  id: zone,
  zone,
  name: { en, ar },
  country,
  lat,
  lon,
  weekend: FRI_SAT.has(country) ? "fri-sat" : THU_FRI.has(country) ? "thu-fri" : "sat-sun",
}));

const BY_ID = new Map(WT_CITIES.map((c) => [c.id, c]));

export function wtFindCity(id: string): WtCity | undefined {
  return BY_ID.get(id);
}

/** Case-insensitive search on English/Arabic city names, the zone id and extra (localized) names. */
export function wtSearchCities(query: string, extraName?: (c: WtCity) => string): WtCity[] {
  const q = query.trim().toLowerCase();
  if (!q) return WT_CITIES;
  return WT_CITIES.filter(
    (c) =>
      c.name.en.toLowerCase().includes(q) ||
      c.name.ar.includes(q) ||
      c.zone.toLowerCase().includes(q) ||
      (extraName ? extraName(c).toLowerCase().includes(q) : false),
  );
}
