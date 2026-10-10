"use client";
import { useTranslations } from "next-intl";
import { det2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

/** Type #18 (Formula Diagram): A's grid with both diagonals drawn, then the live products substituted into a₁₁a₂₂ − a₁₂a₂₁. */
export default function MatrixDeterminantFormula() {
  const t = useTranslations("tools.matrix-calculator.education.lab.detFormula");
  const { A, B, f } = useMatrixModel();
  const main = A[0] * A[3];
  const anti = A[1] * A[2];
  const d = det2(A);

  const cell = (v: number, tone: "main" | "anti", x: number, y: number) => (
    <g>
      <rect x={x} y={y} width={64} height={44} rx={8} className={tone === "main" ? "fill-emerald-50 stroke-emerald-500 dark:fill-emerald-500/10 dark:stroke-emerald-400" : "fill-rose-50 stroke-rose-500 dark:fill-rose-500/10 dark:stroke-rose-400"} strokeWidth={1.5} />
      <text x={x + 32} y={y + 28} textAnchor="middle" className="fill-zinc-800 font-mono text-[15px] font-bold dark:fill-zinc-100">{f(v)}</text>
    </g>
  );

  const diagram = (
    <svg style={{ direction: "ltr" }} width={320} height={250} viewBox="0 0 320 250" role="img" aria-label={t("title")} className="mx-auto max-w-full">
      {cell(A[0], "main", 20, 16)}
      {cell(A[1], "anti", 100, 16)}
      {cell(A[2], "anti", 20, 76)}
      {cell(A[3], "main", 100, 76)}
      <line x1={52} y1={38} x2={132} y2={98} strokeWidth={2.5} className="stroke-emerald-500 dark:stroke-emerald-400" />
      <line x1={132} y1={38} x2={52} y2={98} strokeWidth={2.5} strokeDasharray="5 4" className="stroke-rose-500 dark:stroke-rose-400" />
      <text x={200} y={44} className="fill-emerald-700 font-mono text-[13px] font-semibold dark:fill-emerald-300">{`+ ${f(A[0])}×${f(A[3])}`}</text>
      <text x={200} y={62} className="fill-emerald-700 font-mono text-[13px] font-bold dark:fill-emerald-300">{`= ${f(main)}`}</text>
      <text x={200} y={96} className="fill-rose-700 font-mono text-[13px] font-semibold dark:fill-rose-300">{`− ${f(A[1])}×${f(A[2])}`}</text>
      <text x={200} y={114} className="fill-rose-700 font-mono text-[13px] font-bold dark:fill-rose-300">{`= ${f(anti)}`}</text>
      <rect x={20} y={146} width={280} height={46} rx={10} className="fill-blue-50 stroke-blue-500 dark:fill-blue-500/10 dark:stroke-blue-400" strokeWidth={1.5} />
      <text x={160} y={175} textAnchor="middle" className="fill-blue-700 font-mono text-[15px] font-bold dark:fill-blue-300">{`det A = ${f(main)} − ${f(anti)} = ${f(d)}`}</text>
      <text x={160} y={222} textAnchor="middle" className="fill-zinc-500 font-mono text-[12px] dark:fill-zinc-400">{`det B = ${f(B[0])}×${f(B[3])} − ${f(B[1])}×${f(B[2])} = ${f(det2(B))}`}</text>
    </svg>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={diagram}
      rows={[
        { label: t("mainDiagonal"), value: `${f(A[0])} × ${f(A[3])} = ${f(main)}` },
        { label: t("antiDiagonal"), value: `${f(A[1])} × ${f(A[2])} = ${f(anti)}` },
        { label: t("difference"), value: `${f(main)} − ${f(anti)}` },
        { label: t("detA"), value: f(d), emphasize: true },
        { label: t("detB"), value: f(det2(B)) },
      ]}
    />
  );
}
