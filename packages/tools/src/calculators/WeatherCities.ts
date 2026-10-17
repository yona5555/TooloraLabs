/**
 * Curated city list for the Weather Forecast tool (no external geocoder): the World Time
 * catalogue's single-city entries plus more Arab and world cities, each with coordinates, IANA zone
 * and names in all six site locales. Pure data and lookups; no DOM.
 */
import { WT_CITIES } from "./WorldTimeCities";
import { wtCityNameVariants, wtLocalizedCityName } from "./WorldTimeCityNames";

export type WxLocale = "en" | "ar" | "es" | "fr" | "de" | "hi";

export type WxCity = {
  id: string;
  name: Record<WxLocale, string>;
  country: string;
  lat: number;
  lon: number;
  zone: string;
  /** Shown on the world map's temperature layer. */
  onMap: boolean;
};

const slug = (en: string) =>
  en
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** World Time entries that name two cities in one zone are replaced by single cities below. */
const SKIP = new Set(["Asia/Shanghai", "Asia/Kolkata"]);

type Extra = [en: string, ar: string, es: string, fr: string, de: string, hi: string, country: string, lat: number, lon: number, zone: string];

const EXTRA: Extra[] = [
  ["Beijing", "بكين", "Pekín", "Pékin", "Peking", "बीजिंग", "CN", 39.9, 116.41, "Asia/Shanghai"],
  ["Shanghai", "شنغهاي", "Shanghái", "Shanghai", "Shanghai", "शंघाई", "CN", 31.23, 121.47, "Asia/Shanghai"],
  ["Mumbai", "مومباي", "Bombay", "Bombay", "Mumbai", "मुंबई", "IN", 19.08, 72.88, "Asia/Kolkata"],
  ["New Delhi", "نيودلهي", "Nueva Delhi", "New Delhi", "Neu-Delhi", "नई दिल्ली", "IN", 28.61, 77.21, "Asia/Kolkata"],
  ["Jeddah", "جدة", "Yeda", "Djeddah", "Dschidda", "जेद्दा", "SA", 21.49, 39.19, "Asia/Riyadh"],
  ["Mecca", "مكة المكرمة", "La Meca", "La Mecque", "Mekka", "मक्का", "SA", 21.42, 39.83, "Asia/Riyadh"],
  ["Medina", "المدينة المنورة", "Medina", "Médine", "Medina", "मदीना", "SA", 24.47, 39.61, "Asia/Riyadh"],
  ["Dammam", "الدمام", "Dammam", "Dammam", "Dammam", "दम्माम", "SA", 26.43, 50.1, "Asia/Riyadh"],
  ["Abha", "أبها", "Abha", "Abha", "Abha", "आभा", "SA", 18.22, 42.51, "Asia/Riyadh"],
  ["Tabuk", "تبوك", "Tabuk", "Tabouk", "Tabuk", "तबूक", "SA", 28.38, 36.57, "Asia/Riyadh"],
  ["Abu Dhabi", "أبوظبي", "Abu Dabi", "Abou Dabi", "Abu Dhabi", "अबू धाबी", "AE", 24.45, 54.38, "Asia/Dubai"],
  ["Sharjah", "الشارقة", "Sharjah", "Charjah", "Schardscha", "शारजाह", "AE", 25.35, 55.39, "Asia/Dubai"],
  ["Alexandria", "الإسكندرية", "Alejandría", "Alexandrie", "Alexandria", "अलेक्ज़ेंड्रिया", "EG", 31.2, 29.92, "Africa/Cairo"],
  ["Sanaa", "صنعاء", "Saná", "Sanaa", "Sanaa", "सना", "YE", 15.37, 44.19, "Asia/Aden"],
  ["Aden", "عدن", "Adén", "Aden", "Aden", "अदन", "YE", 12.79, 45.03, "Asia/Aden"],
  ["Khartoum", "الخرطوم", "Jartum", "Khartoum", "Khartum", "ख़ार्तूम", "SD", 15.5, 32.56, "Africa/Khartoum"],
  ["Tripoli", "طرابلس", "Trípoli", "Tripoli", "Tripolis", "त्रिपोली", "LY", 32.89, 13.19, "Africa/Tripoli"],
  ["Benghazi", "بنغازي", "Bengasi", "Benghazi", "Bengasi", "बेनगाज़ी", "LY", 32.12, 20.09, "Africa/Tripoli"],
  ["Rabat", "الرباط", "Rabat", "Rabat", "Rabat", "रबात", "MA", 34.02, -6.84, "Africa/Casablanca"],
  ["Marrakesh", "مراكش", "Marrakech", "Marrakech", "Marrakesch", "मराकेश", "MA", 31.63, -7.99, "Africa/Casablanca"],
  ["Nouakchott", "نواكشوط", "Nuakchot", "Nouakchott", "Nouakchott", "नुआकशोत", "MR", 18.08, -15.98, "Africa/Nouakchott"],
  ["Mogadishu", "مقديشو", "Mogadiscio", "Mogadiscio", "Mogadischu", "मोगादिशु", "SO", 2.05, 45.32, "Africa/Mogadishu"],
  ["Djibouti", "جيبوتي", "Yibuti", "Djibouti", "Dschibuti", "जिबूती", "DJ", 11.59, 43.15, "Africa/Djibouti"],
  ["Basra", "البصرة", "Basora", "Bassorah", "Basra", "बसरा", "IQ", 30.51, 47.78, "Asia/Baghdad"],
  ["Erbil", "أربيل", "Erbil", "Erbil", "Erbil", "अरबील", "IQ", 36.19, 44.01, "Asia/Baghdad"],
  ["Aleppo", "حلب", "Alepo", "Alep", "Aleppo", "अलेप्पो", "SY", 36.2, 37.13, "Asia/Damascus"],
  ["Oran", "وهران", "Orán", "Oran", "Oran", "ओरान", "DZ", 35.7, -0.63, "Africa/Algiers"],
  ["Salalah", "صلالة", "Salalah", "Salalah", "Salala", "सलालाह", "OM", 17.02, 54.09, "Asia/Muscat"],
  ["Lisbon", "لشبونة", "Lisboa", "Lisbonne", "Lissabon", "लिस्बन", "PT", 38.72, -9.14, "Europe/Lisbon"],
  ["Vienna", "فيينا", "Viena", "Vienne", "Wien", "वियना", "AT", 48.21, 16.37, "Europe/Vienna"],
  ["Lima", "ليما", "Lima", "Lima", "Lima", "लीमा", "PE", -12.05, -77.04, "America/Lima"],
  ["Cape Town", "كيب تاون", "Ciudad del Cabo", "Le Cap", "Kapstadt", "केप टाउन", "ZA", -33.92, 18.42, "Africa/Johannesburg"],
  ["Addis Ababa", "أديس أبابا", "Adís Abeba", "Addis-Abeba", "Addis Abeba", "अदीस अबाबा", "ET", 9.03, 38.74, "Africa/Addis_Ababa"],
  ["Melbourne", "ملبورن", "Melbourne", "Melbourne", "Melbourne", "मेलबर्न", "AU", -37.81, 144.96, "Australia/Melbourne"],
  ["Miami", "ميامي", "Miami", "Miami", "Miami", "मियामी", "US", 25.76, -80.19, "America/New_York"],
];

