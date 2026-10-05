"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { GlassHeroCard } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, formatPercent, toMathValueFraction, gcd } from "@tooloralabs/tools";

const COLOR_A = "var(--glass-accent-1-strong)";
const COLOR_B = "var(--glass-accent-2-strong)";
const COLOR_SUM = "var(--glass-accent-3-strong)";
const COLOR_SUM_OUTER = "var(--glass-accent-3-soft)";
const OP_SYMBOL: Record<string, string> = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

function pieSlicePath(frac: number, r: number, cx = 50, cy = 50): string {
  const clamped = Math.max(0, Math.min(1, frac));
  if (clamped <= 0.0005) return "";
  if (clamped >= 0.9995) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  const angle = clamped * Math.PI * 2 - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const largeArc = clamped > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
}

/** A 360px-wide canvas has room for roughly 6-7 short fraction labels before they start touching
 * -- far fewer than the 1/6-spaced gridlines themselves. Rather than estimate real pixel gaps
 * (fragile: depends on exact font metrics the browser picks), the label STEP is tied directly to
 * how much data range is visible: wider range -> coarser labels, so consecutive labels always
 * have real breathing room regardless of how far A/B get dragged. Gridlines stay fine (1/6) for
 * visual texture; only which gridlines get a text label changes. */
function labelStepFor(span: number): number {
  if (span <= 1.3) return 1 / 2;
  if (span <= 2.6) return 1;
  if (span <= 6) return 2;
  return Math.ceil(span / 5);
}

/** Hero: a draggable number line (two points, A and B, each snapping to a simple fraction with
 * denominator <=12) synced bidirectionally with the real input fields, plus a live pie/donut and
 * a sixths common-grid tape that both re-render from the exact same state — never a second copy.
 * Every color is a CSS variable from glass-tokens.css, so light/dark both resolve automatically
 * without any isDark branching. */
