"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Point, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, solveLinearRoot, fmt } from "./mathSolverEducationMath";
import GapFreeRow from "@/components/tool-ui/GapFreeRow";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";

const LIGHT = { root: "#16a34a", explorer: "#9333ea" };
const DARK = { root: "#4ade80", explorer: "#c084fc" };

/** Number-line solution set: the active mode's real root(s) marked as solid (closed) points on a
 * number line — a draggable explorer finds the live distance from any probed value to the
 * nearest actual solution. */
export default function NumberLineSolutionSet() {
  const t = useTranslations("tools.step-by-step-math-solver.education.numberLineSolution");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  let roots: number[] = [];
  if (dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2)) {
    const r = solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]);
    if (r.kind === "two-real") roots = [r.x1, r.x2];
    else if (r.kind === "one-real") roots = [r.x];
  } else {
    const root = solveLinearRoot(eq.coeffs[0], eq.coeffs[1]);
    roots = root !== null ? [root] : [];
  }

  const span = roots.length ? Math.max(...roots) - Math.min(...roots) : 0;
  const center = roots.length ? (Math.max(...roots) + Math.min(...roots)) / 2 : 0;
  const half = Math.max(6, span * 0.8 + 3);
  const domain: [number, number] = [center - half, center + half];

  const explorer = useMovablePoint([center + half * 0.4, 0], { constrain: (p) => [Math.max(domain[0], Math.min(domain[1], p[0])), 0], color: colors.explorer });
  const ex = explorer.point[0];
  const nearest = roots.length ? roots.reduce((best, r) => (Math.abs(r - ex) < Math.abs(best - ex) ? r : best), roots[0]) : null;
  const distance = nearest !== null ? Math.abs(nearest - ex) : null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <GapFreeRow className="mt-4">
        <div dir="ltr" className="w-full lg:flex-1">
          <PhoneMini slot={1} title={t("title")}>
            <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
              <Mafs viewBox={{ x: domain, y: [-2, 2] }} height={140} pan={false} zoom={false} preserveAspectRatio={false}>
                <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 100 }} />
                {roots.map((r, i) => (
                  <Point key={i} x={r} y={0} color={colors.root} svgCircleProps={{ r: 6 }} />
                ))}
                {roots.map((r, i) => (
                  <Text key={`t${i}`} x={r} y={1.05} size={12} color={colors.root}>
                    {fmt(r)}
                  </Text>
                ))}
                {explorer.element}
                <Text x={ex} y={-1.3} size={12} color={colors.explorer}>
                  {fmt(ex)}
                </Text>
              </Mafs>
            </div>
          </PhoneMini>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.solutionSet"), value: roots.length ? roots.map((r) => fmt(r)).join(", ") : "∅" },
            { label: t("worked.distance"), value: distance !== null ? fmt(distance) : "—", emphasize: true },
          ]}
        />
      </GapFreeRow>
    </SectionCard>
  );
}
