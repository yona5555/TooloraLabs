"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber } from "@tooloralabs/core";
import {
  StepByStepMathSolver,
  buildCurvePlot,
  deriveHeroEquation,
  derivPolyCoeffs,
  formatMathValue,
  polyDegree,
  solveQuadraticRoots,
  type CurveKeyKind,
  type PolyCoeffs,
} from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useMathSolverLive } from "./MathSolverLiveContext";
import type { MathSolverDraft } from "./types";

const MathSolverScene3D = dynamic(() => import("./MathSolverScene3D"), { ssr: false, loading: () => null });

const tool = new StepByStepMathSolver();
const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const FRAC_SYMBOL = { add: "+", subtract: "−", multiply: "×", divide: "÷" } as const;

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

const fm = (n: number) => formatMathValue(n);
const xPow = (k: number) => (k === 0 ? "" : k === 1 ? "x" : `x${String(k).split("").map((d) => SUP[d] ?? d).join("")}`);
const paren = (n: number) => (n < 0 ? `(${fm(n)})` : fm(n));

function polyString(coeffs: PolyCoeffs): string {
  const parts: string[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;
    const abs = fm(Math.abs(c));
    const sign = c < 0 ? (parts.length ? " − " : "−") : parts.length ? " + " : "";
    parts.push(`${sign}${i === 0 || abs !== "1" ? abs : ""}${xPow(i)}`);
  }
  return parts.length ? parts.join("") : "0";
}

function numericDraft(draft: MathSolverDraft) {
  return {
    mode: draft.mode,
    linearA: toNum(draft.linearA),
    linearB: toNum(draft.linearB),
    linearC: toNum(draft.linearC),
    linearD: toNum(draft.linearD),
    quadA: toNum(draft.quadA),
    quadB: toNum(draft.quadB),
    quadC: toNum(draft.quadC),
    fracA: toNum(draft.fracA),
    fracB: toNum(draft.fracB),
    fracOp: draft.fracOp,
    fracC: toNum(draft.fracC),
    fracD: toNum(draft.fracD),
    polynomialTerms: draft.polynomialTerms.map((term) => ({ coefficient: toNum(term.coefficient) ?? 0, power: toNum(term.power) ?? 0 })),
  };
}

/**
 * Math-solver live table + 3D curve (site rule: table left, 3D right). Reads
 * the shared live draft, so it follows every keystroke in both the Result card
 * and the encyclopedia.
 */
