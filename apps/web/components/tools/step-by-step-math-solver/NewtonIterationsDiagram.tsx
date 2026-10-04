"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Line, Point, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, evalPoly, newtonIterate, fmt } from "./mathSolverEducationMath";

const LIGHT = { curve: "#2563eb", tangent: "#f97316", guess: "#16a34a" };
const DARK = { curve: "#60a5fa", tangent: "#fb923c", guess: "#4ade80" };

/** Newton's-method diagram: successive tangent lines from a live, draggable initial guess,
 * each one's x-intercept becoming the next guess — converging toward a real root regardless of
 * the active mode's degree, which is exactly why this method works where closed forms don't. */
export default function NewtonIterationsDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.newtonIterations");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  const guess = useMovablePoint([4, evalPoly(eq.coeffs, 4)], {
    constrain: (p) => {
      const x = Math.min(10, Math.max(-10, p[0]));
      return [x, evalPoly(eq.coeffs, x)];
    },
    color: colors.guess,
  });

  const x0 = guess.point[0];
  const iterations = newtonIterate(eq.coeffs, x0, 5);
  const curveFn = (x: number) => evalPoly(eq.coeffs, x);

  const xs = iterations.map((s) => s.x);
  const xMin = Math.min(...xs, -4);
  const xMax = Math.max(...xs, 4);
  const domain: [number, number] = [xMin - 2, xMax + 2];

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: domain, y: [-12, 12] }} height={240} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 2 }} yAxis={{ lines: 4 }} />
              <Plot.OfX y={curveFn} color={colors.curve} weight={2.5} />
              {iterations.slice(0, -1).map((s, i) => {
                const next = iterations[i + 1];
                const slope = next.x !== s.x ? -s.fx / (next.x - s.x) : 0;
                return <Line.Segment key={i} point1={[s.x - 2, s.fx - slope * 2]} point2={[s.x + 2, s.fx + slope * 2]} color={colors.tangent} weight={1.5} opacity={0.7} />;
              })}
              {iterations.map((s, i) => (
                <Point key={i} x={s.x} y={0} color={colors.tangent} svgCircleProps={{ r: i === iterations.length - 1 ? 5 : 3 }} />
              ))}
              {guess.element}
            </Mafs>
          </div>
          <p className="mt-1 text-center text-xs text-zinc-400 dark:text-zinc-500">{t("hint")}</p>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.initialGuess"), value: fmt(x0) },
            { label: t("worked.afterIterations", { count: iterations.length - 1 }), value: fmt(iterations[iterations.length - 1].x), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
