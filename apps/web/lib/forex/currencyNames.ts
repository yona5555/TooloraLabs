/**
 * ISO 4217 is public reference data (not proprietary to ExchangeRate-API), so
 * it's safe to hold locally rather than re-fetched — the live data this tool
 * actually depends on is only ever the per-currency *rate*, from
 * `getForexSnapshot()`. Arabic names are curated for the currencies a visitor
 * is actually likely to pick (all Arab League currencies plus the world's
 * most commonly traded ones); any other ExchangeRate-API code not listed
 * here falls back to the genuine English name the API itself returns.
 */
export const CURRENCY_NAMES: Record<string, { en: string; ar: string }> = {
  USD: { en: "United States Dollar", ar: "الدولار الأمريكي" },
  EUR: { en: "Euro", ar: "اليورو" },
  GBP: { en: "Pound Sterling", ar: "الجنيه الإسترليني" },
  JPY: { en: "Japanese Yen", ar: "الين الياباني" },
  CNY: { en: "Chinese Renminbi", ar: "اليوان الصيني" },
  CHF: { en: "Swiss Franc", ar: "الفرنك السويسري" },
  CAD: { en: "Canadian Dollar", ar: "الدولار الكندي" },
  AUD: { en: "Australian Dollar", ar: "الدولار الأسترالي" },
  NZD: { en: "New Zealand Dollar", ar: "الدولار النيوزيلندي" },
  HKD: { en: "Hong Kong Dollar", ar: "دولار هونغ كونغ" },
  SGD: { en: "Singapore Dollar", ar: "الدولار السنغافوري" },
  SEK: { en: "Swedish Krona", ar: "الكرونة السويدية" },
  NOK: { en: "Norwegian Krone", ar: "الكرونة النرويجية" },
  DKK: { en: "Danish Krone", ar: "الكرونة الدنماركية" },
  PLN: { en: "Polish Złoty", ar: "الزلوتي البولندي" },
  CZK: { en: "Czech Koruna", ar: "الكرونة التشيكية" },
  HUF: { en: "Hungarian Forint", ar: "الفورنت المجري" },
  RON: { en: "Romanian Leu", ar: "الليو الروماني" },
  TRY: { en: "Turkish Lira", ar: "الليرة التركية" },
  RUB: { en: "Russian Ruble", ar: "الروبل الروسي" },
  KRW: { en: "South Korean Won", ar: "الوون الكوري الجنوبي" },
  INR: { en: "Indian Rupee", ar: "الروبية الهندية" },
  PKR: { en: "Pakistani Rupee", ar: "الروبية الباكستانية" },
  IDR: { en: "Indonesian Rupiah", ar: "الروبية الإندونيسية" },
  MYR: { en: "Malaysian Ringgit", ar: "الرينغيت الماليزي" },
  THB: { en: "Thai Baht", ar: "الباهت التايلندي" },
  PHP: { en: "Philippine Peso", ar: "البيزو الفلبيني" },
  VND: { en: "Vietnamese Đồng", ar: "الدونغ الفيتنامي" },
  TWD: { en: "New Taiwan Dollar", ar: "دولار تايوان الجديد" },
  ZAR: { en: "South African Rand", ar: "الراند الجنوب أفريقي" },
  BRL: { en: "Brazilian Real", ar: "الريال البرازيلي" },
  MXN: { en: "Mexican Peso", ar: "البيزو المكسيكي" },
  ARS: { en: "Argentine Peso", ar: "البيزو الأرجنتيني" },
  ILS: { en: "Israeli New Shekel", ar: "الشيكل الإسرائيلي الجديد" },
  NGN: { en: "Nigerian Naira", ar: "النايرا النيجيرية" },
  KES: { en: "Kenyan Shilling", ar: "الشلن الكيني" },
  // Arab League currencies
  SAR: { en: "Saudi Riyal", ar: "الريال السعودي" },
  AED: { en: "UAE Dirham", ar: "الدرهم الإماراتي" },
  EGP: { en: "Egyptian Pound", ar: "الجنيه المصري" },
  KWD: { en: "Kuwaiti Dinar", ar: "الدينار الكويتي" },
  QAR: { en: "Qatari Riyal", ar: "الريال القطري" },
  BHD: { en: "Bahraini Dinar", ar: "الدينار البحريني" },
  OMR: { en: "Omani Rial", ar: "الريال العماني" },
  JOD: { en: "Jordanian Dinar", ar: "الدينار الأردني" },
  LBP: { en: "Lebanese Pound", ar: "الليرة اللبنانية" },
  IQD: { en: "Iraqi Dinar", ar: "الدينار العراقي" },
  SYP: { en: "Syrian Pound", ar: "الليرة السورية" },
  LYD: { en: "Libyan Dinar", ar: "الدينار الليبي" },
  TND: { en: "Tunisian Dinar", ar: "الدينار التونسي" },
  DZD: { en: "Algerian Dinar", ar: "الدينار الجزائري" },
  MAD: { en: "Moroccan Dirham", ar: "الدرهم المغربي" },
  MRU: { en: "Mauritanian Ouguiya", ar: "الأوقية الموريتانية" },
  SDG: { en: "Sudanese Pound", ar: "الجنيه السوداني" },
  YER: { en: "Yemeni Rial", ar: "الريال اليمني" },
  SOS: { en: "Somali Shilling", ar: "الشلن الصومالي" },
  DJF: { en: "Djiboutian Franc", ar: "الفرنك الجيبوتي" },
  KMF: { en: "Comorian Franc", ar: "الفرنك القمري" },
};

/** The prominent quick-access set: top globally traded currencies first, then the most-visited Arab currencies — per the tool's above-the-fold spec. */
export const FEATURED_CURRENCY_CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "SAR", "AED", "EGP", "KWD"] as const;

/** `fallbackName` is the genuine English name ExchangeRate-API returns for every one of its ~161 codes — used for the (mostly English-locale) currencies outside this curated set, so only a bare ISO code is ever shown as a last resort. */
export function getCurrencyDisplayName(code: string, locale: string, fallbackName?: string): string {
  const entry = CURRENCY_NAMES[code];
  if (entry) return locale === "ar" ? entry.ar : entry.en;
  return fallbackName ?? code;
}
