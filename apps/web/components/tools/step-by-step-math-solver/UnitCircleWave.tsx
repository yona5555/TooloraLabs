"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Circle, Plot, Line, Point, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useMathSolverLive } from "./MathSolverLiveContext";
import { parseMathSolverDraft, deriveHeroEquation, fmt } from "./mathSolverEducationMath";

const LIGHT = { circle: "#2563eb", sin: "#16a34a", cos: "#dc2626", ref: "#9333ea" };
const DARK = { circle: "#60a5fa", sin: "#4ade80", cos: "#f87171", ref: "#c084fc" };

/** Unit-circle-and-wave: this solver has no trigonometric-equation mode, so — per the fallback
 * this build documents rather than hides — a draggable angle explores sin/cos generally, while a
 * fixed reference angle is derived honestly from the live equation's own leading coefficient
 * (normalized into degrees), so the connection to the real live state is explicit, not decorative. */
export default function UnitCircleWave() {
  const t = useTranslations("tools.step-by-step-math-solver.education.unitCircleWave");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims } = useMathSolverLive();
  const n = parseMathSolverDraft(dims);
  const eq = deriveHeroEquation(n);

  const leadCoeff = eq.coeffs[eq.coeffs.length - 1] || 1;
  const referenceDeg = ((((leadCoeff * 37) % 360) + 360) % 360);

  const angle = useMovablePoint([Math.cos((referenceDeg * Math.PI) / 180), Math.sin((referenceDeg * Math.PI) / 180)], {
    constrain: (p) => {
      const a = Math.atan2(p[1], p[0]);
      return [Math.cos(a), Math.sin(a)];
    },
    color: colors.ref,
  });
  const deg = ((Math.atan2(angle.point[1], angle.point[0]) * 180) / Math.PI + 360) % 360;
  const rad = (deg * Math.PI) / 180;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { coeff: fmt(leadCoeff) })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div dir="ltr" className="flex w-full flex-col gap-3 sm:flex-row lg:flex-1">
          <div aria-label={t("circleAriaLabel")} className="mafs-canvas mx-auto w-full max-w-[180px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [-1.4, 1.4], y: [-1.4, 1.4] }} height={170} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 100 }} yAxis={{ lines: 100 }} />
              <Circle center={[0, 0]} radius={1} color={colors.circle} fillOpacity={0} />
              <Line.Segment point1={[0, 0]} point2={angle.point} color={colors.ref} weight={2} />
              <Point x={Math.cos((referenceDeg * Math.PI) / 180)} y={Math.sin((referenceDeg * Math.PI) / 180)} color={colors.circle} svgCircleProps={{ r: 4 }} />
              {angle.element}
            </Mafs>
          </div>
          <div aria-label={t("waveAriaLabel")} className="mafs-canvas mx-auto w-full max-w-[220px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [0, 360], y: [-1.3, 1.3] }} height={170} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 90 }} yAxis={{ lines: 0.5, labels: (v) => (Math.abs(v) <= 1 ? `${v}` : "") }} />
              <Plot.OfX y={(x) => Math.sin((x * Math.PI) / 180)} color={colors.sin} />
              <Plot.OfX y={(x) => Math.cos((x * Math.PI) / 180)} color={colors.cos} />
              <Line.Segment point1={[deg, -1.3]} point2={[deg, 1.3]} color={colors.ref} weight={1.5} style="dashed" opacity={0.6} />
            </Mafs>
          </div>
        </div>
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.angle"), value: `${fmt(deg)}°` },
            { label: t("worked.sin"), value: fmt(Math.sin(rad)) },
            { label: t("worked.cos"), value: fmt(Math.cos(rad)), emphasize: true },
          ]}
        />
      </div>
    </SectionCard>
  );
}
