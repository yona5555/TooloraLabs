import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The business section's indicators, computed here with the formulas the section's tools use:
 * markup → margin m ÷ (1 + m), stacked discounts 1 − Π(1 − dᵢ), break-even units F ÷ (P − V), the tax
 * share of a tax-inclusive price t ÷ (1 + t), plus the exact US gallon (3.785411784 L). Fixed inputs,
 * currency-neutral, no request.
 */
const MARGIN = 0.25 / 1.25;
const STACKED = 1 - 0.8 * 0.9;
const BREAK_EVEN = 10_000 / (50 - 30);
const VAT_SHARE = 0.2 / 1.2;

export default async function BusinessPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.business" });
  const pct = (v: number, d: number) => `${(v * 100).toFixed(d)}%`;
  const ltr = (s: string) => <span dir="ltr">{s}</span>;
  const units = new Intl.NumberFormat(`${locale}-u-nu-latn`).format(BREAK_EVEN);

  const items: IndicatorItem[] = [
    { id: "margin", href: "/tools/inventory-valuation-calculator", label: t("margin"), value: ltr(`25% → ${pct(MARGIN, 0)}`), note: t("marginNote") },
    { id: "stacked", href: "/tools/discount-calculator", label: t("stacked"), value: ltr(`20% + 10% = ${pct(STACKED, 0)}`), note: t("stackedNote") },
    { id: "breakEven", href: "/tools/break-even-calculator", label: t("breakEven"), value: t("breakEvenValue", { units }), note: t("breakEvenNote") },
    { id: "vat", href: "/tools/sales-tax-calculator", label: t("vat"), value: ltr(pct(VAT_SHARE, 2)), note: t("vatNote") },
    { id: "gallon", href: "/tools/fuel-cost-calculator", label: t("gallon"), value: ltr("1 gal = 3.785411784 L"), note: t("gallonNote") },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
