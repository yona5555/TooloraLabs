const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

export function parseLocalizedNumber(value: string): number {
  let normalized = value.trim();
  for (let i = 0; i < 10; i++) {
    normalized = normalized
      .replaceAll(ARABIC_INDIC[i], String(i))
      .replaceAll(EXTENDED_ARABIC_INDIC[i], String(i));
  }
  return Number(normalized);
}
