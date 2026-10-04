"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Polygon, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, evalPoly, fmt } from "./mathSolverEducationMath";

const LIGHT = { lhs: "#2563eb", rhs: "#dc2626", fill: "#9333ea" };
const DARK = { lhs: "#60a5fa", rhs: "#f87171", fill: "#c084fc" };

type Vector2 = [number, number];

/** Intersection-and-area diagram: the LHS and RHS of the active equation as two real curves —
 * wherever they cross IS the solution — with the area between them shaded, and a draggable
 * explorer point reading off both curves' live values at any x. */
export default function IntersectionAreaDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.intersectionArea");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  let lhsFn: (x: number) => number;
  let rhsFn: (x: number) => number;
  if (dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree >= 2)) {
    lhsFn = (x) => evalPoly(eq.coeffs, x) + (dims.mode === "quadratic-equation" ? -(n.quadC ?? 0) : 0);
    rhsFn = () => (dims.mode === "quadratic-equation" ? -(n.quadC ?? 0) : 0);
  } else if (dims.mode === "linear-equation") {
    lhsFn = (x) => (n.linearA ?? 0) * x + (n.linearB ?? 0);
    rhsFn = (x) => (n.linearC ?? 0) * x + (n.linearD ?? 0);
  } else {
    const result = -eq.coeffs[0];
    lhsFn = () => result;
    rhsFn = (x) => x;
  }

  const domain: [number, number] = [-8, 8];
  const points: Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = domain[0] + ((domain[1] - domain[0]) * i) / 40;
    points.push([x, lhsFn(x)]);
  }
  for (let i = 40; i >= 0; i--) {
    const x = domain[0] + ((domain[1] - domain[0]) * i) / 40;
    points.push([x, rhsFn(x)]);
  }

  const explorer = useMovablePoint([2, lhsFn(2)], { constrain: (p) => [Math.min(8, Math.max(-8, p[0])), lhsFn(Math.min(8, Math.max(-8, p[0])))], color: colors.lhs });
  const ex = explorer.point[0];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: domain, y: [-14, 14] }} height={230} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 2 }} yAxis={{ lines: 4 }} />
              <Polygon points={points} color={colors.fill} fillOpacity={0.15} strokeOpacity={0} />
              <Plot.OfX y={lhsFn} color={colors.lhs} weight={2.5} />
              <Plot.OfX y={rhsFn} color={colors.rhs} weight={2.5} />
              {explorer.element}
            </Mafs>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.lhs"), value: fmt(lhsFn(ex)) },
            { label: t("worked.rhs"), value: fmt(rhsFn(ex)) },
            { label: t("worked.gap"), value: fmt(Math.abs(lhsFn(ex) - rhsFn(ex))), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
