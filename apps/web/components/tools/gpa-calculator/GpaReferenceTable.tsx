"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";
import { LETTER_GRADES, GRADE_POINTS } from "./types";

/**
 * Fills the visual gap below the course list on the standard 4.0-point
 * scale — the same grade-point values GRADE_POINTS drives the actual
 * calculation with, so this table is never out of sync with the engine.
 */
export default function GpaReferenceTable() {
  const t = useTranslations("tools.gpa-calculator.aboveFold.quickReference");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("intro")}
      columnLabel={t("columnGrade")}
      columnValue={t("columnPoints")}
      rows={LETTER_GRADES.map((grade) => ({
        key: grade,
        label: grade,
        value: GRADE_POINTS[grade].toFixed(1),
      }))}
    />
  );
}
