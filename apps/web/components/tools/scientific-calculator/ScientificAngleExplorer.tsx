"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Circle, Line, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { angleFromPoint, pointOnCircle, constrainToCircle, unitCircleFacts } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { MafsHoverSegment } from "@/components/tool-ui/MafsHoverPrimitives";
import { useScientificAngle } from "./ScientificAngleContext";

type Vector2 = [number, number];

const RADIUS = 3;
const LIGHT = { blue: "#2563eb", rose: "#e11d48", emerald: "#059669" };
const DARK = { blue: "#60a5fa", rose: "#fb7185", emerald: "#34d399" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function toVec2(p: Vector2) {
  return { x: p[0], y: p[1] };
}

function toVector2(v: { x: number; y: number }): Vector2 {
  return [v.x, v.y];
}

/**
 * The hero indicator (§36): a genuinely draggable point on the unit circle — mouse, touch, and
 * keyboard (Mafs's movable point ships keyboard support built in) — sharing its live angle via
 * ScientificAngleContext with six of the fifteen supporting indicators whose own math is
 * genuinely angle-based. The other nine cover unrelated math domains (factorials, logs,
 * combinatorics, memory, sign, percent, precedence) and are intentionally not wired here.
 */
export default function ScientificAngleExplorer() {
  const t = useTranslations("tools.scientific-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useScientificAngle();

  const point = useMovablePoint(toVector2(pointOnCircle(dims.angleDeg, RADIUS)), {
    color: colors.blue,
    constrain: (p) => toVector2(constrainToCircle(toVec2(p), RADIUS)),
  });

  const lastAngle = useRef(dims.angleDeg);

  useEffect(() => {
    if (Math.abs(dims.angleDeg - lastAngle.current) > 0.05) {
      point.setPoint(toVector2(pointOnCircle(dims.angleDeg, RADIUS)));
      lastAngle.current = dims.angleDeg;
    }
  }, [dims.angleDeg, point]);

  useEffect(() => {
    const angle = angleFromPoint(toVec2(point.point));
    if (Math.abs(angle - lastAngle.current) > 0.05) {
      lastAngle.current = angle;
      setDim("angleDeg", angle);
    }
  }, [point, setDim]);

  const f = unitCircleFacts(dims.angleDeg);
  const n = (v: number) => (Math.abs(v) < 0.0005 ? "0" : String(round3(v)).replace("-", "−"));
  const sin = n(f.sin);
  const cos = n(f.cos);
  const tan = f.tan === null ? t("undefined") : n(f.tan);
  const signTone = (sg: string) =>
    sg === "+" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" : sg === "−" ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  const quadrantText = f.quadrant === "axis" ? t("quadrantAxis") : t("quadrantN", { n: ["I", "II", "III", "IV"][f.quadrant - 1] });

  const rows: { key: string; label: string; value: ReactNode }[] = [
    { key: "deg", label: t("rows.degrees"), value: `${round3(f.degrees)}°` },
    { key: "rad", label: t("rows.radians"), value: f.radiansPi ? `${f.radiansPi} ≈ ${round3(f.radians)}` : `${round3(f.radians)}` },
    { key: "quad", label: t("rows.quadrant"), value: quadrantText },
    { key: "sin", label: t("rows.sin"), value: <span className="text-rose-700 dark:text-rose-300">{sin}</span> },
    { key: "cos", label: t("rows.cos"), value: <span className="text-emerald-700 dark:text-emerald-300">{cos}</span> },
    { key: "tan", label: t("rows.tan"), value: tan },
    { key: "ref", label: t("rows.reference"), value: `${round3(f.referenceDeg)}°` },
    { key: "xy", label: t("rows.coords"), value: `(${cos}, ${sin})` },
    {
      key: "signs",
      label: t("rows.signs"),
      value: (
        <span className="inline-flex flex-wrap justify-end gap-1">
          {(["sin", "cos", "tan"] as const).map((fn) => {
            const sg = f.signs[fn];
            return (
              <span key={fn} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${signTone(sg)}`}>
                {`${fn} ${sg === "undef" ? "∄" : sg}`}
              </span>
            );
          })}
        </span>
      ),
    },
  ];

  const origin: Vector2 = [0, 0];
  const projX: Vector2 = [point.point[0], 0];

  return (
    <SectionCard title={t("title")} className="my-4" bodyClassName="p-4 lg:p-5">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas w-full overflow-hidden rounded-xl" data-testid="explorer-mafs">
          <Mafs viewBox={{ x: [-4, 4], y: [-4, 4] }} height={340} pan={false} zoom={false}>
            <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: 1 }} />
            <Circle center={[0, 0]} radius={RADIUS} color={colors.blue} fillOpacity={0} strokeOpacity={0.4} />

            <MafsHoverSegment point1={origin} point2={projX} color={colors.emerald} weight={2.5} tooltip={t("cosTooltip", { value: cos })} />
            <MafsHoverSegment point1={projX} point2={point.point} color={colors.rose} weight={2.5} tooltip={t("sinTooltip", { value: sin })} />
            <Line.Segment point1={origin} point2={point.point} color={colors.blue} />

            <Text x={point.point[0] / 2} y={point.point[1] >= 0 ? -0.85 : 0.85} size={13} color={colors.emerald}>
              {`cos ${cos}`}
            </Text>
            <Text x={point.point[0] + (point.point[0] >= 0 ? 0.75 : -0.75)} y={point.point[1] / 2} size={13} color={colors.rose}>
              {`sin ${sin}`}
            </Text>

            {point.element}
          </Mafs>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-blue-200 dark:border-blue-500/30" data-testid="explorer-table">
          <div className="flex items-center justify-between bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
            <span>{t("tableTitle")}</span>
            <span dir="ltr" className="font-mono normal-case">{`θ = ${round3(f.degrees)}°`}</span>
          </div>
          <dl className="flex flex-1 flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => (
              <div key={r.key} className="flex flex-1 items-center justify-between gap-3 px-3 py-1.5 text-sm" data-row={r.key}>
                <dt className="text-zinc-600 dark:text-zinc-400">{r.label}</dt>
                <dd dir="ltr" className="text-end font-mono font-semibold text-zinc-900 dark:text-zinc-100">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </SectionCard>
  );
}
