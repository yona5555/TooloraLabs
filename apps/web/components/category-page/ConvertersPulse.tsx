import { getTranslations } from "next-intl/server";
import { RomanNumeralCalculator } from "@tooloralabs/tools";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The converters section's indicators: exact reference factors (the 1959 international inch,
 * pound and mile), the Celsius→Fahrenheit formula applied to water's boiling point, and the largest
 * value the Roman numeral tool accepts, converted by the tool's own calculator. Fixed, no request.
 */
const ROMAN_MAX = 3999;
const ROMAN = new RomanNumeralCalculator().execute({ direction: "toRoman", arabicValue: ROMAN_MAX }, { locale: "en-US" }).data?.romanValue ?? null;
const BOIL_F = (100 * 9) / 5 + 32;

export default async function ConvertersPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.converters" });
  const ltr = (s: string) => <span dir="ltr">{s}</span>;
  const unit = "/tools/unit-converter";

  const items: IndicatorItem[] = [
    { id: "inch", href: unit, label: t("inch"), value: ltr("1 in = 2.54 cm"), note: t("inchNote") },
    { id: "pound", href: unit, label: t("pound"), value: ltr("1 lb = 0.45359237 kg"), note: t("poundNote") },
    { id: "mile", href: unit, label: t("mile"), value: ltr("1 mi = 1.609344 km"), note: t("mileNote") },
    { id: "boil", href: unit, label: t("boil"), value: ltr(`100 °C = ${BOIL_F} °F`), note: t("boilNote") },
  ];
  if (ROMAN) {
    items.push({ id: "roman", href: "/tools/roman-numeral-converter", label: t("roman"), value: ltr(`${ROMAN_MAX} = ${ROMAN}`), note: t("romanNote") });
  }
  return <IndicatorStrip label={t("label")} items={items} />;
}
