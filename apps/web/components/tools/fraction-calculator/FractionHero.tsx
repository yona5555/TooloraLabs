"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Line, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { GlassHeroCard } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, toMathValueFraction, gcd } from "@tooloralabs/tools";

const COLOR_A = "var(--glass-accent-1-strong)";
const COLOR_B = "var(--glass-accent-2-strong)";
const COLOR_SUM = "var(--glass-accent-3-strong)";
const OP_SYMBOL: Record<string, string> = { add: "+", subtract: "−", multiply: "×", divide: "÷" };

function pieSlicePath(frac: number, r = 46, cx = 50, cy = 50): string {
  const clamped = Math.max(0, Math.min(1, frac));
  if (clamped >= 0.9995) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  const angle = clamped * Math.PI * 2 - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const largeArc = clamped > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
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

  const pointA = useMovablePoint([valueA, 0.15], { constrain: (p) => [Math.max(0, Math.min(1, p[0])), 0.15], color: COLOR_A });
  const pointB = useMovablePoint([valueB, -0.15], { constrain: (p) => [Math.max(0, Math.min(1, p[0])), -0.15], color: COLOR_B });

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

  const resultClamped = Math.max(0, Math.min(1, result));
  const commonDen = denominatorA && denominatorB ? Math.abs((denominatorA * denominatorB) / (gcd(denominatorA, denominatorB) || 1)) : 1;
  const sixthsSteps = Math.min(12, Math.max(1, Math.round(commonDen)));

  return (
    <GlassHeroCard n={1} accent="blue" title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* Pie */}
        <div dir="ltr" className="flex shrink-0 flex-col items-center">
          <svg viewBox="0 0 100 100" width="150" height="150">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--glass-track)" strokeWidth="2" />
            <path d={pieSlicePath(resultClamped)} fill={COLOR_SUM} opacity={0.85} />
            <circle cx="50" cy="50" r="27" fill="var(--glass-surface)" />
            <text x="50" y="47" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--glass-title)">
              {formatMathValue(result)}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="6" fill="var(--glass-muted)">
              {`${formatMathValue(result * 100)}%`}
            </text>
          </svg>
          <p className="text-xs font-semibold" style={{ color: "var(--glass-muted)" }}>
            {t("resultLabel")}
          </p>
        </div>

        {/* Number line */}
        <div dir="ltr" className="w-full lg:flex-1">
          <div aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[360px] overflow-hidden rounded-xl">
            <Mafs viewBox={{ x: [-0.08, 1.08], y: [-0.5, 0.5] }} height={150} pan={false} zoom={false} preserveAspectRatio={false}>
              <Coordinates.Cartesian xAxis={{ lines: 1 / 6, labels: (v) => (Math.abs(v - Math.round(v * 6) / 6) < 0.001 ? formatMathValue(v) : "") }} yAxis={{ lines: 100 }} />
              <Line.Segment point1={[0, 0.15]} point2={[1, 0.15]} color={COLOR_A} weight={1.5} opacity={0.4} />
              <Line.Segment point1={[0, -0.15]} point2={[1, -0.15]} color={COLOR_B} weight={1.5} opacity={0.4} />
              <Text x={valueA} y={0.32} size={11} color={COLOR_A}>
                {`A = ${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}`}
              </Text>
              <Text x={valueB} y={-0.32} size={11} color={COLOR_B}>
                {`B = ${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}`}
              </Text>
              <g data-point-role="pointA">{pointA.element}</g>
              <g data-point-role="pointB">{pointB.element}</g>
            </Mafs>
          </div>
        </div>

        {/* sixths tape */}
        <div dir="ltr" className="w-full shrink-0 lg:w-40">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--glass-muted)" }}>
            {t("gridLabel")}
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: sixthsSteps }, (_, i) => (
              <div key={i} className="h-6 flex-1 rounded-sm" style={{ background: i < Math.round(resultClamped * sixthsSteps) ? COLOR_SUM : "var(--glass-track)" }} />
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
