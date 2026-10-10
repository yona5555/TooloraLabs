"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { solidMetrics, AREA_FACTORS, type SolidDims, type SolidFaceKey } from "@tooloralabs/tools";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { Solid3DDraft } from "./types";
import { useSurfaceAreaLive } from "./SurfaceAreaLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const SolidScene3D = dynamic(() => import("@/components/tool-ui/three/SolidScene3D"), { ssr: false });

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

function parseSolidDraft(d: Solid3DDraft): SolidDims {
  return {
    shape: d.shape,
    side: toNum(d.side),
    length: toNum(d.length),
    width: toNum(d.width),
    height: toNum(d.height),
    radius: toNum(d.radius),
    baseSide: toNum(d.baseSide),
  };
}

/** Deep live table + rotatable 3D solid with every face colored and labeled with its area. */
export default function SurfaceAreaLive3D({ draft }: { draft: Solid3DDraft }) {
  const t = useTranslations("tools.surface-area-calculator.live3d");
  const tc = useTranslations("common.live3d");
  const ds = resolveDigitStyle();
  const f = (v: number, max = 4) => formatLocalizedNumber(v, ds, { maximumFractionDigits: max });
  const n = (v: number) => formatLocalizedNumber(v, "western", { maximumFractionDigits: 3 });

  const d = parseSolidDraft(draft);
  const m = solidMetrics(d);
  if (!m) return null;

  const uL = t("units.len");
  const uA = t("units.area");
  const uV = t("units.vol");
  const A = m.surfaceArea;
  const dim = (key: "side" | "length" | "width" | "height" | "radius" | "baseSide", sym: string): LiveTableRow => ({
    label: t(`rows.${key}`),
    formula: sym,
    value: f(d[key] as number),
    unit: uL,
  });
  const { side: s = 0, length: l = 0, width: w = 0, height: h = 0, radius: r = 0, baseSide: a = 0 } = d;
  const sl = m.slantHeight ?? 0;

  const faceFormula: Record<SolidFaceKey, string> = (() => {
    switch (d.shape) {
      case "cube": {
        const sq = `s² = ${n(s)}²`;
        return { top: sq, bottom: sq, front: sq, back: sq, left: sq, right: sq, lateral: "", base: "", surface: "" };
      }
      case "rectangular-prism": {
        const lw = `l × w = ${n(l)} × ${n(w)}`;
        const lh = `l × h = ${n(l)} × ${n(h)}`;
        const wh = `w × h = ${n(w)} × ${n(h)}`;
        return { top: lw, bottom: lw, front: lh, back: lh, left: wh, right: wh, lateral: "", base: "", surface: "" };
      }
      case "sphere":
        return { surface: `4πr² = 4π × ${n(r)}²`, top: "", bottom: "", front: "", back: "", left: "", right: "", lateral: "", base: "" };
      case "cylinder": {
        const cap = `πr² = π × ${n(r)}²`;
        return { top: cap, bottom: cap, lateral: `2πrh = 2π × ${n(r)} × ${n(h)}`, front: "", back: "", left: "", right: "", base: "", surface: "" };
      }
      case "cone":
        return { base: `πr² = π × ${n(r)}²`, lateral: `πrℓ = π × ${n(r)} × ${n(sl)}`, top: "", bottom: "", front: "", back: "", left: "", right: "", surface: "" };
      case "square-pyramid": {
        const tri = `½aℓ = ½ × ${n(a)} × ${n(sl)}`;
        return { base: `a² = ${n(a)}²`, front: tri, back: tri, left: tri, right: tri, top: "", bottom: "", lateral: "", surface: "" };
      }
    }
  })();

  const inputs: LiveTableRow[] = [];
  const steps: LiveTableRow[] = [];
  let totalFormula = "";
  let labels: { x?: string; y?: string; z?: string; r?: string; slant?: string } = {};

  switch (d.shape) {
    case "cube":
      inputs.push(dim("side", "s"));
      steps.push({ label: t("rows.faceDiagonal"), formula: `s√2`, value: f(m.faceDiagonal as number), unit: uL });
      totalFormula = `6s² = 6 × ${n(s)}²`;
      labels = { x: `s = ${n(s)}`, y: `s = ${n(s)}`, z: `s = ${n(s)}` };
      break;
    case "rectangular-prism":
      inputs.push(dim("length", "l"), dim("width", "w"), dim("height", "h"));
      steps.push({ label: t("rows.perimeterBase"), formula: `2(l + w) = 2(${n(l)} + ${n(w)})`, value: f(2 * (l + w)), unit: uL });
      totalFormula = `2(lw + lh + wh)`;
      labels = { x: `l = ${n(l)}`, y: `h = ${n(h)}`, z: `w = ${n(w)}` };
      break;
    case "sphere":
      inputs.push(dim("radius", "r"));
      steps.push(
        { label: t("rows.diameter"), formula: `2r`, value: f(m.diameter as number), unit: uL },
        { label: t("rows.greatCircle"), formula: `πr² = π × ${n(r)}²`, value: f(m.baseArea), unit: uA }
      );
      totalFormula = `4πr² = 4 × ${n(m.baseArea)}`;
      labels = { r: `r = ${n(r)}` };
      break;
    case "cylinder":
      inputs.push(dim("radius", "r"), dim("height", "h"));
      steps.push({ label: t("rows.circumference"), formula: `2πr = 2π × ${n(r)}`, value: f(m.circumference as number), unit: uL });
      totalFormula = `2πr(r + h) = 2π × ${n(r)} × ${n(r + h)}`;
      labels = { r: `r = ${n(r)}`, y: `h = ${n(h)}` };
      break;
    case "cone":
      inputs.push(dim("radius", "r"), dim("height", "h"));
      steps.push(
        { label: t("rows.circumference"), formula: `2πr = 2π × ${n(r)}`, value: f(m.circumference as number), unit: uL },
        { label: t("rows.slantHeight"), formula: `√(r² + h²) = √(${n(r)}² + ${n(h)}²)`, value: f(sl), unit: uL }
      );
      totalFormula = `πr(r + ℓ) = π × ${n(r)} × ${n(r + sl)}`;
      labels = { r: `r = ${n(r)}`, y: `h = ${n(h)}`, slant: `ℓ = ${n(sl)}` };
      break;
    case "square-pyramid":
      inputs.push(dim("baseSide", "a"), dim("height", "h"));
      steps.push(
        { label: t("rows.slantHeight"), formula: `√(h² + (a/2)²)`, value: f(sl), unit: uL },
        { label: t("rows.lateralEdge"), formula: `√(h² + a²/2)`, value: f(m.lateralEdge as number), unit: uL }
      );
      totalFormula = `a² + 2aℓ = ${n(a)}² + 2 × ${n(a)} × ${n(sl)}`;
      labels = { x: `a = ${n(a)}`, y: `h = ${n(h)}`, slant: `ℓ = ${n(sl)}` };
      break;
  }

  const largest = Math.max(...m.faces.map((x) => x.area));
  const sphereSameVolume = 4 * Math.PI * m.equivalentSphereRadius ** 2;
  const faceLabels = m.faces.map((x) => ({ key: x.key, label: `${t(`faces.${x.key}`)} ${n(x.area)}` }));

  const groups: LiveTableGroup[] = [
    { title: t("groups.inputs"), rows: inputs },
    { title: t("groups.steps"), rows: steps },
    { title: t("groups.faces"), rows: m.faces.map((x) => ({ label: t(`faces.${x.key}`), formula: faceFormula[x.key], value: f(x.area), unit: uA })) },
    {
      title: t("groups.results"),
      rows: [
        { label: t("rows.baseArea"), formula: d.shape === "sphere" ? "πr²" : "B", value: f(m.baseArea), unit: uA },
        { label: t("rows.lateralArea"), formula: "L", value: f(m.lateralArea), unit: uA },
        { label: t("rows.surfaceArea"), formula: totalFormula, value: f(A), unit: uA, emphasize: true },
        { label: t("rows.volume"), formula: "V", value: f(m.volume), unit: uV },
        { label: t("rows.surfaceToVolume"), formula: `A ÷ V = ${n(A)} ÷ ${n(m.volume)}`, value: f(m.surfaceToVolume), unit: `1/${uL}` },
      ],
    },
    {
      title: t("groups.related"),
      rows: [
        { label: t("rows.largestFace"), formula: `${n(largest)} ÷ ${n(A)}`, value: f((largest / A) * 100, 2), unit: "%" },
        { label: t("rows.sphereSameVolume"), formula: `4π(∛(3V ÷ 4π))²`, value: f(sphereSameVolume), unit: uA },
        { label: t("rows.sphericity"), formula: `π^⅓(6V)^⅔ ÷ A`, value: f(m.sphericity, 3) },
        { label: t("rows.doubled"), formula: `2² × A = 4 × ${n(A)}`, value: f(4 * A), unit: uA },
      ],
    },
    {
      title: t("groups.conversions"),
      rows: [
        { label: t("rows.sqFeetFromM"), formula: `A × ${AREA_FACTORS.m2ToSquareFeet}`, value: f(A * AREA_FACTORS.m2ToSquareFeet, 2), unit: "ft²" },
        { label: t("rows.sqCmFromM"), formula: `A × ${AREA_FACTORS.m2ToSquareCm}`, value: f(A * AREA_FACTORS.m2ToSquareCm, 0), unit: "cm²" },
        { label: t("rows.sqInchesFromM"), formula: `A × ${AREA_FACTORS.m2ToSquareInches}`, value: f(A * AREA_FACTORS.m2ToSquareInches, 0), unit: "in²" },
        { label: t("rows.sqMFromCm"), formula: `A ÷ 10000`, value: f(A / AREA_FACTORS.m2ToSquareCm), unit: "m²" },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={[5.5, 4.2, 6.5]}>
          <SolidScene3D shape={m.shape} extents={m.extents} labels={labels} faces={faceLabels} />
        </Scene3D>
      }
    />
  );
}

/** Education copy: follows the live inputs, holding the last valid solid while a field is mid-edit. */
export function SurfaceAreaLive3DLive() {
  const { dims } = useSurfaceAreaLive();
  const [lastValid, setLastValid] = useState(dims);
  const valid = solidMetrics(parseSolidDraft(dims)) !== null;
  if (valid && dims !== lastValid) setLastValid(dims);
  return <SurfaceAreaLive3D draft={valid ? dims : lastValid} />;
}
