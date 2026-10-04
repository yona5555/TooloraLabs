"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Point, Text, Line, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { useMathSolverLive } from "./MathSolverLiveContext";
import {
  parseMathSolverDraft,
  deriveHeroEquation,
  evalPoly,
  solveLinearRoot,
  solveQuadraticRoots,
  quadraticVertex,
  findRealRootsNumerically,
  newtonIterate,
  snapDragValue,
  fmt,
} from "./mathSolverEducationMath";

type Vector2 = [number, number];
const MIN_V = -30;
const MAX_V = 30;

const LIGHT = { curve: "#2563eb", root: "#dc2626", vertex: "#16a34a", yint: "#9333ea", trackX: "#16a34a", trackY: "#dc2626", tangent: "#f97316" };
const DARK = { curve: "#60a5fa", root: "#f87171", vertex: "#4ade80", yint: "#c084fc", trackX: "#4ade80", trackY: "#f87171", tangent: "#fb923c" };

function clampV(v: number): number {
  return Math.min(MAX_V, Math.max(MIN_V, v));
}

function maxAbsOverDomain(fn: (x: number) => number, domain: [number, number], steps = 28): number {
  let max = 0;
  for (let i = 0; i <= steps; i++) {
    const x = domain[0] + ((domain[1] - domain[0]) * i) / steps;
    const v = fn(x);
    if (Number.isFinite(v)) max = Math.max(max, Math.abs(v));
  }
  return max;
}

/**
 * The hero: f(x) = LHS - RHS of whichever of the 4 modes is active, graphed with Mafs. Degree <=2
 * (linear, quadratic, the fraction-operation reframing, and any 2-term-or-fewer derivative input)
 * gets real draggable handles on its roots/vertex/y-intercept, each with its own inversion rule so
 * dragging any one handle produces a mathematically consistent curve (holding a sensible other
 * quantity fixed — see the inline comments per handle). Degree >=3 (derivative mode with 3+ terms)
 * has no simple closed form, so it falls back to ONE free explorer point used for Newton's-method
 * root-finding, with the tangent line shown live — this is the "numeric roots for non-polynomials"
 * path the spec calls for, extended honestly to any polynomial too complex for a closed form.
 */