export default function FractionHero() {
  const t = useTranslations("tools.fraction-calculator.education.hero");
  const { dims, setDim } = useFractionLive();
  const { operation, numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const valueA = denominatorA !== 0 ? numeratorA / denominatorA : 0;
  const valueB = denominatorB !== 0 ? numeratorB / denominatorB : 0;
  let result = 0;
  if (operation === "add") result = valueA + valueB;
  else if (operation === "subtract") result = valueA - valueB;
  else if (operation === "multiply") result = valueA * valueB;
  else result = valueB !== 0 ? valueA / valueB : 0;

  // The viewBox always covers at least [0,1] plus wherever A and B currently sit, with padding --
  // so dragging either point off the original [0,1] window never pushes it off-canvas or crowds
  // the remaining tick labels.
  const safeA = Number.isFinite(valueA) ? Math.max(-5, Math.min(5, valueA)) : 0;
  const safeB = Number.isFinite(valueB) ? Math.max(-5, Math.min(5, valueB)) : 0;
  const dataMin = Math.min(0, safeA, safeB) - 0.08;
  const dataMax = Math.max(1, safeA, safeB) + 0.08;

  const pointA = useMovablePoint([valueA, 0.15], { constrain: (p) => [Math.max(-5, Math.min(5, p[0])), 0.15], color: COLOR_A });
  const pointB = useMovablePoint([valueB, -0.15], { constrain: (p) => [Math.max(-5, Math.min(5, p[0])), -0.15], color: COLOR_B });

  const lastA = useRef(valueA);
  const lastB = useRef(valueB);
  const suppressA = useRef(false);
  const suppressB = useRef(false);

  useEffect(() => {
    if (Math.abs(valueA - lastA.current) > 0.004) {
      suppressA.current = true;
      pointA.setPoint([valueA, 0.15]);
      lastA.current = valueA;
    }
    if (Math.abs(valueB - lastB.current) > 0.004) {
      suppressB.current = true;
      pointB.setPoint([valueB, -0.15]);
      lastB.current = valueB;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueA, valueB]);

  useEffect(() => {
    if (suppressA.current) {
      suppressA.current = false;
      return;
    }
    const x = pointA.point[0];
    if (Math.abs(x - lastA.current) <= 0.004) return;
    lastA.current = x;
    const frac = toMathValueFraction(x, 12) ?? { num: Math.round(x * 12), den: 12 };
    const d = frac.den || 1;
    const divisor = gcd(frac.num, d) || 1;
    setDim("numeratorA", frac.num / divisor);
    setDim("denominatorA", d / divisor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointA.point]);

  useEffect(() => {
    if (suppressB.current) {
      suppressB.current = false;
      return;
    }
    const x = pointB.point[0];
    if (Math.abs(x - lastB.current) <= 0.004) return;
    lastB.current = x;
    const frac = toMathValueFraction(x, 12) ?? { num: Math.round(x * 12), den: 12 };
    const d = frac.den || 1;
    const divisor = gcd(frac.num, d) || 1;
    setDim("numeratorB", frac.num / divisor);
    setDim("denominatorB", d / divisor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointB.point]);

  const absResult = Math.abs(result);
  const whole = Math.floor(absResult);
  const remainder = absResult - whole;
  const commonDen = denominatorA && denominatorB ? Math.abs((denominatorA * denominatorB) / (gcd(denominatorA, denominatorB) || 1)) : 1;
  const sixthsSteps = Math.min(12, Math.max(1, Math.round(commonDen)));
  const sixthsFilled = Math.round(Math.max(0, Math.min(1, absResult)) * sixthsSteps);

  const labelStep = labelStepFor(dataMax - dataMin);

  return (
    <GlassHeroCard n={1} title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
        {/* Pie / donut -- a full outer ring plus a partial inner ring once the result passes 1 */}
        <div dir="ltr" className="flex shrink-0 flex-col items-center justify-center">
          <svg viewBox="0 0 100 100" width="160" height="160">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--glass-track)" strokeWidth="2" />
            {whole >= 1 ? (
              <>
                <circle cx="50" cy="50" r="46" fill="none" stroke={COLOR_SUM_OUTER} strokeWidth="10" />
                <path d={pieSlicePath(1, 46)} fill={COLOR_SUM_OUTER} opacity={0.9} />
                <circle cx="50" cy="50" r="31" fill="none" stroke="var(--glass-track)" strokeWidth="2" />
                <path d={pieSlicePath(remainder, 31)} fill={COLOR_SUM} opacity={0.95} />
              </>
            ) : (
              <path d={pieSlicePath(remainder, 46)} fill={COLOR_SUM} opacity={0.9} />
            )}
            <circle cx="50" cy="50" r={whole >= 1 ? 22 : 27} fill="var(--glass-surface)" />
            <text x="50" y="47" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--glass-title)">
              {formatMathValue(result)}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="6" fill="var(--glass-muted)">
              {`${formatPercent(result * 100)}%`}
            </text>
          </svg>
          <p className="text-xs font-semibold" style={{ color: "var(--glass-muted)" }}>
            {t("resultLabel")}
          </p>
        </div>

        {/* Number line */}
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[360px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [dataMin, dataMax], y: [-0.5, 0.5] }} height={170} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian
                xAxis={{
                  lines: 1 / 6,
                  labels: (v) => {
                    if (Math.abs(v / labelStep - Math.round(v / labelStep)) >= 0.01) return "";
                    // Skip a tick label that would sit under A's or B's own dedicated label --
                    // those two already say the exact value, a duplicate nearby tick just crowds it.
                    const tooCloseToA = Math.abs(v - valueA) < labelStep * 0.3;
                    const tooCloseToB = Math.abs(v - valueB) < labelStep * 0.3;
                    if (tooCloseToA || tooCloseToB) return "";
                    return formatMathValue(v);
                  },
                }}
                yAxis={{ lines: 100, labels: () => "" }}
              />
              <Line.Segment point1={[dataMin, 0.15]} point2={[dataMax, 0.15]} color={COLOR_A} weight={1.5} opacity={0.4} />
              <Line.Segment point1={[dataMin, -0.15]} point2={[dataMax, -0.15]} color={COLOR_B} weight={1.5} opacity={0.4} />
              <Text x={valueA} y={0.34} size={11} color={COLOR_A}>
                {`A = ${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}`}
              </Text>
              <Text x={valueB} y={-0.34} size={11} color={COLOR_B}>
                {`B = ${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}`}
              </Text>
              <g data-point-role="pointA">{pointA.element}</g>
              <g data-point-role="pointB">{pointB.element}</g>
            </Mafs>
          </div>
        </div>

        {/* sixths tape */}
        <div dir="ltr" className="flex w-full shrink-0 flex-col lg:w-48">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--glass-muted)" }}>
            {t("gridLabel")}
          </p>
          <div className="grid flex-1 grid-cols-6 gap-1">
            {Array.from({ length: sixthsSteps }, (_, i) => (
              <div key={i} className="min-h-10 rounded-sm" style={{ background: i < sixthsFilled ? COLOR_SUM : "var(--glass-track)" }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl px-3 py-2 text-center font-mono text-sm" style={{ background: "var(--glass-table-wrap-bg)" }}>
        <span style={{ color: COLOR_A }}>{`${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}`}</span>
        <span style={{ color: "var(--glass-muted)" }}>{OP_SYMBOL[operation]}</span>
        <span style={{ color: COLOR_B }}>{`${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}`}</span>
        <span style={{ color: "var(--glass-muted)" }}>=</span>
        <span className="font-bold" style={{ color: COLOR_SUM }}>
          {formatMathValue(result)}
        </span>
        <span style={{ color: "var(--glass-muted)" }}>{t("twoWaySynced")}</span>
      </div>
    </GlassHeroCard>
  );
}
