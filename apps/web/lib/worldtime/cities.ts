export type WorldCity = {
  /** Unique id — the IANA zone identifier itself, since each entry represents one canonical city per zone. */
  id: string;
  ianaZone: string;
  city: { en: string; ar: string };
  country: { en: string; ar: string };
};

/**
 * IANA zone identifiers and country names are stable public reference data
 * (the same tz database `Intl.DateTimeFormat` itself reads), so it's safe to
 * curate locally rather than fetch. Ordered with major global hubs first —
 * these double as the tool's above-the-fold defaults and the initial rows of
 * the world clock — followed by broad, genuinely international coverage
 * across every inhabited continent, not just one region.
 */
export const WORLD_CITIES: WorldCity[] = [
  { id: "America/New_York", ianaZone: "America/New_York", city: { en: "New York", ar: "نيويورك" }, country: { en: "United States", ar: "الولايات المتحدة" } },
  { id: "Europe/London", ianaZone: "Europe/London", city: { en: "London", ar: "لندن" }, country: { en: "United Kingdom", ar: "المملكة المتحدة" } },
  { id: "Asia/Dubai", ianaZone: "Asia/Dubai", city: { en: "Dubai", ar: "دبي" }, country: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" } },
  { id: "Asia/Riyadh", ianaZone: "Asia/Riyadh", city: { en: "Riyadh", ar: "الرياض" }, country: { en: "Saudi Arabia", ar: "السعودية" } },
  { id: "Asia/Tokyo", ianaZone: "Asia/Tokyo", city: { en: "Tokyo", ar: "طوكيو" }, country: { en: "Japan", ar: "اليابان" } },
  { id: "Asia/Shanghai", ianaZone: "Asia/Shanghai", city: { en: "Beijing / Shanghai", ar: "بكين / شنغهاي" }, country: { en: "China", ar: "الصين" } },
  { id: "Asia/Singapore", ianaZone: "Asia/Singapore", city: { en: "Singapore", ar: "سنغافورة" }, country: { en: "Singapore", ar: "سنغافورة" } },
  { id: "Australia/Sydney", ianaZone: "Australia/Sydney", city: { en: "Sydney", ar: "سيدني" }, country: { en: "Australia", ar: "أستراليا" } },
  { id: "Europe/Paris", ianaZone: "Europe/Paris", city: { en: "Paris", ar: "باريس" }, country: { en: "France", ar: "فرنسا" } },
  { id: "Europe/Berlin", ianaZone: "Europe/Berlin", city: { en: "Berlin", ar: "برلين" }, country: { en: "Germany", ar: "ألمانيا" } },
  { id: "America/Los_Angeles", ianaZone: "America/Los_Angeles", city: { en: "Los Angeles", ar: "لوس أنجلوس" }, country: { en: "United States", ar: "الولايات المتحدة" } },
  { id: "America/Chicago", ianaZone: "America/Chicago", city: { en: "Chicago", ar: "شيكاغو" }, country: { en: "United States", ar: "الولايات المتحدة" } },
  { id: "Asia/Kolkata", ianaZone: "Asia/Kolkata", city: { en: "Mumbai / Delhi", ar: "مومباي / دلهي" }, country: { en: "India", ar: "الهند" } },
  { id: "Africa/Cairo", ianaZone: "Africa/Cairo", city: { en: "Cairo", ar: "القاهرة" }, country: { en: "Egypt", ar: "مصر" } },
  { id: "Europe/Istanbul", ianaZone: "Europe/Istanbul", city: { en: "Istanbul", ar: "إسطنبول" }, country: { en: "Turkey", ar: "تركيا" } },
  { id: "Europe/Moscow", ianaZone: "Europe/Moscow", city: { en: "Moscow", ar: "موسكو" }, country: { en: "Russia", ar: "روسيا" } },
  { id: "America/Sao_Paulo", ianaZone: "America/Sao_Paulo", city: { en: "São Paulo", ar: "ساو باولو" }, country: { en: "Brazil", ar: "البرازيل" } },
  { id: "America/Mexico_City", ianaZone: "America/Mexico_City", city: { en: "Mexico City", ar: "مكسيكو سيتي" }, country: { en: "Mexico", ar: "المكسيك" } },
  { id: "America/Toronto", ianaZone: "America/Toronto", city: { en: "Toronto", ar: "تورنتو" }, country: { en: "Canada", ar: "كندا" } },
  { id: "Asia/Hong_Kong", ianaZone: "Asia/Hong_Kong", city: { en: "Hong Kong", ar: "هونغ كونغ" }, country: { en: "Hong Kong", ar: "هونغ كونغ" } },
  { id: "Asia/Seoul", ianaZone: "Asia/Seoul", city: { en: "Seoul", ar: "سول" }, country: { en: "South Korea", ar: "كوريا الجنوبية" } },
  { id: "Asia/Bangkok", ianaZone: "Asia/Bangkok", city: { en: "Bangkok", ar: "بانكوك" }, country: { en: "Thailand", ar: "تايلاند" } },
  { id: "Asia/Jakarta", ianaZone: "Asia/Jakarta", city: { en: "Jakarta", ar: "جاكرتا" }, country: { en: "Indonesia", ar: "إندونيسيا" } },
  { id: "Asia/Kuala_Lumpur", ianaZone: "Asia/Kuala_Lumpur", city: { en: "Kuala Lumpur", ar: "كوالالمبور" }, country: { en: "Malaysia", ar: "ماليزيا" } },
  { id: "Asia/Karachi", ianaZone: "Asia/Karachi", city: { en: "Karachi", ar: "كراتشي" }, country: { en: "Pakistan", ar: "باكستان" } },
  { id: "Asia/Dhaka", ianaZone: "Asia/Dhaka", city: { en: "Dhaka", ar: "دكا" }, country: { en: "Bangladesh", ar: "بنغلاديش" } },
  { id: "Asia/Manila", ianaZone: "Asia/Manila", city: { en: "Manila", ar: "مانيلا" }, country: { en: "Philippines", ar: "الفلبين" } },
  { id: "Asia/Ho_Chi_Minh", ianaZone: "Asia/Ho_Chi_Minh", city: { en: "Ho Chi Minh City", ar: "هو تشي منه" }, country: { en: "Vietnam", ar: "فيتنام" } },
  { id: "Asia/Tehran", ianaZone: "Asia/Tehran", city: { en: "Tehran", ar: "طهران" }, country: { en: "Iran", ar: "إيران" } },
  { id: "Asia/Baghdad", ianaZone: "Asia/Baghdad", city: { en: "Baghdad", ar: "بغداد" }, country: { en: "Iraq", ar: "العراق" } },
  { id: "Asia/Amman", ianaZone: "Asia/Amman", city: { en: "Amman", ar: "عمّان" }, country: { en: "Jordan", ar: "الأردن" } },
  { id: "Asia/Beirut", ianaZone: "Asia/Beirut", city: { en: "Beirut", ar: "بيروت" }, country: { en: "Lebanon", ar: "لبنان" } },
  { id: "Asia/Damascus", ianaZone: "Asia/Damascus", city: { en: "Damascus", ar: "دمشق" }, country: { en: "Syria", ar: "سوريا" } },
  { id: "Asia/Qatar", ianaZone: "Asia/Qatar", city: { en: "Doha", ar: "الدوحة" }, country: { en: "Qatar", ar: "قطر" } },
  { id: "Asia/Kuwait", ianaZone: "Asia/Kuwait", city: { en: "Kuwait City", ar: "مدينة الكويت" }, country: { en: "Kuwait", ar: "الكويت" } },
  { id: "Asia/Bahrain", ianaZone: "Asia/Bahrain", city: { en: "Manama", ar: "المنامة" }, country: { en: "Bahrain", ar: "البحرين" } },
  { id: "Asia/Muscat", ianaZone: "Asia/Muscat", city: { en: "Muscat", ar: "مسقط" }, country: { en: "Oman", ar: "عُمان" } },
  { id: "Africa/Casablanca", ianaZone: "Africa/Casablanca", city: { en: "Casablanca", ar: "الدار البيضاء" }, country: { en: "Morocco", ar: "المغرب" } },
  { id: "Africa/Algiers", ianaZone: "Africa/Algiers", city: { en: "Algiers", ar: "الجزائر" }, country: { en: "Algeria", ar: "الجزائر" } },
  { id: "Africa/Tunis", ianaZone: "Africa/Tunis", city: { en: "Tunis", ar: "تونس" }, country: { en: "Tunisia", ar: "تونس" } },
  { id: "Africa/Lagos", ianaZone: "Africa/Lagos", city: { en: "Lagos", ar: "لاغوس" }, country: { en: "Nigeria", ar: "نيجيريا" } },
  { id: "Africa/Nairobi", ianaZone: "Africa/Nairobi", city: { en: "Nairobi", ar: "نيروبي" }, country: { en: "Kenya", ar: "كينيا" } },
  { id: "Africa/Johannesburg", ianaZone: "Africa/Johannesburg", city: { en: "Johannesburg", ar: "جوهانسبرغ" }, country: { en: "South Africa", ar: "جنوب أفريقيا" } },
  { id: "Europe/Madrid", ianaZone: "Europe/Madrid", city: { en: "Madrid", ar: "مدريد" }, country: { en: "Spain", ar: "إسبانيا" } },
  { id: "Europe/Rome", ianaZone: "Europe/Rome", city: { en: "Rome", ar: "روما" }, country: { en: "Italy", ar: "إيطاليا" } },
  { id: "Europe/Amsterdam", ianaZone: "Europe/Amsterdam", city: { en: "Amsterdam", ar: "أمستردام" }, country: { en: "Netherlands", ar: "هولندا" } },
  { id: "Europe/Zurich", ianaZone: "Europe/Zurich", city: { en: "Zurich", ar: "زيورخ" }, country: { en: "Switzerland", ar: "سويسرا" } },
  { id: "Europe/Stockholm", ianaZone: "Europe/Stockholm", city: { en: "Stockholm", ar: "ستوكهولم" }, country: { en: "Sweden", ar: "السويد" } },
  { id: "Europe/Athens", ianaZone: "Europe/Athens", city: { en: "Athens", ar: "أثينا" }, country: { en: "Greece", ar: "اليونان" } },
  { id: "Europe/Warsaw", ianaZone: "Europe/Warsaw", city: { en: "Warsaw", ar: "وارسو" }, country: { en: "Poland", ar: "بولندا" } },
  { id: "Pacific/Auckland", ianaZone: "Pacific/Auckland", city: { en: "Auckland", ar: "أوكلاند" }, country: { en: "New Zealand", ar: "نيوزيلندا" } },
  { id: "Australia/Perth", ianaZone: "Australia/Perth", city: { en: "Perth", ar: "بيرث" }, country: { en: "Australia", ar: "أستراليا" } },
  { id: "America/Denver", ianaZone: "America/Denver", city: { en: "Denver", ar: "دنفر" }, country: { en: "United States", ar: "الولايات المتحدة" } },
  { id: "America/Vancouver", ianaZone: "America/Vancouver", city: { en: "Vancouver", ar: "فانكوفر" }, country: { en: "Canada", ar: "كندا" } },
  { id: "America/Bogota", ianaZone: "America/Bogota", city: { en: "Bogotá", ar: "بوغوتا" }, country: { en: "Colombia", ar: "كولومبيا" } },
  { id: "America/Buenos_Aires", ianaZone: "America/Buenos_Aires", city: { en: "Buenos Aires", ar: "بوينس آيرس" }, country: { en: "Argentina", ar: "الأرجنتين" } },
  { id: "Pacific/Honolulu", ianaZone: "Pacific/Honolulu", city: { en: "Honolulu", ar: "هونولولو" }, country: { en: "United States", ar: "الولايات المتحدة" } },
];

export function findCityById(id: string): WorldCity | undefined {
  return WORLD_CITIES.find((city) => city.id === id);
}

export function filterCitiesByQuery(cities: WorldCity[], query: string, locale: string): WorldCity[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return cities;
  const nameKey = locale === "ar" ? "ar" : "en";
  return cities.filter(
    (city) =>
      city.city[nameKey].toLowerCase().includes(normalized) ||
      city.country[nameKey].toLowerCase().includes(normalized) ||
      city.city.en.toLowerCase().includes(normalized) ||
      city.country.en.toLowerCase().includes(normalized)
  );
}
