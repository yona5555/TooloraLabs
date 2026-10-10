"use client";
import { useTranslations } from "next-intl";
import { det2, frobenius2, trace2, transpose2, type Mat2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

/** Type #16 (Side-by-Side Comparison Cards): A and Aᵀ with the swapped off-diagonal pair highlighted and the invariants that do not move. */
export default function MatrixTransposeCards() {
  const t = useTranslations("tools.matrix-calculator.education.lab.transpose");
  const { A, f } = useMatrixModel();
  const T = transpose2(A);
  const symmetric = Math.abs(A[1] - A[2]) < 1e-12;

  const card = (m: Mat2, title: string, tone: string) => (
    <div className={`w-[160px] rounded-xl border p-3 ${tone}`}>
      <p className="text-center font-mono text-sm font-bold">{title}</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-sm">
        {m.map((v, i) => (
          <span
            key={i}
            className={`rounded-md py-1 text-center font-semibold ${i === 1 || i === 2 ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"}`}
          >
            {f(v)}
          </span>
        ))}
      </div>
      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between gap-2"><dt className="opacity-70">det</dt><dd className="font-mono font-semibold">{f(det2(m))}</dd></div>
        <div className="flex justify-between gap-2"><dt className="opacity-70">tr</dt><dd className="font-mono font-semibold">{f(trace2(m))}</dd></div>
        <div className="flex justify-between gap-2"><dt className="opacity-70">‖·‖F</dt><dd className="font-mono font-semibold">{f(frobenius2(m))}</dd></div>
      </dl>
    </div>
  );

  const cards = (
    <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3">
      {card(A, "A", "border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/5 dark:text-blue-100")}
      <span className="font-mono text-xl font-bold text-amber-500">⇄</span>
      {card(T, "Aᵀ", "border-teal-200 bg-teal-50/50 text-teal-900 dark:border-teal-500/30 dark:bg-teal-500/5 dark:text-teal-100")}
    </div>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={cards}
      rows={[
        { label: t("swapped"), value: `${f(A[1])} ⇄ ${f(A[2])}` },
        { label: t("kept"), value: `${f(A[0])}, ${f(A[3])}` },
        { label: t("sameDet"), value: `${f(det2(A))} = ${f(det2(T))}` },
        { label: t("symmetric"), value: symmetric ? t("yes") : t("no"), emphasize: true },
      ]}
    />
  );
}
