"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Circle, Ellipse, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import type { AreaShape } from "@tooloralabs/tools";
import { useAreaLive } from "./AreaLiveContext";
import { parseAreaDims, computeAreaFor, perimeterOf, round, type AreaNumericDims } from "./areaEducationMath";

type Vector2 = [number, number];
const MIN_DIM = 0.3;
const LIGHT = { fill: "#2563eb", stroke: "#1d4ed8", pointB: "#f97316" };
const DARK = { fill: "#60a5fa", stroke: "#93c5fd", pointB: "#fb923c" };

function usesPointB(shape: AreaShape): boolean {
  return shape === "triangle" || shape === "parallelogram" || shape === "ellipse" || shape === "trapezoid";
}

function pointAFromDims(shape: AreaShape, n: AreaNumericDims): Vector2 {
  switch (shape) {
    case "square":
      return [n.side ?? 4, n.side ?? 4];
    case "rectangle":
      return [n.width ?? 6, n.height ?? 3.5];
    case "triangle":
    case "parallelogram":
      return [n.base ?? 6, 0];
    case "circle":
      return [n.radius ?? 3, 0];
    case "ellipse":
      return [n.semiMajorAxis ?? 5, 0];
    case "trapezoid":
      return [(n.base1 ?? 7) / 2, 0];
    case "sector": {
      const r = n.radius ?? 4;
      const rad = ((n.angleDegrees ?? 120) * Math.PI) / 180;
      return [r * Math.cos(rad), r * Math.sin(rad)];
    }
  }
}

function pointBFromDims(shape: AreaShape, n: AreaNumericDims): Vector2 {
  switch (shape) {
    case "triangle":
    case "parallelogram":
      return [(n.base ?? 6) * 0.4, n.height ?? 3.5];
    case "ellipse":
      return [0, n.semiMinorAxis ?? 3];
    case "trapezoid":
      return [(n.base2 ?? 4) / 2, n.height ?? 3];
    default:
      return [0, 0];
  }
}

// Upper bounds matter, not just the lower MIN_DIM one: the Mafs viewBox itself is re-derived
// from these same live dimensions every render (see viewBoxFor), so an unbounded drag can set up
// a runaway feedback loop — the viewBox keeps re-expanding mid-drag, which keeps re-scaling how
// far a constant screen-pixel delta maps in Mafs coordinate space, compounding across the many
// mousemove-driven renders of a single drag gesture into an absurd final value from a perfectly
// ordinary mouse movement. Clamping every draggable dimension to a sane maximum (generous enough
// for real exploration, far short of runaway) bounds the viewBox growth and keeps the gesture
// feeling proportional. Found via a real drag during screenshot capture, not a hypothetical.
const MAX_DIM = 20;

function constrainA(shape: AreaShape) {
  return (p: Vector2): Vector2 => {
    switch (shape) {
      case "square": {
        const v = Math.min(MAX_DIM, Math.max(MIN_DIM, p[0]));
        return [v, v];
      }
      case "rectangle":
        return [Math.min(MAX_DIM, Math.max(MIN_DIM, p[0])), Math.min(MAX_DIM, Math.max(MIN_DIM, p[1]))];
      case "triangle":
      case "parallelogram":
      case "circle":
      case "ellipse":
        return [Math.min(MAX_DIM, Math.max(MIN_DIM, p[0])), 0];
      case "trapezoid":
        return [Math.min(MAX_DIM / 2, Math.max(MIN_DIM / 2, p[0])), 0];
      case "sector": {
        const r = Math.min(Math.max(Math.hypot(p[0], p[1]), MIN_DIM), 9);
        const ang = Math.atan2(p[1], p[0]);
        return [r * Math.cos(ang), r * Math.sin(ang)];
      }
    }
  };
}

function constrainB(shape: AreaShape, n: AreaNumericDims) {
  return (p: Vector2): Vector2 => {
    switch (shape) {
      case "triangle":
      case "parallelogram": {
        const fixedX = (n.base ?? 6) * 0.4;
        return [fixedX, Math.min(MAX_DIM, Math.max(MIN_DIM, p[1]))];
      }
      case "ellipse":
        return [0, Math.min(MAX_DIM, Math.max(MIN_DIM, p[1]))];
      case "trapezoid":
        return [Math.min(MAX_DIM / 2, Math.max(0, p[0])), Math.min(MAX_DIM, Math.max(MIN_DIM, p[1]))];
      default:
        return p;
    }
  };
}

