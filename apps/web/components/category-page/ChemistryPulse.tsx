import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The chemistry section's indicators. Two exact SI constants (N_A, and R = N_A·k) and three values
 * computed here from IUPAC conventional atomic weights (H 1.008, O 15.999) and Kw = 1.0 × 10⁻¹⁴ at
 * 25 °C. Fixed inputs, no request.
 */
const H = 1.008;
const O = 15.999;
const WATER_MOLAR_MASS = 2 * H + O; // g/mol
const WATER_MOLARITY = 1000 / WATER_MOLAR_MASS; // mol/L, taking 1 L of water as 1000 g
const NEUTRAL_PH = -Math.log10(Math.sqrt(1e-14));

const ROWS = [
  { id: "avogadro", href: "/tools/stoichiometry-calculator", value: "6.02214076 × 10²³ mol⁻¹" },
  { id: "gas", href: "/tools/ideal-gas-law-calculator", value: "8.314462618 J/(mol·K)" },
  { id: "water", href: "/tools/molar-mass-calculator", value: `H₂O = ${WATER_MOLAR_MASS.toFixed(3)} g/mol` },
  { id: "molarity", href: "/tools/molarity-calculator", value: `${WATER_MOLARITY.toFixed(2)} mol/L` },
  { id: "ph", href: "/tools/ph-calculator", value: `pH ${NEUTRAL_PH.toFixed(2)}` },
] as const;

export default async function ChemistryPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.chemistry" });
  const items: IndicatorItem[] = ROWS.map((r) => ({
    id: r.id,
    href: r.href,
    label: t(r.id),
    value: <span dir="ltr">{r.value}</span>,
    note: t(`${r.id}Note`),
  }));
  return <IndicatorStrip label={t("label")} items={items} />;
}
