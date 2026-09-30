"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";

const SHAPES: { key: string; formula: string; dims: number }[] = [
  { key: "cube", formula: "A = 6s²", dims: 1 },
  { key: "rectangularPrism", formula: "A = 2(lw + lh + wh)", dims: 3 },
  { key: "sphere", formula: "A = 4πr²", dims: 1 },
  { key: "cylinder", formula: "A = 2πr² + 2πrh", dims: 2 },
  { key: "cone", formula: "A = πr² + πrl", dims: 2 },
  { key: "squarePyramid", formula: "A = s² + 4(½sl)", dims: 2 },
];

/** Type #17 (Tagged Reference Table): all six solids this tool actually supports, each with its real formula and tagged by how many independent dimensions it needs — from one up to three. */
export default function ShapeFamilyTable() {
  const t = useTranslations("tools.surface-area-calculator.education.shapeFamily");

  const rows: ReferenceTableRow[] = SHAPES.map((s) => ({
    key: s.key,
    label: t(`shapes.${s.key}`),
    value: s.formula,
    tag: { text: t("dimsTag", { count: s.dims }), colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
  }));

  return <ReferenceTableCard title={t("title")} caption={t("intro")} columnLabel={t("columnShape")} columnValue={t("columnFormula")} rows={rows} />;
}
