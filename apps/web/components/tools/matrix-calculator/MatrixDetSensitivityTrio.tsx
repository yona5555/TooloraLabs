"use client";
import { useTranslations } from "next-intl";
import { det2, type Mat2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

/**
 * Type #12 (Sensitivity Trio): det A recomputed with a₁₁ one unit lower, as entered, and one unit
 * higher — the determinant is linear in each entry, so every step moves it by exactly a₂₂.
 */
export default function MatrixDetSensitivityTrio() {
  const t = useTranslations("tools.matrix-calculator.education.lab.sensitivity");
  const { A, f } = useMatrixModel();
  const cases = [-1, 0, 1].map((delta) => {
    const m: Mat2 = [A[0] + delta, A[1], A[2], A[3]];
    return { delta, a11: m[0], det: det2(m) };
  });
  const maxAbs = Math.max(1e-9, ...cases.map((c) => Math.abs(c.det)));
  const label = (d: number) => (d < 0 ? t("low") : d > 0 ? t("high") : t("current"));

  const trio = (
    <div className="flex items-end justify-center gap-3">
      {cases.map((c) => {
        const h = Math.max(6, (Math.abs(c.det) / maxAbs) * 120);
        const current = c.delta === 0;
        return (
          <div key={c.delta} className={`flex w-[100px] flex-col items-center rounded-xl border px-2 pt-2 pb-3 ${current ? "border-blue-400 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-500/10" : "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/40"}`}>
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label(c.delta)}</p>
            <p dir="ltr" className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{`a₁₁ = ${f(c.a11)}`}</p>
            <div className="mt-2 flex h-[128px] items-end">
              <div style={{ height: h }} className={`w-10 rounded-t-md ${c.det < 0 ? "bg-amber-500 dark:bg-amber-400" : current ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-500"}`} />
            </div>
            <p dir="ltr" className="mt-1 font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100">{f(c.det)}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={trio}
      rows={[
        ...cases.map((c) => ({ label: `${label(c.delta)} (a₁₁ = ${f(c.a11)})`, value: `${f(c.a11)}×${f(A[3])} − ${f(A[1])}×${f(A[2])} = ${f(c.det)}`, emphasize: c.delta === 0 })),
        { label: t("step"), value: `Δdet = a₂₂ = ${f(A[3])}` },
      ]}
    />
  );
}
