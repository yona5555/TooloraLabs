"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Point, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { snapToFraction, fractionToDecimal, type SimpleFraction, FractionCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment, MafsHoverPoint } from "@/components/tool-ui/MafsHoverPrimitives";

type Vector2 = [number, number];

const GRID = 12;
const ROW_A = 0;
const ROW_B = -0.45;
const ROW_SUM = -0.9;
const LIGHT = { blue: "#2563eb", amber: "#d97706", green: "#16a34a" };
const DARK = { blue: "#60a5fa", amber: "#fbbf24", green: "#4ade80" };

const tool = new FractionCalculator();

function fmt(f: SimpleFraction): string {
  return f.denominator === 1 ? `${f.numerator}` : `${f.numerator}/${f.denominator}`;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * The hero indicator (§36): drag two points, each along its own 0-2 number line, and watch two
 * fractions — plus a third, non-draggable bar showing their live sum laid end-to-end — recompute
 * continuously. This is the actual visual meaning of "adding fractions" (combining two lengths
 * along the same scale), not an abstract rule. Both points snap to twelfths (a common
 * denominator with many clean factors: halves, thirds, quarters, sixths) so a free drag always
 * lands on a real, simplifiable fraction.
 */
export default function FractionNumberLineDrag() {
  const t = useTranslations("tools.fraction-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const [opMode] = useState<"add">("add");

  const pointA = useMovablePoint([1 / 2, ROW_A] as Vector2, {
    color: colors.blue,
    constrain: (p) => [Math.min(2, Math.max(0, p[0])), ROW_A],
  });
  const pointB = useMovablePoint([1 / 3, ROW_B] as Vector2, {
    color: colors.amber,
    constrain: (p) => [Math.min(2, Math.max(0, p[0])), ROW_B],
  });

  const fracA = snapToFraction(pointA.point[0], GRID);
  const fracB = snapToFraction(pointB.point[0], GRID);
  const decA = fractionToDecimal(fracA);
  const decB = fractionToDecimal(fracB);

  const sumOutput = tool.execute(
    { operation: opMode, numeratorA: fracA.numerator, denominatorA: fracA.denominator, numeratorB: fracB.numerator, denominatorB: fracB.denominator },
    { locale: "en-US" },
  );
  const sum = sumOutput.success ? sumOutput.data.result : { numerator: 0, denominator: 1 };
  const sumDecimal = fractionToDecimal(sum);

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`A = ${fmt(fracA)}`}</span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{`B = ${fmt(fracB)}`}</span>
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">{`A + B = ${fmt(sum)}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [-0.3, 4.3], y: [-1.25, 0.55] }} height={190} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 0.5, labels: (v) => (Number.isInteger(v) ? `${v}` : "") }} yAxis={{ lines: false, axis: false }} />

          <MafsHoverSegment point1={[0, ROW_A]} point2={[decA, ROW_A]} color={colors.blue} weight={4} tooltip={t("aTooltip", { value: fmt(fracA), decimal: `${round2(decA)}` })} />
          <MafsHoverSegment point1={[0, ROW_B]} point2={[decB, ROW_B]} color={colors.amber} weight={4} tooltip={t("bTooltip", { value: fmt(fracB), decimal: `${round2(decB)}` })} />
          <MafsHoverSegment
            point1={[0, ROW_SUM]}
            point2={[sumDecimal, ROW_SUM]}
            color={colors.green}
            weight={4}
            tooltip={t("sumTooltip", { a: fmt(fracA), b: fmt(fracB), sum: fmt(sum), decimal: `${round2(sumDecimal)}` })}
          />

          <Point x={sumDecimal} y={ROW_SUM} color={colors.green} svgCircleProps={{ r: 4.5 }} />
          <MafsHoverPoint point={[sumDecimal, ROW_SUM]} tooltip={t("sumTooltip", { a: fmt(fracA), b: fmt(fracB), sum: fmt(sum), decimal: `${round2(sumDecimal)}` })} radiusPx={12} />
          <Text x={sumDecimal} y={ROW_SUM - 0.2} size={11} color={colors.green}>
            {fmt(sum)}
          </Text>

          {pointA.element}
          {pointB.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
