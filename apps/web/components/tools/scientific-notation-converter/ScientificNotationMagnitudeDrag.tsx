"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { ScientificNotationConverter } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";

type Vector2 = [number, number];

const tool = new ScientificNotationConverter();
const EXP_MIN = -15;
const EXP_MAX = 15;
const COEF_MIN = 0;
const COEF_MAX = 10;
const LIGHT = { blue: "#2563eb", rose: "#e11d48" };
const DARK = { blue: "#60a5fa", rose: "#fb7185" };

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clampPoint(p: Vector2): Vector2 {
  return [Math.min(EXP_MAX, Math.max(EXP_MIN, p[0])), Math.min(COEF_MAX, Math.max(COEF_MIN, p[1]))];
}

/**
 * The hero indicator (§36): a genuinely draggable 2D point (exponent on x, coefficient on y)
 * representing whichever real value is actually live above the fold. In toScientific mode the
 * point reflects the real engine's own normalization of standardValue and dragging it writes a
 * recomputed standardValue back; in every other mode it maps directly to coefficientA/exponentA,
 * with a second point for B appearing in multiply/divide mode — mirroring the actual operation.
 */
export default function ScientificNotationMagnitudeDrag() {
  const t = useTranslations("tools.scientific-notation-converter.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useScientificNotationLive();

  const showB = dims.operation === "multiply" || dims.operation === "divide";
  const derivedA = deriveEffectiveA(dims);

  const pointA = useMovablePoint([derivedA.exponent, derivedA.coefficient] as Vector2, { color: colors.blue, constrain: (p) => clampPoint(p) });
  const pointB = useMovablePoint([dims.exponentB, dims.coefficientB] as Vector2, { color: colors.rose, constrain: (p) => clampPoint(p) });

  const lastA = useRef<Vector2>([derivedA.exponent, derivedA.coefficient]);
  const lastB = useRef<Vector2>([dims.exponentB, dims.coefficientB]);
  const suppressA = useRef(false);
  const suppressB = useRef(false);

  useEffect(() => {
    const target: Vector2 = [derivedA.exponent, derivedA.coefficient];
    if (Math.abs(target[0] - lastA.current[0]) > 0.02 || Math.abs(target[1] - lastA.current[1]) > 0.02) {
      suppressA.current = true;
      pointA.setPoint(target);
      lastA.current = target;
    }
  }, [derivedA.exponent, derivedA.coefficient, pointA]);

  useEffect(() => {
    if (!showB) return;
    const target: Vector2 = [dims.exponentB, dims.coefficientB];
    if (Math.abs(target[0] - lastB.current[0]) > 0.02 || Math.abs(target[1] - lastB.current[1]) > 0.02) {
      suppressB.current = true;
      pointB.setPoint(target);
      lastB.current = target;
    }
  }, [dims.exponentB, dims.coefficientB, pointB, showB]);

  useEffect(() => {
    if (suppressA.current) {
      suppressA.current = false;
      return;
    }
    const [x, y] = pointA.point;
    if (Math.abs(x - lastA.current[0]) > 0.02 || Math.abs(y - lastA.current[1]) > 0.02) {
      lastA.current = [x, y];
      if (dims.operation === "toScientific") {
        setDim("standardValue", round2(y * 10 ** x));
      } else {
        setDim("coefficientA", round2(y));
        setDim("exponentA", Math.round(x));
      }
    }
  }, [pointA, dims.operation, setDim]);

  useEffect(() => {
    if (!showB) return;
    if (suppressB.current) {
      suppressB.current = false;
      return;
    }
    const [x, y] = pointB.point;
    if (Math.abs(x - lastB.current[0]) > 0.02 || Math.abs(y - lastB.current[1]) > 0.02) {
      lastB.current = [x, y];
      setDim("coefficientB", round2(y));
      setDim("exponentB", Math.round(x));
    }
  }, [pointB, showB, setDim]);

  const output = tool.execute(
    { operation: dims.operation, standardValue: dims.standardValue, coefficientA: dims.coefficientA, exponentA: dims.exponentA, coefficientB: dims.coefficientB, exponentB: dims.exponentB },
    { locale: "en-US" }
  );
  const ok = output.success && !output.data.error;

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`A = ${round2(derivedA.coefficient)} × 10^${Math.round(derivedA.exponent)}`}</span>
        {showB && <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{`B = ${round2(dims.coefficientB)} × 10^${Math.round(dims.exponentB)}`}</span>}
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{`${t("resultLabel")}: ${ok ? `${round2(output.data.scientific.coefficient)} × 10^${output.data.scientific.exponent}` : "—"}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [EXP_MIN, EXP_MAX], y: [COEF_MIN, COEF_MAX] }} height={260} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 3 }} yAxis={{ lines: 1 }} />
          <Text x={0} y={COEF_MAX - 0.6} size={11} color={isDark ? "#71717a" : "#a1a1aa"}>
            {t("axisHint")}
          </Text>
          {pointA.element}
          {showB && pointB.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
