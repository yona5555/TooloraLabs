"use client";
import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Polyline, Point, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "./triangleMafsTheme.css";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { projectOntoActiveAngleBase, isDegenerateTriangle, angleAtVertex, triangleAreaFromVertices } from "@tooloralabs/tools";
import type { TrianglePoint } from "./types";
import { MafsHoverSegment, MafsHoverPoint } from "./MafsHoverPrimitives";
import TriangleAngleSinCosCurve from "./TriangleAngleSinCosCurve";

type Vector2 = [number, number];

export type LiveTriangleValues = {
  a: number;
  b: number;
  c: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
};

type Props = {
  vertices: [TrianglePoint, TrianglePoint, TrianglePoint];
  digitStyle: DigitStyle;
  onVerticesCommit: (a: number, b: number, c: number) => void;
  onLiveChange: (live: LiveTriangleValues) => void;
};

const VERTEX_LABELS = ["A", "B", "C"] as const;
const SIDE_LETTERS = ["a", "b", "c"] as const;

const LIGHT_COLORS = { blueA: "#2563eb", violetB: "#7c3aed", amberC: "#d97706", red: "#dc2626", green: "#16a34a", fg: "#3f3f46", faint: "#a1a1aa" };
const DARK_COLORS = { blueA: "#60a5fa", violetB: "#a78bfa", amberC: "#fbbf24", red: "#f87171", green: "#4ade80", fg: "#d4d4d8", faint: "#71717a" };

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

function toPt(v: Vector2): TrianglePoint {
  return { x: v[0], y: v[1] };
}
function toVec(p: TrianglePoint): Vector2 {
  return [p.x, p.y];
}
function dist(p: TrianglePoint, q: TrianglePoint): number {
  return Math.hypot(p.x - q.x, p.y - q.y);
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeViewBox(vertices: [TrianglePoint, TrianglePoint, TrianglePoint]) {
  const xs = vertices.map((v) => v.x);
  const ys = vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const padX = span * 0.55 + 0.6;
  const padY = span * 0.65 + 1.1;
  return {
    x: [minX - padX, maxX + padX] as [number, number],
    y: [minY - padY * 0.55, maxY + padY] as [number, number],
  };
}

/** The outward perpendicular offset from a segment's midpoint, flipped away from the given centroid so labels never sit over the triangle's interior. */
function outwardOffsetFromSegment(p1: TrianglePoint, p2: TrianglePoint, centroid: TrianglePoint, distancePx: number): TrianglePoint {
  const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  let px = -dy / len;
  let py = dx / len;
  const towardCentroid = (centroid.x - mid.x) * px + (centroid.y - mid.y) * py;
  if (towardCentroid > 0) {
    px = -px;
    py = -py;
  }
  return { x: mid.x + px * distancePx, y: mid.y + py * distancePx };
}

function outwardFromCentroid(centroid: TrianglePoint, p: TrianglePoint, distance: number): TrianglePoint {
  const dx = p.x - centroid.x;
  const dy = p.y - centroid.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / len) * distance, y: p.y + (dy / len) * distance };
}

function arcPoints(center: TrianglePoint, from: TrianglePoint, to: TrianglePoint, radius: number, segments = 20): Vector2[] {
  const a1 = Math.atan2(from.y - center.y, from.x - center.x);
  const a2 = Math.atan2(to.y - center.y, to.x - center.x);
  let delta = a2 - a1;
  while (delta <= -Math.PI) delta += 2 * Math.PI;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  const pts: Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = a1 + (delta * i) / segments;
    pts.push([center.x + radius * Math.cos(t), center.y + radius * Math.sin(t)]);
  }
  return pts;
}

