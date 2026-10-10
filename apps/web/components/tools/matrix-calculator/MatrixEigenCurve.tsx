"use client";
import { useTranslations } from "next-intl";
import { charPoly2, det2, eigen2, trace2 } from "@tooloralabs/tools";
import MatrixIndicatorCard from "./MatrixIndicatorCard";
import { useMatrixModel } from "./MatrixLiveContext";

const W = 340;
const H = 230;
const PAD = { l: 34, r: 12, t: 16, b: 28 };

/**
 * Type #7 (Trend Line with Highlighted Reference Point): A's characteristic polynomial
 * p(λ) = λ² − tr(A)·λ + det(A), with its roots (the eigenvalues) pinned on the axis — or, when it
 * never crosses zero, its lowest point marked to show why the eigenvalues are complex.
 */
export default function MatrixEigenCurve() {
  const t = useTranslations("tools.matrix-calculator.education.lab.eigen");
  const { A, f } = useMatrixModel();
  const tr = trace2(A);
  const d = det2(A);
  const e = eigen2(A);
  const c = tr / 2;
  const w = Math.max(2, e.real ? Math.abs(e.l1 - e.l2) * 0.9 : e.im * 2);
  const x0 = c - w;
  const x1 = c + w;
  const N = 60;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const l = x0 + ((x1 - x0) * i) / N;
    return [l, charPoly2(A, l)] as const;
  });
  const ys = pts.map((p) => p[1]);
  const yMax = Math.max(1, ...ys);
  const yMin = Math.min(-1, ...ys);
  const sx = (l: number) => PAD.l + ((l - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (v: number) => PAD.t + ((yMax - v) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const path = pts.map(([l, v], i) => `${i ? "L" : "M"}${sx(l).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  const vertex = charPoly2(A, c);

  const chart = (
    <svg style={{ direction: "ltr" }} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("title")} className="mx-auto max-w-full">
      <line x1={PAD.l} x2={W - PAD.r} y1={sy(0)} y2={sy(0)} strokeWidth={1.2} className="stroke-zinc-400 dark:stroke-zinc-500" />
      {x0 < 0 && x1 > 0 && <line x1={sx(0)} x2={sx(0)} y1={PAD.t} y2={H - PAD.b} strokeWidth={1} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />}
      <path d={path} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      {e.real ? (
        [e.l1, e.l2].map((l, i) => (
          <g key={i}>
            <circle cx={sx(l)} cy={sy(0)} r={6} className="fill-rose-500 stroke-white dark:fill-rose-400 dark:stroke-zinc-900" strokeWidth={2} />
            <text x={sx(l)} y={sy(0) + (i ? 20 : -12)} textAnchor="middle" className="fill-rose-700 font-mono text-[11px] font-bold dark:fill-rose-300">{`λ${i ? "₂" : "₁"} = ${f(l)}`}</text>
          </g>
        ))
      ) : (
        <g>
          <circle cx={sx(c)} cy={sy(vertex)} r={6} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" strokeWidth={2} />
          <text x={sx(c)} y={sy(vertex) + 20} textAnchor="middle" className="fill-amber-700 font-mono text-[11px] font-bold dark:fill-amber-300">{`λ = ${f(c)} ± ${f(e.im)}i`}</text>
        </g>
      )}
      <text x={PAD.l} y={H - 8} className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">{f(x0, 1)}</text>
      <text x={W - PAD.r} y={H - 8} textAnchor="end" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">{f(x1, 1)}</text>
      <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">λ</text>
      <text x={4} y={PAD.t + 4} className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">p(λ)</text>
    </svg>
  );

  return (
    <MatrixIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={chart}
      rows={[
        { label: t("polynomial"), value: `λ² − ${f(tr)}λ + ${f(d)}` },
        { label: t("discriminant"), value: `${f(tr)}² − 4×${f(d)} = ${f(e.discriminant)}` },
        { label: "λ₁, λ₂", value: e.real ? `${f(e.l1)}, ${f(e.l2)}` : `${f(c)} ± ${f(e.im)}i`, emphasize: true },
        { label: t("sumCheck"), value: `λ₁ + λ₂ = ${f(tr)}` },
        { label: t("productCheck"), value: `λ₁ × λ₂ = ${f(d)}` },
      ]}
    />
  );
}
