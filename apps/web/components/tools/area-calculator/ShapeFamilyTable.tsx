"use client";
import { useTranslations } from "next-intl";
import ReferenceTableCard, { type ReferenceTableRow } from "@/components/tool-ui/ReferenceTableCard";

const SHAPES: { key: string; formula: string; dims: number }[] = [
  { key: "square", formula: "A = s²", dims: 1 },
  { key: "rectangle", formula: "A = w × h", dims: 2 },
  { key: "triangle", formula: "A = ½ × b × h", dims: 2 },
  { key: "circle", formula: "A = π × r²", dims: 1 },
  { key: "ellipse", formula: "A = π × a × b", dims: 2 },
  { key: "trapezoid", formula: "A = ½ × (b₁+b₂) × h", dims: 3 },
  { key: "parallelogram", formula: "A = b × h", dims: 2 },
  { key: "sector", formula: "A = (θ/360) × π × r²", dims: 2 },
];

/** Type #17 (Tagged Reference Table): all eight shapes this tool actually supports, each with its real formula and tagged by how many independent dimensions it needs — from one (square, circle) up to three (trapezoid). */
export default function ShapeFamilyTable() {
  const t = useTranslations("tools.area-calculator.education.shapeFamily");

  const rows: ReferenceTableRow[] = SHAPES.map((s) => ({
    key: s.key,
    label: t(`shapes.${s.key}`),
    value: s.formula,
    tag: { text: t("dimsTag", { count: s.dims }), colorClass: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" },
  }));

  return <ReferenceTableCard title={t("title")} caption={t("intro")} columnLabel={t("columnShape")} columnValue={t("columnFormula")} rows={rows} />;
}