/**
 * The above-the-fold interactive Result diagram (§36 follow-up): drag any of the triangle's
 * three vertices — via mouse, touch, or keyboard, all built into Mafs' MovablePoint — and every
 * downstream number (the active angle's red/green projection onto its base line, all three
 * angles, the area, the sin/cos curve below) recomputes live. Distinct from the page's other
 * drag indicator, TriangleInteractivePlayground further down the page: that one is a simple
 * "drag and see every value" explorer with no per-angle construction; this one is built
 * specifically around ONE active angle at a time, decomposing it into its real height/adjacent
 * projection (§23) with hover-depth formulas, which the Playground does not attempt.
 */
export default function TriangleInteractiveDiagram({ vertices: initialVertices, digitStyle, onVerticesCommit, onLiveChange }: Props) {
  const t = useTranslations("tools.triangle-calculator.interactiveDiagram");
  const isDark = useSyncExternalStore(subscribeDark, getDarkSnapshot, getDarkServerSnapshot);
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const [activeIndex, setActiveIndex] = useState<0 | 1 | 2>(0);
  const [viewBox] = useState(() => computeViewBox(initialVertices));

  const marginX = (viewBox.x[1] - viewBox.x[0]) * 0.04;
  const marginY = (viewBox.y[1] - viewBox.y[0]) * 0.04;
  function clampToView(v: Vector2): Vector2 {
    return [Math.min(viewBox.x[1] - marginX, Math.max(viewBox.x[0] + marginX, v[0])), Math.min(viewBox.y[1] - marginY, Math.max(viewBox.y[0] + marginY, v[1]))];
  }

  const aRef = useRef<Vector2>(toVec(initialVertices[0]));
  const bRef = useRef<Vector2>(toVec(initialVertices[1]));
  const cRef = useRef<Vector2>(toVec(initialVertices[2]));

  function constrainVertex(proposed: Vector2, other1: Vector2, other2: Vector2, selfFallback: Vector2): Vector2 {
    const clamped = clampToView(proposed);
    if (isDegenerateTriangle(toPt(clamped), toPt(other1), toPt(other2))) return selfFallback;
    return clamped;
  }

  const A = useMovablePoint(toVec(initialVertices[0]), {
    color: colors.blueA,
    constrain: (p) => constrainVertex(p, bRef.current, cRef.current, aRef.current),
  });
  const B = useMovablePoint(toVec(initialVertices[1]), {
    color: colors.violetB,
    constrain: (p) => constrainVertex(p, aRef.current, cRef.current, bRef.current),
  });
  const C = useMovablePoint(toVec(initialVertices[2]), {
    color: colors.amberC,
    constrain: (p) => constrainVertex(p, aRef.current, bRef.current, cRef.current),
  });
  useEffect(() => {
    aRef.current = A.point;
    bRef.current = B.point;
    cRef.current = C.point;
  });

  const pA = toPt(A.point);
  const pB = toPt(B.point);
  const pC = toPt(C.point);
  const pts = [pA, pB, pC];
  const centroid = { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 };

  const sideA = dist(pB, pC);
  const sideB = dist(pA, pC);
  const sideC = dist(pA, pB);
  const angleADeg = angleAtVertex(pA, pB, pC);
  const angleBDeg = angleAtVertex(pB, pA, pC);
  const angleCDeg = 180 - angleADeg - angleBDeg;
  const angles = [angleADeg, angleBDeg, angleCDeg];
  const area = triangleAreaFromVertices(pA, pB, pC);
  const perimeter = sideA + sideB + sideC;

  useEffect(() => {
    onLiveChange({ a: sideA, b: sideB, c: sideC, angleA: angleADeg, angleB: angleBDeg, angleC: angleCDeg, area, perimeter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pA.x, pA.y, pB.x, pB.y, pC.x, pC.y]);

  const dragStartRef = useRef<{ a: number; b: number; c: number } | null>(null);
  function handleDragStart() {
    dragStartRef.current = { a: sideA, b: sideB, c: sideC };
  }
  function handleDragEnd() {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (start && Math.abs(start.a - sideA) < 0.005 && Math.abs(start.b - sideB) < 0.005 && Math.abs(start.c - sideC) < 0.005) return;
    onVerticesCommit(round2(sideA), round2(sideB), round2(sideC));
  }

  const activeVertex = pts[activeIndex];
  const baseIndex = ((activeIndex + 1) % 3) as 0 | 1 | 2;
  const farIndex = ((activeIndex + 2) % 3) as 0 | 1 | 2;
  const baseVertex = pts[baseIndex];
  const farVertex = pts[farIndex];
  const projection = projectOntoActiveAngleBase(activeVertex, baseVertex, farVertex);

  const segmentSideLetter = SIDE_LETTERS[baseIndex];
  const heightSubLetter = SIDE_LETTERS[farIndex];
  const activeAngleLetter = VERTEX_LABELS[activeIndex];

  const heightFormulaText = t("heightFormula", { side: segmentSideLetter, angle: activeAngleLetter, value: fmt(projection.heightLength) });
  const adjacentFormulaText = t("adjacentFormula", { side: segmentSideLetter, angle: activeAngleLetter, value: fmt(projection.signedAdjacent) });
  const areaFormulaText = t("areaFormula", { base: heightSubLetter, value: fmt(area) });

  const minSide = Math.min(sideA, sideB, sideC) || 1;
  const arcRadius = Math.min(Math.max(minSide * 0.22, 0.35), 1.2);
  const arc = arcPoints(activeVertex, baseVertex, farVertex, arcRadius);
  const arcMidAngle = Math.atan2((arc[Math.floor(arc.length / 2)][1] - activeVertex.y), arc[Math.floor(arc.length / 2)][0] - activeVertex.x);
  const arcLabelPos: TrianglePoint = { x: activeVertex.x + (arcRadius + 0.42) * Math.cos(arcMidAngle), y: activeVertex.y + (arcRadius + 0.42) * Math.sin(arcMidAngle) };

  const markSize = Math.min(Math.max(minSide * 0.12, 0.15), 0.45);
  const dBackLen = dist(projection.foot, projection.activeVertex);
  const dUpLen = dist(projection.foot, projection.farVertex);
  let rightAngleMark: Vector2[] | null = null;
  if (dBackLen > 0.05 && dUpLen > 0.05) {
    const dBack = { x: (projection.activeVertex.x - projection.foot.x) / dBackLen, y: (projection.activeVertex.y - projection.foot.y) / dBackLen };
    const dUp = { x: (projection.farVertex.x - projection.foot.x) / dUpLen, y: (projection.farVertex.y - projection.foot.y) / dUpLen };
    const p2: TrianglePoint = { x: projection.foot.x + dBack.x * markSize, y: projection.foot.y + dBack.y * markSize };
    const p3: TrianglePoint = { x: p2.x + dUp.x * markSize, y: p2.y + dUp.y * markSize };
    const p4: TrianglePoint = { x: projection.foot.x + dUp.x * markSize, y: projection.foot.y + dUp.y * markSize };
    rightAngleMark = [toVec(p2), toVec(p3), toVec(p4)];
  }

  const heightLabelPos = outwardOffsetFromSegment(projection.farVertex, projection.foot, centroid, 0.38);
  const adjacentLabelPos = outwardOffsetFromSegment(projection.activeVertex, projection.foot, centroid, 0.38);
  const footLabelPos = outwardFromCentroid(centroid, projection.foot, 0.32);

  const vertexLabelPositions = pts.map((p) => outwardFromCentroid(centroid, p, 0.42));

  function trigTooltip(letter: string, deg: number): string {
    const rad = (deg * Math.PI) / 180;
    const tanValue = Math.abs(deg - 90) < 0.05 ? "∞" : fmt(Math.tan(rad));
    return t("trigFormula", { angle: letter, s: fmt(Math.sin(rad)), c: fmt(Math.cos(rad)), tg: tanValue });
  }

  function lawOfCosinesTooltip(side: string, angle: string, o1: string, o2: string, value: number): string {
    return t("lawOfCosinesFormula", { side, angle, o1, o2, value: fmt(value) });
  }

  return (
    <div className="mt-2" data-testid="triangle-interactive-result-diagram">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div dir="ltr" className="flex items-center gap-1.5">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`θ = ${fmt(angles[activeIndex])}°`}</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`θ = ${fmt((angles[activeIndex] * Math.PI) / 180)} ${t("radUnit")}`}</span>
        </div>
        <div role="group" aria-label={t("selectorLabel")} className="flex gap-1.5">
          {VERTEX_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={activeIndex === i}
              onClick={() => setActiveIndex(i as 0 | 1 | 2)}
              className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${
                activeIndex === i
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        dir="ltr"
        aria-label={t("ariaLabel")}
        className="triangle-mafs w-full overflow-hidden rounded-xl"
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        <Mafs viewBox={viewBox} height={300} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ axis: false, lines: false }} yAxis={{ axis: false, lines: false }} />

          <Polygon points={[A.point, B.point, C.point]} color={colors.blueA} fillOpacity={0.1} strokeOpacity={0} />

          <MafsHoverSegment point1={A.point} point2={B.point} color={colors.fg} weight={2} tooltip={lawOfCosinesTooltip("c", "C", "a", "b", sideC)} />
          <MafsHoverSegment point1={B.point} point2={C.point} color={colors.fg} weight={2} tooltip={lawOfCosinesTooltip("a", "A", "b", "c", sideA)} />
          <MafsHoverSegment point1={C.point} point2={A.point} color={colors.fg} weight={2} tooltip={lawOfCosinesTooltip("b", "B", "c", "a", sideB)} />

          <MafsHoverSegment point1={toVec(projection.farVertex)} point2={toVec(projection.foot)} color={colors.red} weight={2.75} tooltip={heightFormulaText} />
          <MafsHoverSegment
            point1={toVec(projection.activeVertex)}
            point2={toVec(projection.foot)}
            color={colors.green}
            weight={2.75}
            dashed={projection.isObtuse}
            tooltip={adjacentFormulaText}
          />
          {rightAngleMark && <Polyline points={rightAngleMark} color={colors.fg} weight={1.5} fillOpacity={0} />}
          <Point x={projection.foot.x} y={projection.foot.y} color={colors.fg} opacity={0.6} svgCircleProps={{ r: 3 }} />
          <Text x={footLabelPos.x} y={footLabelPos.y} size={12} color={colors.fg}>
            H
          </Text>

          <Polyline points={arc} color={colors.blueA} weight={2} fillOpacity={0} />
          <Text x={arcLabelPos.x} y={arcLabelPos.y} size={12} color={colors.blueA}>
            {`${fmt(angles[activeIndex])}°`}
          </Text>

          <Text x={heightLabelPos.x} y={heightLabelPos.y} size={11} color={colors.red}>
            {heightFormulaText}
          </Text>
          <Text x={adjacentLabelPos.x} y={adjacentLabelPos.y} size={11} color={colors.green}>
            {adjacentFormulaText}
          </Text>

          {VERTEX_LABELS.map((label, i) => (
            <Text key={label} x={vertexLabelPositions[i].x} y={vertexLabelPositions[i].y} size={13} color={i === 0 ? colors.blueA : i === 1 ? colors.violetB : colors.amberC}>
              {label}
            </Text>
          ))}

          <MafsHoverPoint point={A.point} tooltip={trigTooltip("A", angleADeg)} />
          <MafsHoverPoint point={B.point} tooltip={trigTooltip("B", angleBDeg)} />
          <MafsHoverPoint point={C.point} tooltip={trigTooltip("C", angleCDeg)} />

          {A.element}
          {B.element}
          {C.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
      <p dir="ltr" className="mt-1 text-center font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {areaFormulaText}
      </p>

      <TriangleAngleSinCosCurve angleADeg={angleADeg} angleBDeg={angleBDeg} angleCDeg={angleCDeg} activeIndex={activeIndex} digitStyle={digitStyle} />
    </div>
  );
}
