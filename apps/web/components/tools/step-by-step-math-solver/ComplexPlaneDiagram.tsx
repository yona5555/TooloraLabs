"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Circle, Point, Text, Line, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, fmt } from "./mathSolverEducationMath";

const LIGHT = { root: "#dc2626", circle: "#9333ea" };
const DARK = { root: "#f87171", circle: "#c084fc" };

/** Argand-plane diagram: the active mode's own real roots (real axis) or complex-conjugate pair
 * (off the real axis) plotted on the complex plane, with a phase circle through them — a
 * draggable point on the circle lets you explore any angle at that same magnitude. For non-
 * quadratic modes, which have no complex-root concept, this degrades honestly to the real roots
 * only, explicitly labeled. */
export default function ComplexPlaneDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.complexPlane");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  const isQuadratic = dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2);
  const r = isQuadratic ? solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]) : null;

  let re1 = 0;
  let im1 = 0;
  let re2 = 0;
  let im2 = 0;
  let magnitude = 0;
  if (r) {
    if (r.kind === "complex") {
      re1 = r.re;
      im1 = r.im;
      re2 = r.re;
      im2 = -r.im;
      magnitude = Math.sqrt(r.re * r.re + r.im * r.im);
    } else if (r.kind === "two-real") {
      re1 = r.x1;
      re2 = r.x2;
      magnitude = Math.max(Math.abs(r.x1), Math.abs(r.x2));
    } else {
      re1 = r.x;
      re2 = r.x;
      magnitude = Math.abs(r.x);
    }
  }

  const explorer = useMovablePoint([magnitude || 3, 0], {
    constrain: (p) => {
      const mag = Math.sqrt(p[0] * p[0] + p[1] * p[1]) || 1;
      const target = magnitude || 3;
      return [(p[0] / mag) * target, (p[1] / mag) * target];
    },
    color: colors.circle,
  });
  const angleDeg = (Math.atan2(explorer.point[1], explorer.point[0]) * 180) / Math.PI;

  const yMax = Math.max(6, Math.abs(im1), magnitude) * 1.4;
  const xMax = Math.max(6, Math.abs(re1), Math.abs(re2), magnitude) * 1.4;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[360px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [-xMax, xMax], y: [-yMax, yMax] }} height={220} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: Math.max(1, Math.round(xMax / 4)), labels: () => "" }} yAxis={{ lines: Math.max(1, Math.round(yMax / 4)), labels: () => "" }} />
              {magnitude > 0 && <Circle center={[0, 0]} radius={magnitude} color={colors.circle} fillOpacity={0} strokeOpacity={0.35} />}
              {r && <Point x={re1} y={im1} color={colors.root} svgCircleProps={{ r: 6 }} />}
              {r && (im2 !== im1 || re2 !== re1) && <Point x={re2} y={im2} color={colors.root} svgCircleProps={{ r: 6 }} />}
              <Line.Segment point1={[0, 0]} point2={explorer.point} color={colors.circle} weight={1.5} opacity={0.6} />
              {explorer.element}
              <Text x={0} y={-yMax + 0.6} size={11} color={colors.root}>
                {t("realAxisLabel")}
              </Text>
            </Mafs>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.roots"), value: r?.kind === "complex" ? `${fmt(re1)} ± ${fmt(Math.abs(im1))}i` : `${fmt(re1)}${re2 !== re1 ? `, ${fmt(re2)}` : ""}` },
            { label: t("worked.magnitude"), value: fmt(magnitude) },
            { label: t("worked.exploredAngle"), value: `${fmt(angleDeg)}°`, emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
