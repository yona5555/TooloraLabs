"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AREA_FACTORS,
  clipGridLines,
  countGridCells,
  planeMetrics,
  planeOutline,
  unitGridStep,
  type PlaneDims,
  type Pt,
} from "@tooloralabs/tools";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { AreaDraft } from "./types";
import { useAreaLive } from "./AreaLiveContext";
import type { AreaScene3DProps } from "./AreaScene3D";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const AreaScene3D = dynamic(() => import("./AreaScene3D"), { ssr: false });

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function parseAreaDraft(d: AreaDraft): PlaneDims {
  return {
    shape: d.shape,
    side: toNum(d.side),
    width: toNum(d.width),
    height: toNum(d.height),
    base: toNum(d.base),
    radius: toNum(d.radius),
    semiMajorAxis: toNum(d.semiMajorAxis),
    semiMinorAxis: toNum(d.semiMinorAxis),
    base1: toNum(d.base1),
    base2: toNum(d.base2),
    angleDegrees: toNum(d.angleDegrees),
  };
}

type DimKey = "side" | "width" | "height" | "base" | "radius" | "semiMajorAxis" | "semiMinorAxis" | "base1" | "base2" | "angleDegrees";

/** Deep live table + the shape as a 3D slab with its unit-square grid. */
export default function AreaLive3D({ draft }: { draft: AreaDraft }) {
  const t = useTranslations("tools.area-calculator.live3d");
  const tc = useTranslations("common.live3d");
  const ds = resolveDigitStyle();
  const f = (v: number, max = 4) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  const n = (v: number) => formatLocalizedNumber(v, "western", { maximumFractionDigits: 3 });

  const d = parseAreaDraft(draft);
  const m = planeMetrics(d);
  if (!m) return null;

  const uL = t("units.len");
  const uA = t("units.area");
  const A = m.area;
  const outline = planeOutline(d);
  const xs = outline.map((q) => q[0]);
  const ys = outline.map((q) => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const step = unitGridStep(Math.max(x1 - x0, y1 - y0));
  const grid = clipGridLines(outline, step);
  const cells = countGridCells(outline, step);

  const dim = (key: DimKey, sym: string): LiveTableRow => ({
    label: t(`rows.${key}`),
    formula: sym,
    value: f(d[key] as number),
    unit: key === "angleDegrees" ? "°" : uL,
  });
  const { side: s = 0, width: w = 0, height: h = 0, base: b = 0, radius: r = 0, semiMajorAxis: sa = 0, semiMinorAxis: sb = 0, base1: b1 = 0, base2: b2 = 0, angleDegrees: deg = 0 } = d;

  const inputs: LiveTableRow[] = [];
  const steps: LiveTableRow[] = [];
  let areaFormula = "";
  const dims: AreaScene3DProps["dims"] = [];
  const marks: NonNullable<AreaScene3DProps["marks"]> = [];
  const below: Pt = [0, -0.3];
  const left: Pt = [-0.4, 0];

  switch (d.shape) {
    case "square":
      inputs.push(dim("side", "s"));
      steps.push({ label: t("rows.sideSquared"), formula: `s × s = ${n(s)} × ${n(s)}`, value: f(s * s), unit: uA });
      areaFormula = `s² = ${n(s)}²`;
      dims.push({ from: [x0, y0], to: [x1, y0], text: `s = ${n(s)}`, offset: below }, { from: [x0, y0], to: [x0, y1], text: `s = ${n(s)}`, offset: left });
      break;
    case "rectangle":
      inputs.push(dim("width", "w"), dim("height", "h"));
      steps.push({ label: t("rows.aspectRatio"), formula: `w ÷ h = ${n(w)} ÷ ${n(h)}`, value: f(w / h, 3) });
      areaFormula = `w × h = ${n(w)} × ${n(h)}`;
      dims.push({ from: [x0, y0], to: [x1, y0], text: `w = ${n(w)}`, offset: below }, { from: [x0, y0], to: [x0, y1], text: `h = ${n(h)}`, offset: left });
      break;
    case "triangle": {
      inputs.push(dim("base", "b"), dim("height", "h"));
      steps.push({ label: t("rows.enclosingRect"), formula: `b × h = ${n(b)} × ${n(h)}`, value: f(b * h), unit: uA });
      areaFormula = `½ × b × h = ½ × ${n(b)} × ${n(h)}`;
      const apex = outline[2];
      dims.push({ from: [x0, y0], to: [x1, y0], text: `b = ${n(b)}`, offset: below }, { from: [apex[0], y0], to: apex, text: `h = ${n(h)}`, offset: [0.35, 0] });
      break;
    }
    case "parallelogram": {
      inputs.push(dim("base", "b"), dim("height", "h"));
      steps.push({ label: t("rows.rearrangedRect"), formula: `b × h`, value: f(b * h), unit: uA });
      areaFormula = `b × h = ${n(b)} × ${n(h)}`;
      const tl = outline[3];
      dims.push({ from: outline[0], to: outline[1], text: `b = ${n(b)}`, offset: below }, { from: [tl[0], y0], to: tl, text: `h = ${n(h)}`, offset: [0.35, 0] });
      break;
    }
    case "trapezoid":
      inputs.push(dim("base1", "a"), dim("base2", "b"), dim("height", "h"));
      steps.push(
        { label: t("rows.sumOfBases"), formula: `a + b = ${n(b1)} + ${n(b2)}`, value: f(b1 + b2), unit: uL },
        { label: t("rows.midsegment"), formula: `(a + b) ÷ 2`, value: f(m.midsegment as number), unit: uL }
      );
      areaFormula = `½(a + b)h = ½ × ${n(b1 + b2)} × ${n(h)}`;
      dims.push(
        { from: outline[0], to: outline[1], text: `a = ${n(b1)}`, offset: below },
        { from: outline[3], to: outline[2], text: `b = ${n(b2)}`, offset: [0, 0.3] },
        { from: [0, y0], to: [0, y1], text: `h = ${n(h)}`, offset: [0.35, 0] }
      );
      break;
    case "circle":
      inputs.push(dim("radius", "r"));
      steps.push(
        { label: t("rows.radiusSquared"), formula: `r² = ${n(r)}²`, value: f(r * r), unit: uA },
        { label: t("rows.diameter"), formula: `2r`, value: f(m.diameter as number), unit: uL }
      );
      areaFormula = `πr² = π × ${n(r)}²`;
      dims.push({ from: [0, 0], to: [r, 0], text: `r = ${n(r)}`, offset: [0, 0.3] });
      break;
    case "ellipse":
      inputs.push(dim("semiMajorAxis", "a"), dim("semiMinorAxis", "b"));
      steps.push(
        { label: t("rows.axesProduct"), formula: `a × b = ${n(sa)} × ${n(sb)}`, value: f(sa * sb), unit: uA },
        { label: t("rows.eccentricity"), formula: `√(1 − b²/a²)`, value: f(m.eccentricity as number, 4) }
      );
      areaFormula = `πab = π × ${n(sa)} × ${n(sb)}`;
      dims.push({ from: [0, 0], to: [sa, 0], text: `a = ${n(sa)}`, offset: [0, -0.3] }, { from: [0, 0], to: [0, sb], text: `b = ${n(sb)}`, offset: [-0.4, 0] });
      break;
    case "sector": {
      inputs.push(dim("radius", "r"), dim("angleDegrees", "θ"));
      steps.push(
        { label: t("rows.fraction"), formula: `θ ÷ 360 = ${n(deg)} ÷ 360`, value: f(deg / 360, 4) },
        { label: t("rows.fullCircle"), formula: `πr² = π × ${n(r)}²`, value: f(Math.PI * r * r), unit: uA },
        { label: t("rows.arcLength"), formula: `πrθ ÷ 180`, value: f(m.arcLength as number), unit: uL },
        { label: t("rows.chord"), formula: `2r·sin(θ/2)`, value: f(m.chord as number), unit: uL }
      );
      areaFormula = `θ/360 × πr² = ${n(deg / 360)} × ${n(Math.PI * r * r)}`;
      const c: Pt = deg >= 360 ? [0, 0] : outline[0];
      const edge: Pt = deg >= 360 ? [r, 0] : outline[1];
      dims.push({ from: c, to: edge, text: `r = ${n(r)}`, offset: [0, -0.3] });
      const mid = ((deg / 2) * Math.PI) / 180;
      marks.push({ at: [c[0] + r * 0.35 * Math.cos(mid), c[1] + r * 0.35 * Math.sin(mid)], text: `θ = ${n(deg)}°` });
      break;
    }
  }

  const results: LiveTableRow[] = [{ label: t("rows.area"), formula: areaFormula, value: f(A), unit: uA, emphasize: true }];
  if (m.perimeter !== null) {
    results.push({ label: t(d.shape === "ellipse" ? "rows.perimeterApprox" : "rows.perimeter"), formula: d.shape === "ellipse" ? "Ramanujan" : "P", value: f(m.perimeter), unit: uL });
  }
  if (m.diagonal !== null) results.push({ label: t("rows.diagonal"), formula: d.shape === "square" ? "s√2" : "√(w² + h²)", value: f(m.diagonal), unit: uL });

  const estimate = (cells.full + cells.partial / 2) * step * step;
  const related: LiveTableRow[] = [
    { label: t("rows.boundingBox"), formula: `${n(m.boundingWidth)} × ${n(m.boundingHeight)}`, value: f(m.boundingArea), unit: uA },
    { label: t("rows.fillRatio"), formula: `A ÷ box`, value: f(m.fillRatio * 100, 2), unit: "%" },
    { label: t("rows.equivalentSquare"), formula: `√A = √${n(A)}`, value: f(m.equivalentSquareSide), unit: uL },
    { label: t("rows.equivalentCircle"), formula: `√(A ÷ π)`, value: f(m.equivalentCircleRadius), unit: uL },
  ];
  if (m.compactness !== null) related.push({ label: t("rows.compactness"), formula: `4πA ÷ P²`, value: f(m.compactness, 3) });
  related.push({ label: t("rows.doubled"), formula: `2² × A = 4 × ${n(A)}`, value: f(4 * A), unit: uA });

  const groups: LiveTableGroup[] = [
    { title: t("groups.inputs"), rows: inputs },
    { title: t("groups.steps"), rows: steps },
    { title: t("groups.results"), rows: results },
    {
      title: t("groups.grid"),
      rows: [
        { label: t("rows.gridStep"), formula: `${n(step)} × ${n(step)}`, value: f(step * step), unit: uA },
        { label: t("rows.gridFull"), formula: "■", value: f(cells.full, 0) },
        { label: t("rows.gridPartial"), formula: "◩", value: f(cells.partial, 0) },
        { label: t("rows.gridEstimate"), formula: `(${cells.full} + ${cells.partial}/2) × ${n(step * step)}`, value: f(estimate, 2), unit: uA },
      ],
    },
    { title: t("groups.related"), rows: related },
    {
      title: t("groups.conversions"),
      rows: [
        { label: t("rows.sqFeetFromM"), formula: `A × ${AREA_FACTORS.m2ToSquareFeet}`, value: f(A * AREA_FACTORS.m2ToSquareFeet, 2), unit: "ft²" },
        { label: t("rows.hectaresFromM"), formula: `A × ${AREA_FACTORS.m2ToHectares}`, value: f(A * AREA_FACTORS.m2ToHectares, 6), unit: "ha" },
        { label: t("rows.acresFromM"), formula: `A × ${AREA_FACTORS.m2ToAcres}`, value: f(A * AREA_FACTORS.m2ToAcres, 6), unit: "ac" },
        { label: t("rows.sqMFromFt"), formula: `A × ${AREA_FACTORS.ft2ToSquareMeters}`, value: f(A * AREA_FACTORS.ft2ToSquareMeters), unit: "m²" },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={[0, 6.2, 5.2]}>
          <AreaScene3D outline={outline} grid={grid} dims={dims} marks={marks} areaLabel={`A = ${n(A)}`} />
        </Scene3D>
      }
    />
  );
}

/** Education copy: follows the live inputs, holding the last valid shape while a field is mid-edit. */
export function AreaLive3DLive() {
  const { dims } = useAreaLive();
  const [lastValid, setLastValid] = useState(dims);
  const valid = planeMetrics(parseAreaDraft(dims)) !== null;
  if (valid && dims !== lastValid) setLastValid(dims);
  return <AreaLive3D draft={valid ? dims : lastValid} />;
}
