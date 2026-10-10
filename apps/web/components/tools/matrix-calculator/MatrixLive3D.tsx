"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { classifyTransform2, columns2, conditionNumber2, det2, eigen2, inverse2, mul2, trace2, type Mat2 } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useMatrixModel } from "./MatrixLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const MatrixScene3D = dynamic(() => import("./MatrixScene3D"), { ssr: false, loading: () => null });

const SUB = ["₁₁", "₁₂", "₂₁", "₂₂"];

/**
 * Deep live table (inputs → determinants → operations → inverse → geometry) beside the unit cube
 * morphing from the identity into A. Reads the shared live draft, so it follows every keystroke
 * and every drag, in the Result card and in the encyclopedia alike.
 */
export default function MatrixLive3D({ camera = [4.2, 3.4, 6.4] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.matrix-calculator.live3d");
  const tr = useTranslations("tools.matrix-calculator.result");
  const tc = useTranslations("common.live3d");
  const { A, B, result, f, fm } = useMatrixModel();
  const [replay, setReplay] = useState(0);

  const dA = det2(A);
  const dB = det2(B);
  const P = mul2(A, B);
  const inv = inverse2(A);
  const cols = columns2(A);
  const eig = eigen2(A);
  const kappa = conditionNumber2(A);
  const kind = classifyTransform2(A);
  const tr2 = trace2(A);
  const sumM: Mat2 = [result.sum11, result.sum12, result.sum21, result.sum22];
  const diffM: Mat2 = [result.diff11, result.diff12, result.diff21, result.diff22];
  const transM: Mat2 = [result.transposeA11, result.transposeA12, result.transposeA21, result.transposeA22];
  const p = (v: number) => (v < 0 ? `(${f(v)})` : f(v));

  const productRows = [0, 1, 2, 3].map((i) => {
    const r = i < 2 ? 0 : 2;
    const c = i % 2;
    return {
      label: `(A×B)${SUB[i]}`,
      formula: `${p(A[r])}×${p(B[c])} + ${p(A[r + 1])}×${p(B[c + 2])}`,
      value: f(P[i]),
    };
  });

  const orientation = Math.abs(dA) < 1e-12 ? t("orientationCollapsed") : dA > 0 ? t("orientationKept") : t("orientationFlipped");
  const eigenValue = eig.real ? `${f(eig.l1)}, ${f(eig.l2)}` : `${f(eig.l1)} ± ${f(eig.im)}i`;

  const groups: LiveTableGroup[] = [
    {
      title: t("groupInputs"),
      rows: [
        { label: t("matrixA"), formula: "A", value: fm(A) },
        { label: t("matrixB"), formula: "B", value: fm(B) },
      ],
    },
    {
      title: t("groupDeterminants"),
      rows: [
        { label: tr("determinantA"), formula: `${p(A[0])}×${p(A[3])} − ${p(A[1])}×${p(A[2])}`, value: f(dA), emphasize: true },
        { label: tr("determinantB"), formula: `${p(B[0])}×${p(B[3])} − ${p(B[1])}×${p(B[2])}`, value: f(dB) },
        { label: t("detAB"), formula: `${p(dA)} × ${p(dB)}`, value: f(det2(P)) },
        { label: t("traceA"), formula: `${p(A[0])} + ${p(A[3])}`, value: f(tr2) },
      ],
    },
    {
      title: t("groupOperations"),
      rows: [
        { label: tr("sum"), formula: "aᵢⱼ + bᵢⱼ", value: fm(sumM) },
        { label: tr("difference"), formula: "aᵢⱼ − bᵢⱼ", value: fm(diffM) },
        ...productRows,
        { label: tr("transposeA"), formula: `a₁₂ ↔ a₂₁`, value: fm(transM) },
      ],
    },
    {
      title: t("groupInverse"),
      rows: inv
        ? [
            { label: tr("inverseA"), formula: `(1/${f(dA)})·[${f(A[3])}, ${f(-A[1])}; ${f(-A[2])}, ${f(A[0])}]`, value: fm(inv), emphasize: true },
            { label: t("checkIdentity"), formula: "A × A⁻¹", value: fm(mul2(A, inv)) },
          ]
        : [{ label: tr("inverseA"), formula: `det(A) = 0`, value: t("noInverse") }],
    },
    {
      title: t("groupGeometry"),
      rows: [
        { label: t("volume"), formula: `|${f(dA)}| × 1 × 1`, value: f(Math.abs(dA)), emphasize: true },
        { label: t("orientation"), formula: `sign(${f(dA)})`, value: orientation },
        { label: t("col1Length"), formula: `√(${p(A[0])}² + ${p(A[2])}²)`, value: f(cols.len1) },
        { label: t("col2Length"), formula: `√(${p(A[1])}² + ${p(A[3])}²)`, value: f(cols.len2) },
        { label: t("columnAngle"), formula: "cos⁻¹(Aî·Aĵ / |Aî||Aĵ|)", value: f(cols.angleDeg, 1), unit: "°" },
        { label: t("eigenvalues"), formula: `λ² − ${p(tr2)}λ + ${p(dA)} = 0`, value: eigenValue },
        { label: t("condition"), formula: "κ = σ₁ / σ₂", value: f(kappa, 2) },
        { label: t("kind"), formula: "", value: t(`kinds.${kind}`) },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <div className="relative h-full">
          <Scene3D camera={camera} fitWidth={false}>
            <MatrixScene3D
              m={A}
              replay={replay}
              labels={{
                i: `Aî = (${f(A[0])}, ${f(A[2])})`,
                j: `Aĵ = (${f(A[1])}, ${f(A[3])})`,
                k: "k̂",
              }}
            />
          </Scene3D>
          {/* Volume read-out as a fixed corner badge, so it never collides with the arrow-tip labels. */}
          <span
            dir="ltr"
            className={`pointer-events-none absolute start-2 bottom-2 rounded-md border bg-white/90 px-2 py-0.5 font-mono text-xs font-semibold shadow-sm dark:bg-zinc-900/90 ${dA < 0 ? "border-amber-300 text-amber-700 dark:border-amber-500/50 dark:text-amber-300" : "border-blue-200 text-blue-700 dark:border-blue-500/40 dark:text-blue-300"}`}
          >
            {`V = |det A| = ${f(Math.abs(dA))}`}
          </span>
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/90 px-2 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-blue-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={12} aria-hidden />
            {t("replay")}
          </button>
        </div>
      }
    />
  );
}
