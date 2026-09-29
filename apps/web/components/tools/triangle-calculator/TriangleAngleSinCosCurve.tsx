"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Plot, Line, Point, Text } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  angleADeg: number;
  angleBDeg: number;
  angleCDeg: number;
  /** Which vertex (0=A, 1=B, 2=C) is the page's currently active angle. */
  activeIndex: 0 | 1 | 2;
  digitStyle: DigitStyle;
};

const LIGHT = { sin: "#dc2626", cos: "#16a34a", guide: "#a1a1aa", faint: "#a1a1aa" };
const DARK = { sin: "#f87171", cos: "#4ade80", guide: "#71717a", faint: "#71717a" };

function subscribeDark(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
function getDarkSnapshot() {
  return document.documentElement.classList.contains("dark");
}
function getDarkServerSnapshot() {
  return false;
}

/** The canonical degree/radian pairs the curve's x-axis is annotated with (§: both units together). */
const RADIAN_TICKS: { deg: number; label: string }[] = [
  { deg: 0, label: "0" },
  { deg: 30, label: "π/6" },
  { deg: 45, label: "π/4" },
  { deg: 60, label: "π/3" },
  { deg: 90, label: "π/2" },
  { deg: 120, label: "2π/3" },
  { deg: 135, label: "3π/4" },
  { deg: 150, label: "5π/6" },
  { deg: 180, label: "π" },
];

const VERTEX_LABELS = ["A", "B", "C"] as const;

/**
 * A live sin/cos-vs-angle companion plotted directly beneath the interactive triangle diagram,
 * inside the same Result card — merged there because these three angles are the only place on
 * the page with a genuinely live, continuously dragged angle to plot sin/cos against.
 */
export default function TriangleAngleSinCosCurve({ angleADeg, angleBDeg, angleCDeg, activeIndex, digitStyle }: Props) {
  const t = useTranslations("tools.triangle-calculator.sinCosCurve");
  const isDark = useSyncExternalStore(subscribeDark, getDarkSnapshot, getDarkServerSnapshot);
  const colors = isDark ? DARK : LIGHT;
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const angles = [angleADeg, angleBDeg, angleCDeg];
  const activeDeg = angles[activeIndex];
  const activeLetter = VERTEX_LABELS[activeIndex];
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const sinActive = Math.sin(toRad(activeDeg));
  const cosActive = Math.cos(toRad(activeDeg));

  return (
    <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("title")}</h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("caption", { vertex: activeLetter })}</p>

      <div dir="ltr" className="triangle-mafs mt-3 w-full overflow-hidden rounded-xl">
        <Mafs
          viewBox={{ x: [-12, 192], y: [-1.35, 1.35] }}
          height={190}
          pan={false}
          zoom={false}
          preserveAspectRatio={false}
        >
          <Coordinates.Cartesian
            xAxis={{ lines: 30, labels: (deg) => `${deg}°` }}
            yAxis={{ lines: 0.5 }}
          />

          {RADIAN_TICKS.map(({ deg, label }) => (
            <Text key={deg} x={deg} y={-1.2} size={10} color={colors.faint}>
              {label}
            </Text>
          ))}

          <Plot.OfX y={(deg) => Math.sin(toRad(deg))} domain={[0, 180]} color={colors.sin} weight={2.5} />
          <Plot.OfX y={(deg) => Math.cos(toRad(deg))} domain={[0, 180]} color={colors.cos} weight={2.5} />

          <Line.Segment point1={[activeDeg, -1.3]} point2={[activeDeg, 1.3]} color={colors.guide} weight={1} style="dashed" opacity={0.6} />

          {angles.map((deg, i) =>
            i === activeIndex ? null : (
              <g key={`sin-ref-${VERTEX_LABELS[i]}`} opacity={0.35}>
                <Point x={deg} y={Math.sin(toRad(deg))} color={colors.sin} svgCircleProps={{ r: 3 }} />
              </g>
            ),
          )}
          {angles.map((deg, i) =>
            i === activeIndex ? null : (
              <g key={`cos-ref-${VERTEX_LABELS[i]}`} opacity={0.35}>
                <Point x={deg} y={Math.cos(toRad(deg))} color={colors.cos} svgCircleProps={{ r: 3 }} />
              </g>
            ),
          )}

          <Point x={activeDeg} y={sinActive} color={colors.sin} opacity={0.22} svgCircleProps={{ r: 11 }} />
          <Point x={activeDeg} y={sinActive} color={colors.sin} svgCircleProps={{ r: 4.5 }} />
          <Text x={activeDeg} y={sinActive} attach={sinActive >= 0 ? "n" : "s"} attachDistance={10} color={colors.sin} size={12}>
            {`sin ${activeLetter} = ${fmt(sinActive)}`}
          </Text>

          <Point x={activeDeg} y={cosActive} color={colors.cos} opacity={0.22} svgCircleProps={{ r: 11 }} />
          <Point x={activeDeg} y={cosActive} color={colors.cos} svgCircleProps={{ r: 4.5 }} />
          <Text x={activeDeg} y={cosActive} attach={cosActive >= 0 ? "n" : "s"} attachDistance={10} color={colors.cos} size={12}>
            {`cos ${activeLetter} = ${fmt(cosActive)}`}
          </Text>
        </Mafs>
      </div>

      <p dir="ltr" className="mt-2 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {t("checksumLine", { a: `${fmt(angleADeg)}°`, b: `${fmt(angleBDeg)}°`, c: `${fmt(angleCDeg)}°` })}
      </p>
    </div>
  );
}