function viewBoxFor(shape: AreaShape, n: AreaNumericDims): { x: [number, number]; y: [number, number] } {
  switch (shape) {
    case "square": {
      const s = n.side ?? 4;
      const pad = Math.max(1, s * 0.3);
      return { x: [-pad, s + pad], y: [-pad, s + pad] };
    }
    case "rectangle": {
      const w = n.width ?? 6;
      const h = n.height ?? 3.5;
      const pad = Math.max(1, Math.max(w, h) * 0.3);
      return { x: [-pad, w + pad], y: [-pad, h + pad] };
    }
    case "triangle":
    case "parallelogram": {
      const b = n.base ?? 6;
      const h = n.height ?? 3.5;
      const pad = Math.max(1, Math.max(b, h) * 0.3);
      return { x: [-pad, b + pad], y: [-pad, h + pad] };
    }
    case "circle": {
      const r = n.radius ?? 3;
      const pad = Math.max(1, r * 0.35);
      return { x: [-r - pad, r + pad], y: [-r - pad, r + pad] };
    }
    case "ellipse": {
      const a = n.semiMajorAxis ?? 5;
      const b = n.semiMinorAxis ?? 3;
      const pad = Math.max(1, Math.max(a, b) * 0.35);
      return { x: [-a - pad, a + pad], y: [-b - pad, b + pad] };
    }
    case "trapezoid": {
      const b1 = n.base1 ?? 7;
      const h = n.height ?? 3;
      const half = b1 / 2;
      const pad = Math.max(1, Math.max(b1, h) * 0.3);
      return { x: [-half - pad, half + pad], y: [-pad, h + pad] };
    }
    case "sector": {
      const r = n.radius ?? 4;
      const pad = Math.max(1, r * 0.35);
      return { x: [-r - pad, r + pad], y: [-r - pad, r + pad] };
    }
  }
}

function shapePolygonPoints(shape: AreaShape, n: AreaNumericDims): Vector2[] | null {
  switch (shape) {
    case "square": {
      const s = n.side ?? 4;
      return [
        [0, 0],
        [s, 0],
        [s, s],
        [0, s],
      ];
    }
    case "rectangle": {
      const w = n.width ?? 6;
      const h = n.height ?? 3.5;
      return [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ];
    }
    case "triangle": {
      const b = n.base ?? 6;
      const h = n.height ?? 3.5;
      return [
        [0, 0],
        [b, 0],
        [b * 0.4, h],
      ];
    }
    case "parallelogram": {
      const b = n.base ?? 6;
      const h = n.height ?? 3.5;
      const skew = b * 0.25;
      return [
        [0, 0],
        [b, 0],
        [b + skew, h],
        [skew, h],
      ];
    }
    case "trapezoid": {
      const b1 = n.base1 ?? 7;
      const b2 = n.base2 ?? 4;
      const h = n.height ?? 3;
      return [
        [-b1 / 2, 0],
        [b1 / 2, 0],
        [b2 / 2, h],
        [-b2 / 2, h],
      ];
    }
    case "sector": {
      const r = n.radius ?? 4;
      const angleRad = ((n.angleDegrees ?? 120) * Math.PI) / 180;
      const steps = 28;
      const pts: Vector2[] = [[0, 0]];
      for (let i = 0; i <= steps; i++) {
        const a = (angleRad * i) / steps;
        pts.push([r * Math.cos(a), r * Math.sin(a)]);
      }
      return pts;
    }
    default:
      return null;
  }
}

function formulaLine(shape: AreaShape, n: AreaNumericDims, area: number): string {
  switch (shape) {
    case "square":
      return `A = s² = ${round(n.side ?? 0)}² = ${round(area)}`;
    case "rectangle":
      return `A = w × h = ${round(n.width ?? 0)} × ${round(n.height ?? 0)} = ${round(area)}`;
    case "triangle":
      return `A = ½ × b × h = ½ × ${round(n.base ?? 0)} × ${round(n.height ?? 0)} = ${round(area)}`;
    case "parallelogram":
      return `A = b × h = ${round(n.base ?? 0)} × ${round(n.height ?? 0)} = ${round(area)}`;
    case "circle":
      return `A = πr² = π × ${round(n.radius ?? 0)}² = ${round(area)}`;
    case "ellipse":
      return `A = πab = π × ${round(n.semiMajorAxis ?? 0)} × ${round(n.semiMinorAxis ?? 0)} = ${round(area)}`;
    case "trapezoid":
      return `A = ½(b₁+b₂)h = ½(${round(n.base1 ?? 0)}+${round(n.base2 ?? 0)}) × ${round(n.height ?? 0)} = ${round(area)}`;
    case "sector":
      return `A = (θ/360)πr² = (${round(n.angleDegrees ?? 0, 1)}/360)π × ${round(n.radius ?? 0)}² = ${round(area)}`;
  }
}

