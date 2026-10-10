"use client";
import { useTranslations } from "next-intl";
import { columns2, det2, frobenius2, singularValues2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

/**
 * Type #5 (Ranked Horizontal Bar List): every way of measuring how much A stretches space —
 * largest and smallest stretch (singular values), each column's length, the Frobenius norm and
 * the area factor |det A| — sorted from largest to smallest.
 */
export default function MatrixStretchRankedBars() {
  const t = useTranslations("tools.matrix-calculator.education.lab.stretch");
  const { A, f } = useMatrixModel();
  const [s1, s2] = singularValues2(A);
  const cols = columns2(A);
  const items = [
    { key: "sigma1", label: `σ₁ · ${t("sigma1")}`, v: s1, cls: "bg-blue-600 dark:bg-blue-400" },
    { key: "sigma2", label: `σ₂ · ${t("sigma2")}`, v: s2, cls: "bg-sky-400 dark:bg-sky-300" },
    { key: "col1", label: `|Aî| · ${t("col1")}`, v: cols.len1, cls: "bg-rose-500 dark:bg-rose-400" },
    { key: "col2", label: `|Aĵ| · ${t("col2")}`, v: cols.len2, cls: "bg-emerald-500 dark:bg-emerald-400" },
    { key: "frob", label: `‖A‖F · ${t("frobenius")}`, v: frobenius2(A), cls: "bg-violet-500 dark:bg-violet-400" },
    { key: "det", label: `|det A| · ${t("area")}`, v: Math.abs(det2(A)), cls: "bg-amber-500 dark:bg-amber-400" },
  ].sort((a, b) => b.v - a.v);
  const max = Math.max(1e-9, ...items.map((i) => i.v));

  const list = (
    <ol className="w-full space-y-2 lg:w-[360px]">
      {items.map((it, rank) => (
        <li key={it.key}>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="text-zinc-600 dark:text-zinc-300">{`${rank + 1}. ${it.label}`}</span>
            <span dir="ltr" className="font-mono font-bold text-zinc-800 dark:text-zinc-100">{f(it.v)}</span>
          </div>
          <div className="mt-1 h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className={`h-3 rounded-full ${it.cls}`} style={{ width: `${Math.max(1.5, (it.v / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: "σ₁", value: f(s1) },
        { label: "σ₂", value: f(s2) },
        { label: "σ₁ × σ₂ = |det A|", value: `${f(s1 * s2)} = ${f(Math.abs(det2(A)))}`, emphasize: true },
        { label: "σ₁² + σ₂² = ‖A‖F²", value: `${f(s1 * s1 + s2 * s2)} = ${f(frobenius2(A) ** 2)}` },
      ]}
    />
  );
}
