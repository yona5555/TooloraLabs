"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, Point, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, evalPoly, deriveHeroEquation, fmt } from "./mathSolverEducationMath";

const LIGHT = { beam: "#44403c", left: "#2563eb", right: "#dc2626" };
const DARK = { beam: "#d6d3d1", left: "#60a5fa", right: "#f87171" };
const MAX_TILT = 0.4;

/** Balance-scale diagram: the two real sides of the active mode's own equation, weighed against
 * each other at a live, draggable test x — tipping toward whichever side is genuinely larger at
 * that x, and leveling out exactly at a real root. */
export default function EquationBalanceDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.balanceDiagram");
  const tMode = useTranslations("tools.step-by-step-math-solver.form");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  let lhsFn: (x: number) => number;
  let rhsFn: (x: number) => number;
  let leftLabel = "";
  let rightLabel = "";
  if (dims.mode === "linear-equation") {
    lhsFn = (x) => (n.linearA ?? 0) * x + (n.linearB ?? 0);
    rhsFn = (x) => (n.linearC ?? 0) * x + (n.linearD ?? 0);
    leftLabel = t("linear.left");
    rightLabel = t("linear.right");
  } else if (dims.mode === "quadratic-equation") {
    lhsFn = (x) => (n.quadA ?? 1) * x * x + (n.quadB ?? 0) * x;
    rhsFn = () => -(n.quadC ?? 0);
    leftLabel = t("quadratic.left");
    rightLabel = t("quadratic.right");
  } else if (dims.mode === "fraction-operation") {
    const result = -eq.coeffs[0];
    lhsFn = () => result;
    rhsFn = (x) => x;
    leftLabel = t("fraction.left");
    rightLabel = t("fraction.right");
  } else {
    lhsFn = (x) => evalPoly(n.polynomialTerms.map((term) => term.coefficient), x); // placeholder, replaced below
    rhsFn = () => 0;
    leftLabel = t("derivative.left");
    rightLabel = t("derivative.right");
  }
  if (dims.mode === "derivative") {
    lhsFn = (x) => evalPoly(eq.coeffs, x);
    rhsFn = () => 0;
  }

  const defaultX = eq.degree <= 2 ? (eq.coeffs.length > 2 ? -((n.quadB ?? 0) / (2 * (n.quadA || 1))) : -eq.coeffs[0] / (eq.coeffs[1] || 1)) : 0;
  const testPoint = useMovablePoint([Number.isFinite(defaultX) ? defaultX : 0, -4], {
    constrain: (p) => [Math.min(10, Math.max(-10, p[0])), -4],
    color: colors.right,
  });

  const x = testPoint.point[0];
  const lhs = lhsFn(x);
  const rhs = rhsFn(x);
  const diff = lhs - rhs;
  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, diff / (Math.max(Math.abs(lhs), Math.abs(rhs), 1) * 4)));

  const beamLeft: [number, number] = [-3, 1 + tilt * 3];
  const beamRight: [number, number] = [3, 1 - tilt * 3];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { mode: tMode(`mode.${dims.mode}`) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[380px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [-5, 5], y: [-6, 4] }} height={220} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 100 }} yAxis={{ lines: 100 }} />
              <Line.Segment point1={[0, -1]} point2={[0, 1]} color={colors.beam} weight={3} />
              <Line.Segment point1={beamLeft} point2={beamRight} color={colors.beam} weight={3} />
              <Point x={beamLeft[0]} y={beamLeft[1]} color={colors.left} svgCircleProps={{ r: 7 }} />
              <Point x={beamRight[0]} y={beamRight[1]} color={colors.right} svgCircleProps={{ r: 7 }} />
              <Text x={beamLeft[0]} y={beamLeft[1] + 0.9} size={12} color={colors.left}>
                {fmt(lhs)}
              </Text>
              <Text x={beamRight[0]} y={beamRight[1] + 0.9} size={12} color={colors.right}>
                {fmt(rhs)}
              </Text>
              <Line.Segment point1={[-10, -4]} point2={[10, -4]} color={colors.beam} weight={1} opacity={0.3} />
              {testPoint.element}
              <Text x={x} y={-4.9} size={11} color={colors.right}>
                {`x = ${fmt(x)}`}
              </Text>
            </Mafs>
          </div>
          <p className="mt-1 text-center text-xs text-zinc-400 dark:text-zinc-500">{t("dragHint")}</p>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: leftLabel, value: fmt(lhs) },
            { label: rightLabel, value: fmt(rhs) },
            { label: t("worked.difference"), value: fmt(Math.abs(diff)), emphasize: true, note: Math.abs(diff) < 0.01 ? t("worked.balanced") : undefined },
          ]}
        />
      </div>
    </SectionCard>
  );
}
