"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Point, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, solveLinearRoot, fmt, snapDragValue } from "./mathSolverEducationMath";

const LIGHT = { curve: "#2563eb", point: "#dc2626" };
const DARK = { curve: "#60a5fa", point: "#f87171" };

/** Response curve: the live root plotted as a function of ONE of the equation's own coefficients
 * sweeping through a range — with a draggable point ON that curve that is genuinely the current
 * coefficient value, so dragging it rewrites the real field, not just a preview. */
export default function RootsVsParameterCurve() {
  const t = useTranslations("tools.step-by-step-math-solver.education.rootsVsParameter");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  let paramLabel = "";
  let currentParam = 0;
  let rootFn: (p: number) => number;
  let commitParam: (p: number) => void;

  if (dims.mode === "quadratic-equation") {
    paramLabel = "c";
    currentParam = n.quadC ?? 0;
    rootFn = (c) => {
      const r = solveQuadraticRoots(c, eq.coeffs[1], eq.coeffs[2]);
      return r.kind === "complex" ? r.re : r.kind === "two-real" ? r.x1 : r.x;
    };
    commitParam = (v) => setDim("quadC", `${snapDragValue(v)}`);
  } else if (dims.mode === "linear-equation") {
    paramLabel = "d";
    currentParam = n.linearD ?? 0;
    rootFn = (d) => solveLinearRoot((n.linearB ?? 0) - d, (n.linearA ?? 0) - (n.linearC ?? 0)) ?? 0;
    commitParam = (v) => setDim("linearD", `${snapDragValue(v)}`);
  } else if (dims.mode === "fraction-operation") {
    paramLabel = "A";
    currentParam = n.fracA ?? 0;
    rootFn = (fa) => fa / (n.fracB || 1) + (n.fracC ?? 0) / (n.fracD || 1);
    commitParam = (v) => setDim("fracA", `${snapDragValue(v)}`);
  } else {
    paramLabel = t("leadingTermLabel");
    currentParam = n.polynomialTerms[0]?.coefficient ?? 0;
    rootFn = (coeff) => {
      const terms = [...n.polynomialTerms];
      if (terms.length > 0) terms[0] = { ...terms[0], coefficient: coeff };
      return terms.reduce((s, tm) => s + tm.coefficient, 0);
    };
    commitParam = () => {};
  }

  const domain: [number, number] = [currentParam - 8, currentParam + 8];
  const paramPoint = useMovablePoint([currentParam, rootFn(currentParam)], {
    constrain: (p) => [Math.max(domain[0], Math.min(domain[1], p[0])), rootFn(Math.max(domain[0], Math.min(domain[1], p[0])))],
    color: colors.point,
  });

  const lastParam = useRef(currentParam);
  const suppress = useRef(false);
  useEffect(() => {
    if (Math.abs(currentParam - lastParam.current) > 0.004) {
      suppress.current = true;
      paramPoint.setPoint([currentParam, rootFn(currentParam)]);
      lastParam.current = currentParam;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParam]);

  function handleRelease() {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    const v = snapDragValue(paramPoint.point[0]);
    lastParam.current = v;
    commitParam(v);
  }

  const yVals = [rootFn(domain[0]), rootFn(domain[1]), rootFn(currentParam)];
  const yMax = Math.max(8, ...yVals.map((v) => Math.abs(v))) * 1.3;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { param: paramLabel })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div
            aria-label={t("ariaLabel")}
            className="mafs-canvas mx-auto w-full max-w-[400px] overflow-hidden rounded-xl"
            onMouseUp={handleRelease}
            onTouchEnd={handleRelease}
          >
            <Mafs viewBox={{ x: domain, y: [-yMax, yMax] }} height={210} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: Math.max(1, Math.round((domain[1] - domain[0]) / 8)) }} yAxis={{ lines: Math.max(1, Math.round(yMax / 4)) }} />
              <Plot.OfX y={rootFn} color={colors.curve} weight={2.5} />
              <Point x={currentParam} y={rootFn(currentParam)} color="#111827" svgCircleProps={{ r: 4 }} />
              {paramPoint.element}
            </Mafs>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: `${paramLabel} (${t("worked.current")})`, value: fmt(currentParam) },
            { label: t("worked.result"), value: fmt(rootFn(currentParam)), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
