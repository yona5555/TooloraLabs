"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard from "@/components/tool-ui/ReferenceTableCard";

const REACTION_TYPES: { key: string; example: string }[] = [
  { key: "combustion", example: "CH4 + O2 → CO2 + H2O" },
  { key: "synthesis", example: "H2 + O2 → H2O" },
  { key: "decomposition", example: "H2O2 → H2O + O2" },
  { key: "singleDisplacement", example: "Zn + HCl → ZnCl2 + H2" },
  { key: "doubleDisplacement", example: "AgNO3 + NaCl → AgCl + NaNO3" },
];

export default function BalancerReferenceTable() {
  const t = useTranslations("tools.chemical-equation-balancer.referenceTable");
  const tTypes = useTranslations("tools.chemical-equation-balancer.referenceTable.reactionTypes");

  return (
    <ReferenceTableCard
      title={t("title")}
      caption={t("caption")}
      columnLabel={t("columnType")}
      columnValue={t("columnExample")}
      rows={REACTION_TYPES.map((r) => ({ key: r.key, label: tTypes(r.key), value: r.example }))}
    />
  );
}
