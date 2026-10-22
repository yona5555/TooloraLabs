import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The student section's indicators: the reference rules the section's tools apply (US 4.0 grade
 * points, the US federal credit-hour definition and the weekly load it implies, computed here,
 * the citation style editions the generator formats, Cirillo's Pomodoro interval). Fixed values,
 * no request.
 */
const CREDITS = 15;
const HOURS_PER_CREDIT = 1 + 2; // one hour in class + two hours of out-of-class work, per week

export default async function StudentPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.student" });
  const ltr = (s: string) => <span dir="ltr">{s}</span>;

  const items: IndicatorItem[] = [
    { id: "gpa", href: "/tools/gpa-calculator", label: t("gpa"), value: ltr("A 4.0 · B 3.0 · C 2.0 · D 1.0"), note: t("gpaNote") },
    { id: "credit", href: "/tools/study-time-calculator", label: t("credit"), value: t("creditValue"), note: t("creditNote") },
    { id: "load", href: "/tools/class-schedule-builder", label: t("load", { credits: CREDITS }), value: t("loadValue", { hours: CREDITS * HOURS_PER_CREDIT }), note: t("loadNote") },
    { id: "citation", href: "/tools/citation-generator", label: t("citation"), value: ltr("APA 7 · MLA 9 · Chicago 17"), note: t("citationNote") },
    { id: "pomodoro", href: "/tools/study-time-calculator", label: t("pomodoro"), value: t("pomodoroValue"), note: t("pomodoroNote") },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
