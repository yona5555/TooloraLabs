"use client";
import { useTranslations } from "next-intl";
import { det2, inverse2, mul2, type Mat2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

/** Type #11 (Side-by-Side Equivalence): A × A⁻¹ and A⁻¹ × A, both multiplied out live, landing on the same identity. */
export default function MatrixInverseEquivalence() {
  const t = useTranslations("tools.matrix-calculator.education.lab.inverse");
  const { A, f } = useMatrixModel();
  const d = det2(A);
  const inv = inverse2(A);

  const block = (m: Mat2 | null, label: string, tone: string) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`grid grid-cols-2 gap-x-2 gap-y-1 rounded-lg border-x-2 px-2 py-1.5 font-mono text-sm font-semibold ${tone}`}>
        {m ? m.map((v, i) => <span key={i} className="min-w-[2.5rem] text-center">{f(v, 3)}</span>) : <span className="col-span-2 px-3 py-2 text-center">∄</span>}
      </div>
      <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
  const op = (s: string) => <span className="font-mono text-lg font-bold text-zinc-400">{s}</span>;
  const aTone = "border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300";
  const iTone = "border-teal-500 text-teal-700 dark:border-teal-400 dark:text-teal-300";
  const idTone = "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-300";

  const panel = (
    <div dir="ltr" className="flex flex-col items-center gap-4 lg:w-[360px]">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {block(A, "A", aTone)}
        {op("×")}
        {block(inv, "A⁻¹", iTone)}
        {op("=")}
        {block(inv ? mul2(A, inv) : null, "I", idTone)}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {block(inv, "A⁻¹", iTone)}
        {op("×")}
        {block(A, "A", aTone)}
        {op("=")}
        {block(inv ? mul2(inv, A) : null, "I", idTone)}
      </div>
    </div>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={panel}
      rows={
        inv
          ? [
              { label: "det A", value: f(d) },
              { label: t("adjugate"), value: `[${f(A[3])}, ${f(-A[1])}; ${f(-A[2])}, ${f(A[0])}]` },
              { label: t("scale"), value: `1 / ${f(d)} = ${f(1 / d, 4)}` },
              { label: "det A⁻¹", value: `1 / ${f(d)} = ${f(det2(inv), 4)}` },
              { label: t("check"), value: t("checkOk"), emphasize: true },
            ]
          : [
              { label: "det A", value: f(d) },
              { label: t("check"), value: t("singular"), emphasize: true },
            ]
      }
    />
  );
}
