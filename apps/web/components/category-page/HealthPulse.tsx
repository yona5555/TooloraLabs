import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The health & fitness section's indicators: published reference values the section's tools are
 * built on (WHO BMI band, Atwater factors, the Fox HRmax formula, Naegele's 280 days, the
 * World Athletics marathon distance). Fixed values, no request.
 */
/** A null value is worded per locale (it contains words), under `${id}Value`. */
const ROWS: { id: string; href: string; value: string | null }[] = [
  { id: "bmi", href: "/tools/bmi-calculator", value: "18.5 – 24.9 kg/m²" },
  { id: "atwater", href: "/tools/macro-calculator", value: "4 · 4 · 9 kcal/g" },
  { id: "hrmax", href: "/tools/target-heart-rate-calculator", value: null },
  { id: "pregnancy", href: "/tools/due-date-calculator", value: null },
  { id: "marathon", href: "/tools/pace-calculator", value: "42.195 km" },
];

export default async function HealthPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.health" });
  const items: IndicatorItem[] = ROWS.map((r) => ({
    id: r.id,
    href: r.href,
    label: t(r.id),
    value: r.value === null ? t(`${r.id}Value`) : <span dir="ltr">{r.value}</span>,
    note: t(`${r.id}Note`),
  }));
  return <IndicatorStrip label={t("label")} items={items} />;
}
