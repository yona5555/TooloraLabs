"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Polygon, Circle, Ellipse, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import type { Solid3DShape } from "@tooloralabs/tools";
import { useVolumeLive } from "./VolumeLiveContext";
import { parseVolumeDims, computeVolumeFor, round, type VolumeNumericDims } from "./volumeEducationMath";

type Vector2 = [number, number];
const MIN_DIM = 0.3;
const MAX_PRIMARY = 15;
const MAX_SECONDARY = 12;
const LIGHT = { fill: "#2563eb", stroke: "#1d4ed8", pointB: "#f97316" };
const DARK = { fill: "#60a5fa", stroke: "#93c5fd", pointB: "#fb923c" };

function usesPointB(shape: Solid3DShape): boolean {
  return shape !== "cube" && shape !== "sphere";
}

function pointAFromDims(shape: Solid3DShape, n: VolumeNumericDims): Vector2 {
  switch (shape) {
    case "cube":
      return [n.side ?? 3, n.side ?? 3];
    case "rectangular-prism":
      return [n.length ?? 5, 0];
    case "sphere":
    case "cylinder":
    case "cone":
      return [n.radius ?? 3, 0];
    case "square-pyramid":
      return [n.baseSide ?? 4, 0];
  }
}

function pointBFromDims(shape: Solid3DShape, n: VolumeNumericDims): Vector2 {
  switch (shape) {
    case "rectangular-prism":
      return [n.width ?? 3, n.height ?? 4];
    case "cylinder":
    case "cone":
    case "square-pyramid":
      return [0, n.height ?? 6];
    default:
      return [0, 0];
  }
}

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
      case "cylinder":
      case "cone":
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

function viewBoxFor(shape: Solid3DShape, n: VolumeNumericDims): { x: [number, number]; y: [number, number] } {
  switch (shape) {
    case "cube": {
      const s = n.side ?? 3;
      const depth = s * 0.4;
      return { x: [-0.5, s + depth + 0.5], y: [-0.5, s + depth + 0.5] };
    }
    case "rectangular-prism": {
      const l = n.length ?? 5;
      const w = n.width ?? 3;
      const h = n.height ?? 4;
      const depth = w * 0.4;
      return { x: [-0.5, l + depth + 0.5], y: [-0.5, h + depth + 0.5] };
    }
    case "sphere": {
      const r = n.radius ?? 3;
      const pad = Math.max(1, r * 0.35);
      return { x: [-r - pad, r + pad], y: [-r - pad, r + pad] };
    }
    case "cylinder": {
      const r = n.radius ?? 3;
      const h = n.height ?? 6;
      const capRy = r * 0.32;
      const pad = Math.max(1, r * 0.3);
      return { x: [-r - pad, r + pad], y: [-capRy - pad, h + capRy + pad] };
    }
    case "cone": {
      const r = n.radius ?? 3;
      const h = n.height ?? 5;
      const capRy = r * 0.32;
      const pad = Math.max(1, r * 0.3);
      return { x: [-r - pad, r + pad], y: [-capRy - pad, h + pad] };
    }
    case "square-pyramid": {
      const b = n.baseSide ?? 4;
      const h = n.height ?? 5;
      const pad = Math.max(1, Math.max(b, h) * 0.3);
      return { x: [-b / 2 - pad, b / 2 + pad], y: [-pad, h + pad] };
    }
  }
}

export default function VolumeShapeDrag() {
  const t = useTranslations("tools.volume-calculator.education.hero");
  const tShape = useTranslations("tools.volume-calculator.form");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useVolumeLive();
  const shape = dims.shape;
  const n = parseVolumeDims(dims);
  const volume = computeVolumeFor(n);
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

  let solidElements: ReactNode = null;
  if (shape === "cube") {
    const s = n.side ?? 3;
    const depth = s * 0.4;
    solidElements = (
      <>
        <Polygon points={[[0, 0], [s, 0], [s, s], [0, s]]} color={colors.fill} fillOpacity={0.25} weight={2} />
        <Polygon points={[[0, s], [s, s], [s + depth, s + depth], [depth, s + depth]]} color={colors.fill} fillOpacity={0.15} weight={2} />
        <Polygon points={[[s, 0], [s, s], [s + depth, s + depth], [s + depth, depth]]} color={colors.fill} fillOpacity={0.1} weight={2} />
      </>
    );
  } else if (shape === "rectangular-prism") {
    const l = n.length ?? 5;
    const w = n.width ?? 3;
    const h = n.height ?? 4;
    const depth = w * 0.4;
    solidElements = (
      <>
        <Polygon points={[[0, 0], [l, 0], [l, h], [0, h]]} color={colors.fill} fillOpacity={0.25} weight={2} />
        <Polygon points={[[0, h], [l, h], [l + depth, h + depth], [depth, h + depth]]} color={colors.fill} fillOpacity={0.15} weight={2} />
        <Polygon points={[[l, 0], [l, h], [l + depth, h + depth], [l + depth, depth]]} color={colors.fill} fillOpacity={0.1} weight={2} />
      </>
    );
  } else if (shape === "sphere") {
    const r = n.radius ?? 3;
    solidElements = <Circle center={[0, 0]} radius={r} color={colors.fill} fillOpacity={0.25} weight={2} />;
  } else if (shape === "cylinder") {
    const r = n.radius ?? 3;
    const h = n.height ?? 6;
    const capRy = r * 0.32;
    solidElements = (
      <>
        <Polygon points={[[-r, 0], [r, 0], [r, h], [-r, h]]} color={colors.fill} fillOpacity={0.25} weight={2} />
        <Ellipse center={[0, h]} radius={[r, capRy]} color={colors.fill} fillOpacity={0.25} weight={2} />
        <Ellipse center={[0, 0]} radius={[r, capRy]} color={colors.fill} fillOpacity={0.25} weight={2} />
      </>
    );
  } else if (shape === "cone") {
    const r = n.radius ?? 3;
    const h = n.height ?? 5;
    const capRy = r * 0.32;
    solidElements = (
      <>
        <Polygon points={[[0, h], [r, 0], [-r, 0]]} color={colors.fill} fillOpacity={0.25} weight={2} />
        <Ellipse center={[0, 0]} radius={[r, capRy]} color={colors.fill} fillOpacity={0.25} weight={2} />
      </>
    );
  } else if (shape === "square-pyramid") {
    const b = n.baseSide ?? 4;
    const h = n.height ?? 5;
    solidElements = <Polygon points={[[0, h], [b / 2, 0], [-b / 2, 0]]} color={colors.fill} fillOpacity={0.25} weight={2} />;
  }

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{tShape(`shape.${shape}`)}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("volumeLabel")}: ${round(volume)}`}</span>
      </div>

      <div dir="ltr" aria-label={t("ariaLabel", { shape: tShape(`shape.${shape}`) })} className="mafs-canvas mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
        <Mafs viewBox={viewBox} height={260} pan={false} zoom={false}>
          <Coordinates.Cartesian xAxis={{ lines: false, labels: false }} yAxis={{ lines: false, labels: false }} />
          {solidElements}
          {pointA.element}
          {bUsed && pointB.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
