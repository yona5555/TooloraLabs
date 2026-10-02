"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Circle, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import type { Solid3DShape } from "@tooloralabs/tools";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";
import { parseSurfaceDims, computeSurfaceAreaFor, round, type SurfaceNumericDims } from "./surfaceAreaEducationMath";

type Vector2 = [number, number];
type Rect = { x: number; y: number; w: number; h: number };
const MIN_DIM = 0.3;
const LIGHT = { fill: "#2563eb", stroke: "#1d4ed8", pointB: "#f97316" };
const DARK = { fill: "#60a5fa", stroke: "#93c5fd", pointB: "#fb923c" };

function usesPointB(shape: Solid3DShape): boolean {
  return shape !== "cube" && shape !== "sphere";
}

function pointAFromDims(shape: Solid3DShape, n: SurfaceNumericDims): Vector2 {
  switch (shape) {
    case "cube":
      return [n.side ?? 3, n.side ?? 3];
    case "rectangular-prism":
      return [n.length ?? 5, 0];
    case "sphere":
      return [n.radius ?? 3, 0];
    case "cylinder":
    case "cone":
      return [n.radius ?? 3, 0];
    case "square-pyramid":
      return [n.baseSide ?? 4, 0];
  }
}

function pointBFromDims(shape: Solid3DShape, n: SurfaceNumericDims): Vector2 {
  switch (shape) {
    case "rectangular-prism":
      return [n.width ?? 3, n.height ?? 4];
    case "cylinder":
    case "cone":
      return [0, n.height ?? 6];
    case "square-pyramid":
      return [0, n.height ?? 5];
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
const MAX_PRIMARY = 15;
const MAX_SECONDARY = 12;

function constrainA(shape: Solid3DShape) {
  return (p: Vector2): Vector2 => {
    switch (shape) {
      case "cube": {
        const v = Math.min(MAX_PRIMARY, Math.max(MIN_DIM, p[0]));
        return [v, v];
      }
      case "rectangular-prism":
        return [Math.min(MAX_PRIMARY, Math.max(MIN_DIM, p[0])), 0];
      case "sphere":
        return [Math.min(MAX_SECONDARY, Math.max(MIN_DIM, p[0])), 0];
      case "cylinder":
      case "cone":
        return [Math.min(MAX_SECONDARY, Math.max(MIN_DIM, p[0])), 0];
      case "square-pyramid":
        return [Math.min(MAX_SECONDARY, Math.max(MIN_DIM, p[0])), 0];
    }
  };
}

function constrainB(shape: Solid3DShape) {
  return (p: Vector2): Vector2 => {
    switch (shape) {
      case "rectangular-prism":
        return [Math.min(MAX_SECONDARY, Math.max(MIN_DIM, p[0])), Math.min(MAX_SECONDARY, Math.max(MIN_DIM, p[1]))];
      case "cylinder":
      case "cone":
      case "square-pyramid":
        return [0, Math.min(MAX_PRIMARY, Math.max(MIN_DIM, p[1]))];
      default:
        return p;
    }
  };
}

function viewBoxFor(shape: Solid3DShape, n: SurfaceNumericDims): { x: [number, number]; y: [number, number] } {
  switch (shape) {
    case "cube": {
      const s = n.side ?? 3;
      return { x: [-0.5, 4 * s + 0.5], y: [-0.5, 3 * s + 0.5] };
    }
    case "rectangular-prism": {
      const l = n.length ?? 5;
      const w = n.width ?? 3;
      const h = n.height ?? 4;
      return { x: [-0.5, w * 2 + l * 2 + 0.5], y: [-0.5, w + h + 0.5] };
    }
    case "sphere": {
      const r = n.radius ?? 3;
      return { x: [-0.5, (2 * r + 0.6) * 4], y: [-0.5, 2 * r + 0.5] };
    }
    case "cylinder": {
      const r = n.radius ?? 3;
      const h = n.height ?? 6;
      const circumference = 2 * Math.PI * r;
      return { x: [-0.5, circumference + 0.5], y: [-0.5, 4 * r + h + 0.5] };
    }
    case "cone": {
      const r = n.radius ?? 3;
      const h = n.height ?? 5;
      const slant = Math.sqrt(r * r + h * h);
      return { x: [-slant - 0.5, slant + 0.5], y: [-0.5, 2 * slant + 2 * r + 1] };
    }
    case "square-pyramid": {
      const b = n.baseSide ?? 4;
      const h = n.height ?? 5;
      const slant = Math.sqrt(h * h + (b / 2) * (b / 2));
      const span = b + 2 * slant;
      return { x: [-span / 2 - 0.5, span / 2 + 0.5], y: [-slant - 0.5, b + slant + 0.5] };
    }
  }
}

function rectPoints(r: Rect): Vector2[] {
  return [
    [r.x, r.y],
    [r.x + r.w, r.y],
    [r.x + r.w, r.y + r.h],
    [r.x, r.y + r.h],
  ];
}

export default function SurfaceAreaNetDrag() {
  const t = useTranslations("tools.surface-area-calculator.education.hero");
  const tShape = useTranslations("tools.surface-area-calculator.form");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useSurfaceAreaLive();
  const shape = dims.shape;
  const n = parseSurfaceDims(dims);
  const total = computeSurfaceAreaFor(n);
  const bUsed = usesPointB(shape);

  const lastA = useRef<Vector2>(pointAFromDims(shape, n));
  const lastB = useRef<Vector2>(pointBFromDims(shape, n));
  const suppressA = useRef(false);
  const suppressB = useRef(false);

  const pointA = useMovablePoint(pointAFromDims(shape, n), { constrain: constrainA(shape), color: colors.stroke });
  const pointB = useMovablePoint(pointBFromDims(shape, n), { constrain: constrainB(shape), color: colors.pointB });

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
  }, [shape, n.side, n.length, n.width, n.height, n.radius, n.baseSide]);

  useEffect(() => {
    if (suppressA.current) {
      suppressA.current = false;
      return;
    }
    const p = pointA.point;
    if (Math.abs(p[0] - lastA.current[0]) <= 0.005 && Math.abs(p[1] - lastA.current[1]) <= 0.005) return;
    lastA.current = p;
    switch (shape) {
      case "cube":
        setDim("side", `${round(p[0])}`);
        break;
      case "rectangular-prism":
        setDim("length", `${round(p[0])}`);
        break;
      case "sphere":
      case "cylinder":
      case "cone":
        setDim("radius", `${round(p[0])}`);
        break;
      case "square-pyramid":
        setDim("baseSide", `${round(p[0])}`);
        break;
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
      case "rectangular-prism":
        setDim("width", `${round(p[0])}`);
        setDim("height", `${round(p[1])}`);
        break;
      case "cylinder":
      case "cone":
      case "square-pyramid":
        setDim("height", `${round(p[1])}`);
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointB.point]);

  const viewBox = viewBoxFor(shape, n);

  let netElements: ReactNode = null;
  if (shape === "cube") {
    const s = n.side ?? 3;
    const faces: Rect[] = [
      { x: s, y: 0, w: s, h: s },
      { x: 0, y: s, w: s, h: s },
      { x: s, y: s, w: s, h: s },
      { x: 2 * s, y: s, w: s, h: s },
      { x: 3 * s, y: s, w: s, h: s },
      { x: s, y: 2 * s, w: s, h: s },
    ];
    netElements = faces.map((r, i) => <Polygon key={i} points={rectPoints(r)} color={colors.fill} fillOpacity={0.22} weight={2} />);
  } else if (shape === "rectangular-prism") {
    const l = n.length ?? 5;
    const w = n.width ?? 3;
    const h = n.height ?? 4;
    const front: Rect = { x: w, y: w, w: l, h };
    const top: Rect = { x: w, y: 0, w: l, h: w };
    const bottom: Rect = { x: w, y: w + h, w: l, h: w };
    const left: Rect = { x: 0, y: w, w, h };
    const right: Rect = { x: w + l, y: w, w, h };
    const back: Rect = { x: w + l + w, y: w, w: l, h };
    netElements = [front, top, bottom, left, right, back].map((r, i) => <Polygon key={i} points={rectPoints(r)} color={colors.fill} fillOpacity={0.22} weight={2} />);
  } else if (shape === "sphere") {
    const r = n.radius ?? 3;
    const step = 2 * r + 0.6;
    netElements = [0, 1, 2, 3].map((i) => <Circle key={i} center={[r + i * step, r]} radius={r} color={colors.fill} fillOpacity={0.22} weight={2} />);
  } else if (shape === "cylinder") {
    const r = n.radius ?? 3;
    const h = n.height ?? 6;
    const circumference = 2 * Math.PI * r;
    const bodyRect: Rect = { x: 0, y: 2 * r, w: circumference, h };
    netElements = (
      <>
        <Circle center={[r, r]} radius={r} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Polygon points={rectPoints(bodyRect)} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Circle center={[r, 2 * r + h + r]} radius={r} color={colors.fill} fillOpacity={0.22} weight={2} />
      </>
    );
  } else if (shape === "cone") {
    const r = n.radius ?? 3;
    const h = n.height ?? 5;
    const slant = Math.sqrt(r * r + h * h);
    const sectorAngleDeg = Math.min(360, (r / slant) * 360);
    const angleRad = (sectorAngleDeg * Math.PI) / 180;
    const steps = 32;
    const apexX = 0;
    const apexY = slant;
    const startAngle = -Math.PI / 2 - angleRad / 2;
    const sectorPts: Vector2[] = [[apexX, apexY]];
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (angleRad * i) / steps;
      sectorPts.push([apexX + slant * Math.cos(a), apexY + slant * Math.sin(a)]);
    }
    netElements = (
      <>
        <Polygon points={sectorPts} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Circle center={[0, 2 * slant + r]} radius={r} color={colors.fill} fillOpacity={0.22} weight={2} />
      </>
    );
  } else if (shape === "square-pyramid") {
    const b = n.baseSide ?? 4;
    const h = n.height ?? 5;
    const slant = Math.sqrt(h * h + (b / 2) * (b / 2));
    const base: Rect = { x: -b / 2, y: 0, w: b, h: b };
    const triTop: Vector2[] = [
      [-b / 2, 0],
      [b / 2, 0],
      [0, -slant],
    ];
    const triBottom: Vector2[] = [
      [-b / 2, b],
      [b / 2, b],
      [0, b + slant],
    ];
    const triLeft: Vector2[] = [
      [-b / 2, 0],
      [-b / 2, b],
      [-b / 2 - slant, b / 2],
    ];
    const triRight: Vector2[] = [
      [b / 2, 0],
      [b / 2, b],
      [b / 2 + slant, b / 2],
    ];
    netElements = (
      <>
        <Polygon points={rectPoints(base)} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Polygon points={triTop} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Polygon points={triBottom} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Polygon points={triLeft} color={colors.fill} fillOpacity={0.22} weight={2} />
        <Polygon points={triRight} color={colors.fill} fillOpacity={0.22} weight={2} />
      </>
    );
  }

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{tShape(`shape.${shape}`)}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("totalLabel")}: ${round(total)}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel", { shape: tShape(`shape.${shape}`) })} className="mafs-canvas mx-auto w-full max-w-[460px] overflow-hidden rounded-xl">
        <Mafs viewBox={viewBox} height={260} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: false, labels: false }} yAxis={{ lines: false, labels: false }} />
          {netElements}
          {pointA.element}
          {bUsed && pointB.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
