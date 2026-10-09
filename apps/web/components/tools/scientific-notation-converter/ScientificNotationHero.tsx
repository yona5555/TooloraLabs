"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { GlassHeroCard } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, standardValueOf } from "@tooloralabs/tools";

type Vector2 = [number, number];
const EXP_MIN = -15;
const EXP_MAX = 15;
const COEF_MIN = 0;
const COEF_MAX = 10;
const LIGHT = { a: "#5B6EF5", b: "#F0507A" };
const DARK = { a: "#8B9BFF", b: "#F97BA0" };

function clampPoint(p: Vector2): Vector2 {
  return [Math.min(EXP_MAX, Math.max(EXP_MIN, p[0])), Math.min(COEF_MAX, Math.max(COEF_MIN, p[1]))];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Digit strip: the real standard-value digits with the decimal point drawn at the position the
 * live (coefficient, exponent) actually implies -- a pure, reactive readout, never a second copy
 * of the math (it reads the exact same derivedA the Mafs point commits). */
function DigitStrip({ coefficient, exponent }: { coefficient: number; exponent: number }) {
  const standard = standardValueOf(coefficient, exponent);
  const abs = Math.abs(standard);
  const sign = standard < 0 ? "-" : "";
  let digits: string;
  let pointIndex: number;
  if (abs === 0) {
    digits = "0";
    pointIndex = 1;
  } else if (abs >= 1) {
    const intPart = Math.floor(abs).toString();
    digits = intPart;
    pointIndex = intPart.length;
  } else {
    const fixed = abs.toPrecision(6);
    const afterPoint = fixed.split(".")[1] ?? "";
    digits = afterPoint.replace(/0+$/, "") || "0";
    pointIndex = 0;
  }
  const cells = digits.split("");
  return (
    <div dir="ltr" className="flex flex-wrap items-center justify-center gap-0.5">
      {sign && <span className="text-sm font-bold text-zinc-400">{sign}</span>}
      {pointIndex === 0 && <span className="px-0.5 text-sm font-bold text-zinc-400">0.</span>}
      {cells.map((d, i) => (
        <span key={i} className="relative flex h-7 w-6 items-center justify-center rounded-md bg-zinc-100 text-sm font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {d}
          {pointIndex > 0 && i === pointIndex - 1 && <span className="absolute -right-1 bottom-0.5 text-base font-black text-emerald-500">.</span>}
        </span>
      ))}
    </div>
  );
}

/** Hero: a draggable (exponent, coefficient) point on a Mafs plane whose two axes double as the
 * exponent ladder and the [1,10) coefficient bar, plus a live digit-strip readout of the real
 * standard value -- all driven by the exact same shared state, never a second copy. */
export default function ScientificNotationHero() {
  const t = useTranslations("tools.scientific-notation-converter.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useScientificNotationLive();

  const showB = dims.operation === "multiply" || dims.operation === "divide";
  const derivedA = deriveEffectiveA(dims);

  const pointA = useMovablePoint([derivedA.exponent, derivedA.coefficient] as Vector2, { color: colors.a, constrain: clampPoint });
  const pointB = useMovablePoint([dims.exponentB, dims.coefficientB] as Vector2, { color: colors.b, constrain: clampPoint });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedA.exponent, derivedA.coefficient]);

  useEffect(() => {
    if (!showB) return;
    const target: Vector2 = [dims.exponentB, dims.coefficientB];
    if (Math.abs(target[0] - lastB.current[0]) > 0.02 || Math.abs(target[1] - lastB.current[1]) > 0.02) {
      suppressB.current = true;
      pointB.setPoint(target);
      lastB.current = target;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.exponentB, dims.coefficientB, showB]);

  useEffect(() => {
    if (suppressA.current) {
      suppressA.current = false;
      return;
    }
    const [x, y] = pointA.point;
    if (Math.abs(x - lastA.current[0]) > 0.02 || Math.abs(y - lastA.current[1]) > 0.02) {
      lastA.current = [x, y];
      if (dims.operation === "toScientific") {
        setDim("standardValue", round2(y * 10 ** Math.round(x)));
      } else {
        setDim("coefficientA", round2(y));
        setDim("exponentA", Math.round(x));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointA.point, dims.operation]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointB.point, showB]);

  return (
    <GlassHeroCard n={1} accent="blue" title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [EXP_MIN, EXP_MAX], y: [COEF_MIN, COEF_MAX] }} height={240} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 3, labels: (v) => (Number.isInteger(v / 3) ? `10^${v}` : "") }} yAxis={{ lines: 1 }} />
              <Line.Segment point1={[EXP_MIN, 1]} point2={[EXP_MAX, 1]} color={isDark ? "#3f3f46" : "#E5E7F5"} weight={1} />
              <Text x={0} y={COEF_MAX - 0.7} size={11} color={isDark ? "#71717a" : "#a1a1aa"}>
                {t("axisHint")}
              </Text>
              <g data-point-role="pointA">{pointA.element}</g>
              {showB && <g data-point-role="pointB">{pointB.element}</g>}
            </Mafs>
          </div>
        </div>

        <div dir="ltr" className="flex shrink-0 flex-col items-center gap-3 lg:w-48">
          <DigitStrip coefficient={derivedA.coefficient} exponent={derivedA.exponent} />
          <div className="rounded-xl bg-zinc-50/80 px-3 py-2 text-center font-mono text-sm dark:bg-zinc-800/40">
            <span style={{ color: colors.a }}>{`A = ${formatSciValue(derivedA.coefficient)} × 10^${formatSciValue(Math.round(derivedA.exponent))}`}</span>
            {showB && (
              <>
                <br />
                <span style={{ color: colors.b }}>{`B = ${formatSciValue(dims.coefficientB)} × 10^${formatSciValue(Math.round(dims.exponentB))}`}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </GlassHeroCard>
  );
}
