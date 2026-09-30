"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Point, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { FractionCalculator } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverPoint } from "@/components/tool-ui/MafsHoverPrimitives";
import { useFractionLive } from "./FractionLiveContext";

type Vector2 = [number, number];

const tool = new FractionCalculator();
const ROW_A = 0;
const ROW_B = -0.55;
const ROW_RESULT = -1.1;
const MIN_X = -0.2;
const MAX_X = 2.2;
const LIGHT = { blue: "#2563eb", rose: "#e11d48", emerald: "#059669" };
const DARK = { blue: "#60a5fa", rose: "#fb7185", emerald: "#34d399" };

const OP_SYMBOL: Record<string, string> = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * The hero indicator (§36): two real fractions, each a draggable point on a shared number line
 * (dragging changes the numerator; the denominator stays whatever the field currently holds),
 * plus a third live marker showing the result of whichever operation is actually selected above
 * the fold — not hardcoded to addition. Fully bidirectional: editing any field moves the matching
 * point, and dragging a point writes straight back into that fraction's numerator field.
 */
export default function FractionNumberLineDrag() {
  const t = useTranslations("tools.fraction-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useFractionLive();

  const xA = dims.denominatorA !== 0 ? dims.numeratorA / dims.denominatorA : 0;
  const xB = dims.denominatorB !== 0 ? dims.numeratorB / dims.denominatorB : 0;

  const pointA = useMovablePoint([xA, ROW_A] as Vector2, {
    color: colors.blue,
    constrain: (p) => [Math.min(MAX_X, Math.max(MIN_X, p[0])), ROW_A],
  });
  const pointB = useMovablePoint([xB, ROW_B] as Vector2, {
    color: colors.rose,
    constrain: (p) => [Math.min(MAX_X, Math.max(MIN_X, p[0])), ROW_B],
  });

  const lastXA = useRef(xA);
  const lastXB = useRef(xB);
  const suppressA = useRef(false);
  const suppressB = useRef(false);

  // External change (field edit) -> move the point. Marks suppressA/B so the paired
  // write-back effect below ignores the stale pre-update point position it would
  // otherwise still see within this same commit (setPoint's own re-render hasn't
  // landed yet), instead of misreading it as a drag and overwriting the field back.
  useEffect(() => {
    if (Math.abs(xA - lastXA.current) > 0.002) {
      suppressA.current = true;
      pointA.setPoint([xA, ROW_A]);
      lastXA.current = xA;
    }
  }, [xA, pointA]);

  useEffect(() => {
    if (Math.abs(xB - lastXB.current) > 0.002) {
      suppressB.current = true;
      pointB.setPoint([xB, ROW_B]);
      lastXB.current = xB;
    }
  }, [xB, pointB]);

  // Drag -> write back into the real numerator field
  useEffect(() => {
    if (suppressA.current) {
      suppressA.current = false;
      return;
    }
    if (Math.abs(pointA.point[0] - lastXA.current) > 0.002) {
      lastXA.current = pointA.point[0];
      const newNumerator = Math.round(pointA.point[0] * dims.denominatorA);
      setDim("numeratorA", newNumerator);
    }
  }, [pointA, dims.denominatorA, setDim]);

  useEffect(() => {
    if (suppressB.current) {
      suppressB.current = false;
      return;
    }
    if (Math.abs(pointB.point[0] - lastXB.current) > 0.002) {
      lastXB.current = pointB.point[0];
      const newNumerator = Math.round(pointB.point[0] * dims.denominatorB);
      setDim("numeratorB", newNumerator);
    }
  }, [pointB, dims.denominatorB, setDim]);

  const output = tool.execute(
    { operation: dims.operation, numeratorA: dims.numeratorA, denominatorA: dims.denominatorA, numeratorB: dims.numeratorB, denominatorB: dims.denominatorB },
    { locale: "en-US" }
  );
  const resultDecimal = output.success && !output.data.error ? output.data.decimal : 0;

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`A = ${dims.numeratorA}/${dims.denominatorA}`}</span>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{`B = ${dims.numeratorB}/${dims.denominatorB}`}</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{`A ${OP_SYMBOL[dims.operation]} B = ${output.success && !output.data.error ? `${output.data.result.numerator}/${output.data.result.denominator}` : "—"}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [MIN_X, MAX_X], y: [-1.4, 0.4] }} height={220} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 0.5, labels: (v) => (Number.isInteger(v) ? `${v}` : "") }} yAxis={{ lines: false, labels: false }} />

          <MafsHoverPoint point={[xA, ROW_A]} tooltip={t("pointTooltip", { label: "A", value: `${round3(xA)}` })} />
          <MafsHoverPoint point={[xB, ROW_B]} tooltip={t("pointTooltip", { label: "B", value: `${round3(xB)}` })} />
          <Point x={resultDecimal} y={ROW_RESULT} color={colors.emerald} />

          <Text x={MIN_X + 0.1} y={ROW_A} attach="e" size={11} color={colors.blue}>
            A
          </Text>
          <Text x={MIN_X + 0.1} y={ROW_B} attach="e" size={11} color={colors.rose}>
            B
          </Text>
          <Text x={MIN_X + 0.1} y={ROW_RESULT} attach="e" size={11} color={colors.emerald}>
            {OP_SYMBOL[dims.operation]}
          </Text>

          {pointA.element}
          {pointB.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
