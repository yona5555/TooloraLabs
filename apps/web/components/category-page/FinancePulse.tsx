import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The finance section's indicators. Three are computed here with the standard formulas the
 * section's tools use (compound growth, the amortised payment P·r / (1 − (1 + r)⁻ⁿ)); two are
 * published rules of thumb (28/36 lender ratios, Bengen's 4% withdrawal). Currency-neutral amounts,
 * no request.
 */
function payment(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r) / (1 - (1 + r) ** -n);
}

const DOUBLE_YEARS = Math.log(2) / Math.log(1.07);
const MORTGAGE = payment(100_000, 0.06, 30);
const LOAN_INTEREST = payment(10_000, 0.08, 5) * 60 - 10_000;

export default async function FinancePulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.finance" });
  const num = (v: number, d: number) =>
    new Intl.NumberFormat(`${locale}-u-nu-latn`, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

  const items: IndicatorItem[] = [
    { id: "double", href: "/tools/compound-interest-calculator", label: t("double"), value: t("doubleValue", { years: num(DOUBLE_YEARS, 2) }), note: t("doubleNote") },
    { id: "mortgage", href: "/tools/mortgage-calculator", label: t("mortgage"), value: t("mortgageValue", { amount: num(MORTGAGE, 2) }), note: t("mortgageNote") },
    { id: "loan", href: "/tools/loan-calculator", label: t("loan"), value: t("loanValue", { amount: num(LOAN_INTEREST, 2) }), note: t("loanNote") },
    { id: "dti", href: "/tools/debt-to-income-calculator", label: t("dti"), value: <span dir="ltr">28% / 36%</span>, note: t("dtiNote") },
    { id: "withdrawal", href: "/tools/retirement-calculator", label: t("withdrawal"), value: <span dir="ltr">4%</span>, note: t("withdrawalNote") },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
