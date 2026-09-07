"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const TAG_CLASSES = {
  acidic: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const SUBSTANCES: { key: string; pH: string; classification: keyof typeof TAG_CLASSES }[] = [
  { key: "lemonJuice", pH: "2.2", classification: "acidic" },
  { key: "vinegar", pH: "2.9", classification: "acidic" },
  { key: "blackCoffee", pH: "5.0", classification: "acidic" },
  { key: "pureWater", pH: "7.0", classification: "neutral" },
  { key: "humanBlood", pH: "7.4", classification: "basic" },
  { key: "handSoap", pH: "9.5", classification: "basic" },
];

export default function PhReferenceTable() {
  const t = useTranslations("tools.ph-calculator.referenceTable");
  const tSubstances = useTranslations("tools.ph-calculator.referenceTable.substances");
  const tTags = useTranslations("tools.ph-calculator.referenceTable.tags");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnSubstance")}
      columnValue={t("columnPh")}
      rows={SUBSTANCES.map((s) => ({
        key: s.key,
        label: tSubstances(s.key),
        value: s.pH,
        tag: { text: tTags(s.classification), colorClass: TAG_CLASSES[s.classification] },
      }))}
    />
  );
}