/** Cities drawn on the world map's temperature layer (spread across every inhabited continent). */
const MAP_IDS = new Set([
  "riyadh", "jeddah", "dubai", "doha", "kuwait-city", "cairo", "baghdad", "amman", "casablanca", "algiers", "khartoum",
  "london", "paris", "berlin", "madrid", "rome", "moscow", "istanbul", "stockholm", "reykjavik",
  "new-delhi", "beijing", "tokyo", "seoul", "bangkok", "jakarta", "singapore", "karachi",
  "sydney", "perth", "auckland", "nairobi", "lagos", "johannesburg", "addis-ababa",
  "new-york", "los-angeles", "chicago", "toronto", "mexico-city", "bogota", "lima", "sao-paulo", "buenos-aires", "anchorage", "honolulu",
]);

function fromWorldTime(): WxCity[] {
  return WT_CITIES.filter((c) => !SKIP.has(c.zone)).map((c) => ({
    id: slug(c.name.en),
    name: {
      en: c.name.en,
      ar: c.name.ar,
      es: wtLocalizedCityName(c.name.en, c.name.ar, "es"),
      fr: wtLocalizedCityName(c.name.en, c.name.ar, "fr"),
      de: wtLocalizedCityName(c.name.en, c.name.ar, "de"),
      hi: wtLocalizedCityName(c.name.en, c.name.ar, "hi"),
    },
    country: c.country,
    lat: c.lat,
    lon: c.lon,
    zone: c.zone,
    onMap: false,
  }));
}

export const WX_CITIES: WxCity[] = [
  ...fromWorldTime(),
  ...EXTRA.map(([en, ar, es, fr, de, hi, country, lat, lon, zone]) => ({
    id: slug(en),
    name: { en, ar, es, fr, de, hi },
    country,
    lat,
    lon,
    zone,
    onMap: false,
  })),
].map((c) => ({ ...c, onMap: MAP_IDS.has(c.id) }));

const BY_ID = new Map(WX_CITIES.map((c) => [c.id, c]));

export function wxFindCity(id: string): WxCity | undefined {
  return BY_ID.get(id);
}

export function wxCityName(city: WxCity, locale: string): string {
  return city.name[(locale in city.name ? locale : "en") as WxLocale];
}

/** Default city per site locale (Riyadh for Arabic). */
export const WX_DEFAULT_CITY: Record<WxLocale, string> = {
  ar: "riyadh",
  en: "new-york",
  es: "madrid",
  fr: "paris",
  de: "berlin",
  hi: "new-delhi",
};

export function wxDefaultCity(locale: string): WxCity {
  return BY_ID.get(WX_DEFAULT_CITY[locale as WxLocale] ?? "new-york") ?? WX_CITIES[0];
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .toLowerCase()
    .trim();

/** Accent- and case-insensitive search across every locale's name; prefix matches rank first. */
export function wxSearchCities(query: string): WxCity[] {
  const q = fold(query);
  if (!q) return WX_CITIES;
  const scored: { c: WxCity; score: number }[] = [];
  for (const c of WX_CITIES) {
    const names = [...Object.values(c.name), ...wtCityNameVariants(c.name.en)].map(fold);
    if (names.some((n) => n.startsWith(q))) scored.push({ c, score: 0 });
    else if (names.some((n) => n.includes(q))) scored.push({ c, score: 1 });
  }
  return scored.sort((a, b) => a.score - b.score).map((x) => x.c);
}
