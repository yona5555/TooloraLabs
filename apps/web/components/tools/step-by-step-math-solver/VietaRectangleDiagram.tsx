"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, solveQuadraticRoots, vietaFromQuadratic, fmt } from "./mathSolverEducationMath";

const LIGHT = { rect: "#2563eb" };
const DARK = { rect: "#60a5fa" };

/** Vieta rectangle: a real rectangle whose own two side lengths are the equation's own two real
 * roots — area = their product = c/a, half-perimeter = their sum = -b/a, exactly Vieta's formulas
 * made visible. A draggable corner explores "what if the roots were these lengths instead." */
export default function VietaRectangleDiagram() {
  const t = useTranslations("tools.step-by-step-math-solver.education.vietaRectangle");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);
  const isQuadratic = dims.mode === "quadratic-equation" || (dims.mode === "derivative" && eq.degree === 2);

  const r = isQuadratic ? solveQuadraticRoots(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]) : null;
  const hasRealRoots = r && r.kind !== "complex";
  const width = hasRealRoots ? Math.abs(r.kind === "two-real" ? r.x1 : r.x) : 0;
  const height = hasRealRoots ? Math.abs(r.kind === "two-real" ? r.x2 : r.x) : 0;

  const corner = useMovablePoint([Math.max(1, width), Math.max(1, height)], { constrain: (p) => [Math.max(0.2, Math.min(10, p[0])), Math.max(0.2, Math.min(10, p[1]))], color: colors.rect });
  const [cw, ch] = corner.point;

  const v = isQuadratic ? vietaFromQuadratic(eq.coeffs[0], eq.coeffs[1], eq.coeffs[2]) : null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          {isQuadratic ? (
            <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[320px] overflow-hidden rounded-xl">
              <Mafs viewBox={{ x: [-1, 11], y: [-1, 11] }} height={220} pan={false} zoom={false} preserveAspectRatio={false}>
                <Coordinates.Cartesian xAxis={{ lines: 2 }} yAxis={{ lines: 2 }} />
                <Polygon
                  points={[
                    [0, 0],
                    [cw, 0],
                    [cw, ch],
                    [0, ch],
                  ]}
                  color={colors.rect}
                  fillOpacity={0.2}
                />
                {hasRealRoots && (
                  <Polygon
                    points={[
                      [0, 0],
                      [width, 0],
                      [width, height],
                      [0, height],
                    ]}
                    color="#16a34a"
                    fillOpacity={0}
                    strokeOpacity={0.6}
                  />
                )}
                <Text x={cw / 2} y={-0.6} size={12} color={colors.rect}>
                  {`w = ${fmt(cw)}`}
                </Text>
                <Text x={-0.6} y={ch / 2} size={12} color={colors.rect}>
                  {`h = ${fmt(ch)}`}
                </Text>
                {corner.element}
              </Mafs>
            </div>
          ) : (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400">{t("notApplicable")}</p>
          )}
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.area"), value: isQuadratic ? fmt(v!.product) : "—" },
            { label: t("worked.halfPerimeter"), value: isQuadratic ? fmt(v!.sum) : "—", emphasize: true },
            { label: t("worked.exploredRect"), value: `${fmt(cw)} × ${fmt(ch)} = ${fmt(cw * ch)}` },
          ]}
        />
      </div>
    </SectionCard>
  );
}