export default function MathSolverLive3D({ camera = [0.8, 2.4, 8.2] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.step-by-step-math-solver.live3d");
  const tf = useTranslations("tools.step-by-step-math-solver.form");
  const tr = useTranslations("tools.step-by-step-math-solver.result");
  const tc = useTranslations("common.live3d");
  const { dims: draft } = useMathSolverLive();

  const model = useMemo(() => {
    const n = numericDraft(draft);
    const eq = deriveHeroEquation(n);
    const plot = buildCurvePlot(eq.coeffs);
    const solved = tool.execute(n, { locale: "en-US" }).data;
    return { n, eq, plot, solved };
  }, [draft]);

  const { n, eq, plot, solved } = model;
  const coeffs = eq.coeffs;
  const deg = polyDegree(coeffs);
  const isDerivative = draft.mode === "derivative";
  const fx = polyString(coeffs);

  const errorKey =
    solved.error === "missing-input"
      ? "missingInput"
      : solved.error === "no-unique-solution"
        ? "noUniqueSolution"
        : solved.error === "invalid-quadratic-equation"
          ? "invalidQuadraticEquation"
          : solved.error === "invalid-fraction"
            ? "invalidFraction"
            : solved.error === "division-by-zero"
              ? "divisionByZero"
              : "emptyPolynomial";

  const equationRows: LiveTableRow[] = [
    { label: tf("modeLabel"), value: tf(`mode.${draft.mode}`) },
    { label: t("equation"), formula: isDerivative ? `f(x) = ${fx}` : eq.label, value: `f(x) = ${fx}` },
    { label: t("degree"), formula: `deg f`, value: String(deg) },
  ];
  if (draft.mode === "fraction-operation") {
    const op = n.fracOp ?? "add";
    equationRows.push({ label: tr("heading"), formula: `${fm(n.fracA ?? 0)}/${fm(n.fracB ?? 0)} ${FRAC_SYMBOL[op]} ${fm(n.fracC ?? 0)}/${fm(n.fracD ?? 0)}`, value: fm(-(coeffs[0] ?? 0)), emphasize: true });
  }
  for (let k = coeffs.length - 1; k >= 0; k--) {
    if (coeffs[k] === 0 && k !== 0) continue;
    equationRows.push({ label: `${t("coefficient")} ${xPow(k) || "x⁰"}`, formula: k === 0 ? "f(0)" : undefined, value: fm(coeffs[k]) });
  }

  const quantityRows: LiveTableRow[] = [];
  if (deg === 2) {
    const [c, b, a] = coeffs;
    const disc = b * b - 4 * a * c;
    quantityRows.push(
      { label: t("discriminant"), formula: `b² − 4ac = ${paren(b)}² − 4·${paren(a)}·${paren(c)}`, value: fm(disc), emphasize: true },
      { label: t("axisOfSymmetry"), formula: `x = −b / 2a = ${fm(-b)} / ${fm(2 * a)}`, value: fm(-b / (2 * a)) },
      { label: t("sumOfRoots"), formula: `−b / a = ${fm(-b)} / ${fm(a)}`, value: fm(-b / a) },
      { label: t("productOfRoots"), formula: `c / a = ${fm(c)} / ${fm(a)}`, value: fm(c / a) }
    );
    const r = solveQuadraticRoots(c, b, a);
    if (r.kind === "complex") quantityRows.push({ label: t("complexRoots"), formula: `(−b ± i√|D|) / 2a`, value: `${fm(r.re)} ± ${fm(Math.abs(r.im))}i` });
  } else if (deg === 1) {
    quantityRows.push({ label: t("root"), formula: `x = −${paren(coeffs[0])} / ${paren(coeffs[1])}`, value: fm(-coeffs[0] / coeffs[1]), emphasize: true });
  }
  quantityRows.push({ label: t("derivative"), formula: `f′(x) = ${polyString(derivPolyCoeffs(coeffs))}`, value: deg > 0 ? `${t("degree")} ${deg - 1}` : "0" });
  quantityRows.push({ label: t("realRoots"), value: String(plot.realRoots.length) });

  const kindLabel: Record<CurveKeyKind, string> = { root: t("root"), vertex: t("vertex"), "y-intercept": t("yIntercept"), critical: t("critical") };
  const pointRows: LiveTableRow[] = plot.keyPoints.map((k, i) => {
    const sameKindIndex = plot.keyPoints.slice(0, i).filter((o) => o.kind === k.kind).length + 1;
    const multi = plot.keyPoints.filter((o) => o.kind === k.kind).length > 1;
    return {
      label: `${kindLabel[k.kind]}${multi ? ` ${sameKindIndex}` : ""}`,
      formula: `f(${fm(k.x)}) = ${fm(k.y)}`,
      value: `(${fm(k.x)}, ${fm(k.y)})`,
      emphasize: k.kind === "root" || k.kind === "vertex",
    };
  });

  const groups: LiveTableGroup[] = [
    { title: t("groupEquation"), rows: equationRows },
    { title: t("groupQuantities"), rows: quantityRows },
    { title: t("groupPoints"), rows: pointRows },
    {
      title: t("groupWindow"),
      rows: [
        { label: t("xWindow"), value: `[${fm(plot.xRange[0])}, ${fm(plot.xRange[1])}]` },
        { label: t("yWindow"), value: `[${fm(plot.yRange[0])}, ${fm(plot.yRange[1])}]` },
        { label: tr("heading"), value: solved.error ? tr(errorKey) : solved.result, emphasize: !solved.error },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={camera}>
          <MathSolverScene3D plot={plot} showDerivative={isDerivative} labels={kindLabel} />
        </Scene3D>
      }
    />
  );
}
