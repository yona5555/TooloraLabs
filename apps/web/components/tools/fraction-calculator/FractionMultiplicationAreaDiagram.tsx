"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { FractionCalculator } from "@tooloralabs/tools";

const tool = new FractionCalculator();
const A = { n: 2, d: 3 };
const B = { n: 3, d: 4 };
const CELL = 24;
const GAP = 2;

/** Area model: a denominatorA x denominatorB grid where numeratorA columns and numeratorB rows are shaded — the overlap cell count is exactly the product's numerator, and the grid's total cell count is the product's denominator. This is literally the arithmetic this tool's multiply operation performs, made visible. */
export default function FractionMultiplicationAreaDiagram() {
  const t = useTranslations("tools.fraction-calculator.education.multiplication");
  const output = tool.execute({ operation: "multiply", numeratorA: A.n, denominatorA: A.d, numeratorB: B.n, denominatorB: B.d }, { locale: "en-US" });
  if (!output.success) return null;
  const { result } = output.data;
  const rawNumerator = A.n * B.n;
  const rawDenominator = A.d * B.d;
  const wasSimplified = rawDenominator !== result.denominator;

  const cols = A.d;
  const rows = B.d;
  const width = cols * CELL + (cols - 1) * GAP;
  const height = rows * CELL + (rows - 1) * GAP;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { a: `${A.n}/${A.d}`, b: `${B.n}/${B.d}` })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="shrink-0 overflow-x-auto">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t("title")} className="block">
            {Array.from({ length: rows }).map((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const shadedCol = c < A.n;
                const shadedRow = r < B.n;
                const both = shadedCol && shadedRow;
                const x = c * (CELL + GAP);
                const y = r * (CELL + GAP);
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx={3}
                    className={
                      both
                        ? "fill-blue-600 dark:fill-blue-400"
                        : shadedCol || shadedRow
                          ? "fill-blue-200 dark:fill-blue-500/30"
                          : "fill-zinc-100 dark:fill-zinc-800"
                    }
                  />
                );
              }),
            )}
          </svg>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.a"), value: `${A.n}/${A.d}` },
            { label: t("worked.b"), value: `${B.n}/${B.d}` },
            { label: t("worked.numerator"), value: `${A.n} × ${B.n} = ${A.n * B.n}` },
            { label: t("worked.denominator"), value: `${A.d} × ${B.d} = ${A.d * B.d}` },
            {
              label: t("worked.result"),
              value: `${result.numerator}/${result.denominator}`,
              emphasize: true,
              note: wasSimplified ? t("worked.simplifyNote", { raw: `${rawNumerator}/${rawDenominator}` }) : undefined,
            },
          ]}
        />
      </div>
    </SectionCard>
  );
}