export default function MathSolverGraphDrag() {
  const t = useTranslations("tools.step-by-step-math-solver.education.hero");
  const tMode = useTranslations("tools.step-by-step-math-solver.form");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const explorerXState = Number.isFinite(parseFloat(dims.explorerX)) ? parseFloat(dims.explorerX) : 2;
  const eq = deriveHeroEquation(n);
  const mode = dims.mode;

  // ---- target positions for each handle, derived from the live equation ----
  function targetRoot1(): Vector2 {
    if (eq.degree === 1) {
      const r = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
      return [r ?? 0, 0];
    }
    if (eq.degree === 2) {
      const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
      if (r.kind === "two-real") return [r.x1, 0];
      if (r.kind === "one-real") return [r.x, 0];
      return [r.re, 0];
    }
    return [explorerXState, evalPoly(eq.coeffs, explorerXState)];
  }
  function targetRoot2(): Vector2 {
    if (eq.degree === 2) {
      const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
      if (r.kind === "two-real") return [r.x2, 0];
      return [r.kind === "one-real" ? r.x : r.re, 0];
    }
    return [0, 0];
  }
  function targetVertex(): Vector2 {
    if (eq.degree === 2) {
      const v = quadraticVertex(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
      return [v.x, v.y];
    }
    return [0, 0];
  }
  function targetYIntercept(): Vector2 {
    return [0, evalPoly(eq.coeffs, 0)];
  }


  const usesRoot2 = eq.degree === 2;
  const usesVertex = eq.degree === 2;
  const usesYIntercept = eq.degree === 1 || eq.degree === 2;
  const usesExplorerOnly = eq.degree >= 3;

  const lastRoot1 = useRef<Vector2>(targetRoot1());
  const lastRoot2 = useRef<Vector2>(targetRoot2());
  const lastVertex = useRef<Vector2>(targetVertex());
  const lastYInt = useRef<Vector2>(targetYIntercept());
  const suppressRoot1 = useRef(false);
  const suppressRoot2 = useRef(false);
  const suppressVertex = useRef(false);
  const suppressYInt = useRef(false);

  const constrainRoot1 = (p: Vector2): Vector2 => (usesExplorerOnly ? [clampV(p[0]), evalPoly(eq.coeffs, clampV(p[0]))] : [clampV(p[0]), 0]);
  const constrainRoot2 = (p: Vector2): Vector2 => [clampV(p[0]), 0];
  const constrainVertex = (p: Vector2): Vector2 => [clampV(p[0]), clampV(p[1])];
  const constrainYInt = (p: Vector2): Vector2 => [0, clampV(p[1])];

  const pointRoot1 = useMovablePoint(targetRoot1(), { constrain: constrainRoot1, color: colors.root });
  const pointRoot2 = useMovablePoint(targetRoot2(), { constrain: constrainRoot2, color: colors.root });
  const pointVertex = useMovablePoint(targetVertex(), { constrain: constrainVertex, color: colors.vertex });
  const pointYInt = useMovablePoint(targetYIntercept(), { constrain: constrainYInt, color: colors.yint });

  // ---- external (field-edit) -> point sync ----
  useEffect(() => {
    const t1 = targetRoot1();
    if (Math.abs(t1[0] - lastRoot1.current[0]) > 0.004 || Math.abs(t1[1] - lastRoot1.current[1]) > 0.004) {
      suppressRoot1.current = true;
      pointRoot1.setPoint(t1);
      lastRoot1.current = t1;
    }
    if (usesRoot2) {
      const t2 = targetRoot2();
      if (Math.abs(t2[0] - lastRoot2.current[0]) > 0.004) {
        suppressRoot2.current = true;
        pointRoot2.setPoint(t2);
        lastRoot2.current = t2;
      }
    }
    if (usesVertex) {
      const tv = targetVertex();
      if (Math.abs(tv[0] - lastVertex.current[0]) > 0.004 || Math.abs(tv[1] - lastVertex.current[1]) > 0.004) {
        suppressVertex.current = true;
        pointVertex.setPoint(tv);
        lastVertex.current = tv;
      }
    }
    if (usesYIntercept) {
      const ty = targetYIntercept();
      if (Math.abs(ty[1] - lastYInt.current[1]) > 0.004) {
        suppressYInt.current = true;
        pointYInt.setPoint(ty);
        lastYInt.current = ty;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, explorerXState, ...eq.coeffs]);

  // ---- helpers to write a new (coeffs) back into whichever underlying fields the active mode uses ----
  function commitCoeffs(c0: number, c1: number, c2?: number) {
    if (mode === "linear-equation") {
      setDim("linearA", `${snapDragValue(c1)}`);
      setDim("linearB", `${snapDragValue(c0)}`);
      setDim("linearC", "0");
      setDim("linearD", "0");
    } else if (mode === "quadratic-equation") {
      setDim("quadA", `${snapDragValue(c2 ?? 1) || 1}`);
      setDim("quadB", `${snapDragValue(c1)}`);
      setDim("quadC", `${snapDragValue(c0)}`);
    } else if (mode === "fraction-operation") {
      // Only the root (= the fraction's own result) is meaningful here; solve fracA holding the rest fixed.
      const result = -c0;
      const b = n.fracB || 1;
      const d = n.fracD || 1;
      const c = n.fracC ?? 1;
      let newA: number;
      switch (n.fracOp) {
        case "subtract":
          newA = (result + c / d) * b;
          break;
        case "multiply":
          newA = c !== 0 ? (result / (c / d)) * b : n.fracA ?? 1;
          break;
        case "divide":
          newA = (result * (c / d)) * b;
          break;
        case "add":
        default:
          newA = (result - c / d) * b;
          break;
      }
      setDim("fracA", `${snapDragValue(newA)}`);
    }
    // derivative mode's closed-form (degree<=2, i.e. <=2 nonzero terms beyond index 0) is read-only
    // for dragging in this build: rewriting an arbitrary live term list from 3 target coefficients
    // is not a well-posed inverse (many term lists share the same expanded polynomial), so the
    // derivative-mode handles are shown live but committed back only through the real term fields.
  }

  // ---- drag-commit effects ----
  useEffect(() => {
    if (suppressRoot1.current) {
      suppressRoot1.current = false;
      return;
    }
    const p = pointRoot1.point;
    if (Math.abs(p[0] - lastRoot1.current[0]) <= 0.004 && Math.abs(p[1] - lastRoot1.current[1]) <= 0.004) return;
    lastRoot1.current = p;
    if (usesExplorerOnly) {
      setDim("explorerX", `${snapDragValue(p[0])}`);
      return;
    }
    if (eq.degree === 1) {
      // Keep the y-intercept fixed, solve the new slope from the new root.
      const c0 = eq.coeffs[0];
      const newRoot = p[0] || 1e-6;
      const c1 = -c0 / newRoot;
      commitCoeffs(c0, c1);
    } else if (eq.degree === 2) {
      // Keep root2 and leading coefficient 'a' fixed; rebuild from the two roots. Reads root2's
      // own last COMMITTED value (a ref), never pointRoot2.point directly: during an active drag,
      // every intermediate commit re-syncs both root points from the snapped result, which can
      // reprogrammatically nudge pointRoot2.point mid-gesture — reading that live, bouncing value
      // back into this formula created a feedback fight between the two points that, over a real
      // 20-step drag, could cancel out to a net-zero change by the time the user released the
      // mouse. lastRoot2.current only updates when root2 itself genuinely commits, so it's stable.
      const a = eq.coeffs[2] || 1;
      const r1 = p[0];
      const r2 = lastRoot2.current[0];
      commitCoeffs(a * r1 * r2, -a * (r1 + r2), a);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointRoot1.point]);

  useEffect(() => {
    if (!usesRoot2) return;
    if (suppressRoot2.current) {
      suppressRoot2.current = false;
      return;
    }
    const p = pointRoot2.point;
    if (Math.abs(p[0] - lastRoot2.current[0]) <= 0.004) return;
    lastRoot2.current = p;
    const a = eq.coeffs[2] || 1;
    const r1 = lastRoot1.current[0];
    const r2 = p[0];
    commitCoeffs(a * r1 * r2, -a * (r1 + r2), a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointRoot2.point]);

  useEffect(() => {
    if (!usesVertex) return;
    if (suppressVertex.current) {
      suppressVertex.current = false;
      return;
    }
    const p = pointVertex.point;
    if (Math.abs(p[0] - lastVertex.current[0]) <= 0.004 && Math.abs(p[1] - lastVertex.current[1]) <= 0.004) return;
    lastVertex.current = p;
    // Keep leading coefficient 'a' fixed, move the vertex to the new (vx, vy).
    const a = eq.coeffs[2] || 1;
    const vx = p[0];
    const vy = p[1];
    const b = -2 * a * vx;
    const c = vy + a * vx * vx;
    commitCoeffs(c, b, a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointVertex.point]);

  useEffect(() => {
    if (!usesYIntercept) return;
    if (suppressYInt.current) {
      suppressYInt.current = false;
      return;
    }
    const p = pointYInt.point;
    if (Math.abs(p[1] - lastYInt.current[1]) <= 0.004) return;
    lastYInt.current = p;
    if (eq.degree === 1) {
      commitCoeffs(p[1], eq.coeffs[1]);
    } else if (eq.degree === 2) {
      commitCoeffs(p[1], eq.coeffs[1], eq.coeffs[2]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointYInt.point]);

  // Equation text: eq.label, computed by the shared formatEquationLabel() in packages/tools,
  // always read directly from the committed equation — NEVER reconstructed from live root-point
  // positions. An earlier version rebuilt (a,b,c) from the two root points on every render for a
  // livelier mid-drag preview, but when the roots are complex both root-point targets collapse to
  // the same real part, so the "reconstruction" threw away b/c information and displayed a
  // DIFFERENT equation than what was actually committed to the input fields (e.g. showing
  // "169/32" when the real committed value was the clean "5.5"). Reading eq.label directly is
  // simple, reuses the one formatter every indicator also uses, and provably matches the fields.

  // ---- viewBox framed around the curve's own points of interest (roots/vertex), not a fixed
  // window -- a wide fixed domain made a tight parabola (vertex depth -8) look almost flat against
  // its own far-away wings, and hid the vertex/y-intercept points near y=0 on screen. Found via an
  // actual screenshot during this build, not a hypothetical.
  const curveFn = (x: number) => evalPoly(eq.coeffs, x);
  const poiX: number[] = [0];
  const poiY: number[] = [evalPoly(eq.coeffs, 0)];
  if (usesExplorerOnly) {
    poiX.push(explorerXState - 6, explorerXState + 6);
    for (const r of findRealRootsNumerically(eq.coeffs, [explorerXState - 15, explorerXState + 15])) poiX.push(r);
  } else if (eq.degree === 1) {
    const r = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
    if (r !== null) poiX.push(r);
  } else if (eq.degree === 2) {
    const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    if (r.kind === "two-real") poiX.push(r.x1, r.x2);
    else if (r.kind === "one-real") poiX.push(r.x);
    else poiX.push(r.re);
    const v = quadraticVertex(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    poiX.push(v.x);
    poiY.push(v.y);
  }
  const xSpan = Math.max(...poiX) - Math.min(...poiX);
  const xPad = Math.max(2.5, xSpan * 0.4);
  const domain: [number, number] = [Math.min(...poiX) - xPad, Math.max(...poiX) + xPad];
  const curveYMax = maxAbsOverDomain(curveFn, domain);
  const poiYMax = Math.max(...poiY.map((y) => Math.abs(y)));
  const yMax = Math.max(6, Math.max(curveYMax, poiYMax) * 1.3);
  const viewBox = { x: domain, y: [-yMax, yMax] as [number, number] };

  // ---- step-linked visual emphasis ----
  const step = dims.selectedStep ?? 3;
  const showCoeffHighlight = step >= 1;
  const showKeyQuantity = step >= 2;
  const showFinalRoots = step >= 3;

  // ---- tracking lines to the active point (root1 for degree<=1, vertex for degree2 when step<3, else root1) ----
  const trackPoint: Vector2 = usesExplorerOnly ? [explorerXState, evalPoly(eq.coeffs, explorerXState)] : eq.degree === 2 && !showFinalRoots ? pointVertex.point : pointRoot1.point;

  let content: ReactNode;
  if (usesExplorerOnly) {
    const x0 = explorerXState;
    const y0 = evalPoly(eq.coeffs, x0);
    const steps = newtonIterate(eq.coeffs, x0, 1);
    const slope = steps.length > 1 ? (steps[1].x !== x0 ? (0 - y0) / (steps[1].x - x0) : 0) : 0;
    const numericRoots = findRealRootsNumerically(eq.coeffs, domain);
    content = (
      <>
        <Plot.OfX y={curveFn} color={colors.curve} weight={2.5} />
        <Line.Segment point1={[x0 - 2, y0 - slope * 2]} point2={[x0 + 2, y0 + slope * 2]} color={colors.tangent} weight={2} />
        {showFinalRoots && numericRoots.map((r, i) => <Point key={i} x={r} y={0} color={colors.root} svgCircleProps={{ r: 5 }} />)}
        {pointRoot1.element}
      </>
    );
  } else {
    content = (
      <>
        <Plot.OfX y={curveFn} color={colors.curve} weight={2.5} />
        {/* Tracking lines/labels painted FIRST (underneath): they're deliberately drawn at the
            active point's own position (trackPoint), so if the interactive point elements were
            painted before them, these would sit on top and silently swallow the point's drag
            events — confirmed via an actual Playwright drag that never moved the point at all. */}
        <Line.Segment point1={[trackPoint[0], 0]} point2={trackPoint} color={colors.trackX} weight={1.5} style="dashed" opacity={0.75} />
        <Line.Segment point1={[0, trackPoint[1]]} point2={trackPoint} color={colors.trackY} weight={1.5} style="dashed" opacity={0.75} />
        <Text x={trackPoint[0]} y={0} attach="s" attachDistance={10} size={12} color={colors.trackX}>
          {`x = ${fmt(trackPoint[0])}`}
        </Text>
        <Text x={0} y={trackPoint[1]} attach="w" attachDistance={10} size={12} color={colors.trackY}>
          {`f = ${fmt(trackPoint[1])}`}
        </Text>
        {eq.degree === 2 && showKeyQuantity && <g data-point-role="vertex">{pointVertex.element}</g>}
        {usesYIntercept && <g data-point-role="yintercept">{pointYInt.element}</g>}
        {showFinalRoots && <g data-point-role="root1">{pointRoot1.element}</g>}
        {showFinalRoots && usesRoot2 && <g data-point-role="root2">{pointRoot2.element}</g>}
      </>
    );
  }

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center justify-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{tMode(`mode.${mode}`)}</span>
        <span dir="ltr" className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {eq.label}
        </span>
        {showCoeffHighlight && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            {t("stepBadge", { step: step + 1, total: 4 })}
          </span>
        )}
      </div>

      <div dir="ltr" aria-label={t("ariaLabel", { mode: tMode(`mode.${mode}`) })} className="mafs-canvas mx-auto w-full max-w-[480px] overflow-hidden rounded-xl">
        <Mafs viewBox={viewBox} height={280} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: Math.max(1, Math.round(domain[1] / 4)) }} yAxis={{ lines: Math.max(1, Math.round(yMax / 4)) }} />
          {content}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {usesExplorerOnly ? t("hintExplorerOnly") : t("hint")}
      </p>
    </div>
  );
}
