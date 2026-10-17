/**
 * City names for the World Time Converter in es/fr/de/hi, keyed by the English
 * name in WorldTimeCities. es/fr/de list only names that differ from English.
 */
export type WtNameLocale = "es" | "fr" | "de" | "hi";

const ES: Record<string, string> = {
  "New York": "Nueva York", London: "Londres", Dubai: "Dubái", Riyadh: "Riad", Tokyo: "Tokio",
  "Beijing / Shanghai": "Pekín / Shanghái", Singapore: "Singapur", Sydney: "Sídney",
  Paris: "París", Berlin: "Berlín", "Los Angeles": "Los Ángeles", "Mumbai / Delhi": "Bombay / Delhi",
  Cairo: "El Cairo", Istanbul: "Estambul", Moscow: "Moscú", "Mexico City": "Ciudad de México",
  "Hong Kong": "Hong Kong", Seoul: "Seúl", Bangkok: "Bangkok", Jakarta: "Yakarta",
  Karachi: "Karachi", Dhaka: "Daca", Manila: "Manila", "Ho Chi Minh City": "Ciudad Ho Chi Minh",
  Tehran: "Teherán", Baghdad: "Bagdad", Amman: "Ammán", Beirut: "Beirut", Damascus: "Damasco",
  "Kuwait City": "Ciudad de Kuwait", Manama: "Manama", Muscat: "Mascate", Casablanca: "Casablanca",
  Algiers: "Argel", Tunis: "Túnez", Johannesburg: "Johannesburgo", Rome: "Roma", Amsterdam: "Ámsterdam",
  Zurich: "Zúrich", Stockholm: "Estocolmo", Athens: "Atenas", Warsaw: "Varsovia", Vancouver: "Vancouver",
  Honolulu: "Honolulu", Reykjavík: "Reikiavik", Kathmandu: "Katmandú",
  "St. John's": "San Juan de Terranova",
};

const FR: Record<string, string> = {
  London: "Londres", Dubai: "Dubaï", Riyadh: "Riyad", "Beijing / Shanghai": "Pékin / Shanghai",
  Singapore: "Singapour", "Mumbai / Delhi": "Bombay / Delhi", Cairo: "Le Caire", Moscow: "Moscou",
  "Mexico City": "Mexico", Seoul: "Séoul", Jakarta: "Jakarta", Dhaka: "Dacca",
  "Ho Chi Minh City": "Hô Chi Minh-Ville", Tehran: "Téhéran", Baghdad: "Bagdad", Damascus: "Damas",
  "Kuwait City": "Koweït", Muscat: "Mascate", Algiers: "Alger", Lagos: "Lagos",
  Johannesburg: "Johannesbourg", Rome: "Rome", Zurich: "Zurich", Athens: "Athènes", Warsaw: "Varsovie",
  "Bogotá": "Bogota", "Buenos Aires": "Buenos Aires", Reykjavík: "Reykjavik",
  Kathmandu: "Katmandou", "St. John's": "Saint-Jean de Terre-Neuve", "São Paulo": "São Paulo",
};

const DE: Record<string, string> = {
  "Beijing / Shanghai": "Peking / Shanghai", "Mumbai / Delhi": "Mumbai / Delhi", Cairo: "Kairo",
  Moscow: "Moskau", "Mexico City": "Mexiko-Stadt", "Ho Chi Minh City": "Ho-Chi-Minh-Stadt",
  Tehran: "Teheran", Baghdad: "Bagdad", Damascus: "Damaskus", "Kuwait City": "Kuwait-Stadt",
  Muscat: "Maskat", Algiers: "Algier", Rome: "Rom", Zurich: "Zürich", Athens: "Athen",
  Warsaw: "Warschau", Kathmandu: "Kathmandu", Riyadh: "Riad", Singapore: "Singapur",
  Seoul: "Seoul", "St. John's": "St. John’s", Reykjavík: "Reykjavík",
};

const HI: Record<string, string> = {
  "New York": "न्यूयॉर्क", London: "लंदन", Dubai: "दुबई", Riyadh: "रियाद", Tokyo: "टोक्यो",
  "Beijing / Shanghai": "बीजिंग / शंघाई", Singapore: "सिंगापुर", Sydney: "सिडनी", Paris: "पेरिस",
  Berlin: "बर्लिन", "Los Angeles": "लॉस एंजिल्स", Chicago: "शिकागो", "Mumbai / Delhi": "मुंबई / दिल्ली",
  Cairo: "काहिरा", Istanbul: "इस्तांबुल", Moscow: "मॉस्को", "São Paulo": "साओ पाउलो",
  "Mexico City": "मेक्सिको सिटी", Toronto: "टोरंटो", "Hong Kong": "हांगकांग", Seoul: "सियोल",
  Bangkok: "बैंकॉक", Jakarta: "जकार्ता", "Kuala Lumpur": "कुआलालंपुर", Karachi: "कराची", Dhaka: "ढाका",
  Manila: "मनीला", "Ho Chi Minh City": "हो ची मिन्ह सिटी", Tehran: "तेहरान", Baghdad: "बगदाद",
  Amman: "अम्मान", Beirut: "बेरूत", Damascus: "दमिश्क", Doha: "दोहा", "Kuwait City": "कुवैत सिटी",
  Manama: "मनामा", Muscat: "मस्कट", Casablanca: "कासाब्लांका", Algiers: "अल्जीयर्स", Tunis: "ट्यूनिस",
  Lagos: "लागोस", Nairobi: "नैरोबी", Johannesburg: "जोहान्सबर्ग", Madrid: "मैड्रिड", Rome: "रोम",
  Amsterdam: "एम्स्टर्डम", Zurich: "ज़्यूरिख", Stockholm: "स्टॉकहोम", Athens: "एथेंस", Warsaw: "वारसॉ",
  Auckland: "ऑकलैंड", Perth: "पर्थ", Denver: "डेनवर", Vancouver: "वैंकूवर", "Bogotá": "बोगोटा",
  "Buenos Aires": "ब्यूनस आयर्स", Honolulu: "होनोलूलू", Anchorage: "एंकरेज", Reykjavík: "रेक्जाविक",
  Kathmandu: "काठमांडू", Adelaide: "एडिलेड", "St. John's": "सेंट जॉन्स",
};

const MAPS: Record<WtNameLocale, Record<string, string>> = { es: ES, fr: FR, de: DE, hi: HI };

/** Localised city name; falls back to English when the name is the same. */
export function wtLocalizedCityName(en: string, ar: string, locale: string): string {
  if (locale === "ar") return ar;
  const map = MAPS[locale as WtNameLocale];
  return map?.[en] ?? en;
}

/** All localised spellings of a city, for search. */
export function wtCityNameVariants(en: string): string[] {
  return Object.values(MAPS)
    .map((m) => m[en])
    .filter((v): v is string => Boolean(v));
}
