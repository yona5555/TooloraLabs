import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The physics section's indicators: defined SI constants (exact since the 2019 redefinition) plus
 * the CODATA 2018 value of G, each linked to the tool that uses it. Fixed values, no request.
 */
const CONSTANTS = [
  { id: "g", href: "/tools/projectile-motion-calculator", value: "9.80665 m/s²" },
  { id: "c", href: "/tools/kinematics-calculator", value: "299,792,458 m/s" },
  { id: "G", href: "/tools/force-calculator", value: "6.67430 × 10⁻¹¹" },
  { id: "charge", href: "/tools/ohms-law-calculator", value: "1.602176634 × 10⁻¹⁹ C" },
  { id: "kwh", href: "/tools/energy-work-power-calculator", value: "1 kWh = 3,600,000 J" },
] as const;

export default async function PhysicsPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.physics" });
  const items: IndicatorItem[] = CONSTANTS.map((c) => ({
    id: c.id,
    href: c.href,
    label: t(c.id),
    value: <span dir="ltr">{c.value}</span>,
    note: t(`${c.id}Note`),
  }));
  return <IndicatorStrip label={t("label")} items={items} />;
}
