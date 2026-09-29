"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";
import { SPECIAL_TYPES, round } from "./triangleEducationMath";

const TAG_COLOR: Record<string, string> = {
  acute: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  right: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  obtuse: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

/** Tagged Reference Table (#17) — five named/special triangles, each row tagged with its real acute/right/obtuse classification. */
export default function TriangleSpecialTypesTable() {
  const t = useTranslations("tools.triangle-calculator.education.lab.specialTypes");
  const tNames = useTranslations("tools.triangle-calculator.education.lab.specialTypes.names");
  const tClasses = useTranslations("tools.triangle-calculator.education.intro.angleGauge.shapes");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("intro")}
      columnLabel={t("columnName")}
      columnValue={t("columnSides")}
      rows={SPECIAL_TYPES.map((s) => ({
        key: s.key,
        label: `${tNames(s.key)} (${t(`sideClasses.${s.sideClass}`)})`,
        value: s.sides.map((n) => round(n, 2)).join(" · "),
        tag: { text: tClasses(s.angleClass), colorClass: TAG_COLOR[s.angleClass] },
      }))}
    />
  );
}