export default function AreaShapeDrag() {
  const t = useTranslations("tools.area-calculator.education.hero");
  const tShape = useTranslations("tools.area-calculator.form");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useAreaLive();
  const shape = dims.shape;
  const n = parseAreaDims(dims);
  const area = computeAreaFor(n);
  const perimeter = perimeterOf(n);
  const bUsed = usesPointB(shape);

  const lastA = useRef<Vector2>(pointAFromDims(shape, n));
  const lastB = useRef<Vector2>(pointBFromDims(shape, n));
  const suppressA = useRef(false);
  const suppressB = useRef(false);

  const pointA = useMovablePoint(pointAFromDims(shape, n), { constrain: constrainA(shape), color: colors.stroke });
  const pointB = useMovablePoint(pointBFromDims(shape, n), { constrain: constrainB(shape, n), color: colors.pointB });

  // External change (field edit, or switching shape) -> move the point(s) to match.
  useEffect(() => {
    const target = pointAFromDims(shape, n);
    if (Math.abs(target[0] - lastA.current[0]) > 0.005 || Math.abs(target[1] - lastA.current[1]) > 0.005) {
      suppressA.current = true;
      pointA.setPoint(target);
      lastA.current = target;
    }
    if (bUsed) {
      const targetB = pointBFromDims(shape, n);
      if (Math.abs(targetB[0] - lastB.current[0]) > 0.005 || Math.abs(targetB[1] - lastB.current[1]) > 0.005) {
        suppressB.current = true;
        pointB.setPoint(targetB);
        lastB.current = targetB;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, n.side, n.width, n.height, n.base, n.radius, n.semiMajorAxis, n.semiMinorAxis, n.base1, n.base2, n.angleDegrees]);

  // Drag -> write back into the real dims.
  useEffect(() => {
    if (suppressA.current) {
      suppressA.current = false;
      return;
    }
    const p = pointA.point;
    if (Math.abs(p[0] - lastA.current[0]) <= 0.005 && Math.abs(p[1] - lastA.current[1]) <= 0.005) return;
    lastA.current = p;
    switch (shape) {
      case "square":
        setDim("side", `${round(p[0])}`);
        break;
      case "rectangle":
        setDim("width", `${round(p[0])}`);
        setDim("height", `${round(p[1])}`);
        break;
      case "triangle":
      case "parallelogram":
        setDim("base", `${round(p[0])}`);
        break;
      case "circle":
        setDim("radius", `${round(p[0])}`);
        break;
      case "ellipse":
        setDim("semiMajorAxis", `${round(p[0])}`);
        break;
      case "trapezoid":
        setDim("base1", `${round(p[0] * 2)}`);
        break;
      case "sector": {
        const r = Math.hypot(p[0], p[1]);
        let deg = (Math.atan2(p[1], p[0]) * 180) / Math.PI;
        if (deg < 0) deg += 360;
        deg = Math.max(1, Math.min(360, deg));
        setDim("radius", `${round(r)}`);
        setDim("angleDegrees", `${round(deg, 1)}`);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointA.point]);

  useEffect(() => {
    if (!bUsed) return;
    if (suppressB.current) {
      suppressB.current = false;
      return;
    }
    const p = pointB.point;
    if (Math.abs(p[0] - lastB.current[0]) <= 0.005 && Math.abs(p[1] - lastB.current[1]) <= 0.005) return;
    lastB.current = p;
    switch (shape) {
      case "triangle":
      case "parallelogram":
        setDim("height", `${round(p[1])}`);
        break;
      case "ellipse":
        setDim("semiMinorAxis", `${round(p[1])}`);
        break;
      case "trapezoid":
        setDim("base2", `${round(p[0] * 2)}`);
        setDim("height", `${round(p[1])}`);
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointB.point]);

  const viewBox = viewBoxFor(shape, n);
  const polyPoints = shapePolygonPoints(shape, n);

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{tShape(`shape.${shape}`)}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("areaLabel")}: ${round(area)}`}</span>
        {perimeter !== null && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{`${t("perimeterLabel")}: ${round(perimeter)}`}</span>
        )}
      </div>

      <div dir="ltr" aria-label={t("ariaLabel", { shape: tShape(`shape.${shape}`) })} className="mafs-canvas mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
        <Mafs viewBox={viewBox} height={260} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: false, labels: false }} yAxis={{ lines: false, labels: false }} />
          {shape === "circle" && <Circle center={[0, 0]} radius={n.radius ?? 3} color={colors.fill} fillOpacity={0.25} weight={2.5} />}
          {shape === "ellipse" && <Ellipse center={[0, 0]} radius={[n.semiMajorAxis ?? 5, n.semiMinorAxis ?? 3]} color={colors.fill} fillOpacity={0.25} weight={2.5} />}
          {polyPoints && <Polygon points={polyPoints} color={colors.fill} fillOpacity={0.25} weight={2.5} />}
          {pointA.element}
          {bUsed && pointB.element}
        </Mafs>
      </div>

      <p dir="ltr" className="mt-2 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {formulaLine(shape, n, area)}
      </p>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
