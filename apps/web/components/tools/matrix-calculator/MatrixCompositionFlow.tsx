"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { apply2, det2, mul2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

/**
 * Type #2 (Flow Arrow with Embedded Numbers): the point (1, 1) and the unit square's area pushed
 * through B first and then A, landing exactly where A×B sends them in one step.
 */
export default function MatrixCompositionFlow() {
  const t = useTranslations("tools.matrix-calculator.education.lab.composition");
  const { A, B, f, fm } = useMatrixModel();
  const P = mul2(A, B);
  const v0: [number, number] = [1, 1];
  const v1 = apply2(B, v0);
  const v2 = apply2(A, v1);
  const dA = det2(A);
  const dB = det2(B);
  const vec = (v: [number, number]) => `(${f(v[0])}, ${f(v[1])})`;

  const stage = (label: string, point: string, area: string, tone: string) => (
    <div className={`min-w-[96px] rounded-xl border px-3 py-2 text-center ${tone}`}>
      <p className="text-xs font-semibold">{label}</p>
      <p className="font-mono text-sm font-bold">{point}</p>
      <p className="font-mono text-[11px] opacity-80">{area}</p>
    </div>
  );
  const arrow = (m: string) => (
    <div className="flex flex-col items-center px-1">
      <span className="font-mono text-[11px] font-semibold text-blue-700 dark:text-blue-300">{m}</span>
      <ArrowRight className="text-blue-500" size={20} />
    </div>
  );

  const flow = (
    <div className="flex flex-col items-center gap-3 lg:w-[360px]">
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-1">
        {stage(t("start"), vec(v0), "S = 1", "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-200")}
        {arrow(`B · ×${f(Math.abs(dB))}`)}
        {stage(t("afterB"), vec(v1), `S = ${f(Math.abs(dB))}`, "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200")}
        {arrow(`A · ×${f(Math.abs(dA))}`)}
        {stage(t("afterA"), vec(v2), `S = ${f(Math.abs(dA * dB))}`, "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200")}
      </div>
      <div dir="ltr" className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-center font-mono text-sm font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
        {`A×B = ${fm(P)} → ${vec(apply2(P, v0))}`}
      </div>
    </div>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={flow}
      rows={[
        { label: t("stepB"), value: `B·(1, 1) = ${vec(v1)}` },
        { label: t("stepA"), value: `A·${vec(v1)} = ${vec(v2)}` },
        { label: t("oneStep"), value: `(A×B)·(1, 1) = ${vec(apply2(P, v0))}` },
        { label: t("detRule"), value: `${f(dA)} × ${f(dB)} = ${f(det2(P))}`, emphasize: true },
      ]}
    />
  );
}
