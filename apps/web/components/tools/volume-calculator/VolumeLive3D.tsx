"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { solidMetrics, VOLUME_FACTORS, type SolidDims } from "@tooloralabs/tools";
import { formatLocalizedNumber, parseLocalizedNumber } from "@tooloralabs/core";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { resolveDigitStyle } from "@/lib/digit-style";
import type { Solid3DDraft } from "./types";
import { useVolumeLive } from "./VolumeLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const SolidScene3D = dynamic(() => import("@/components/tool-ui/three/SolidScene3D"), { ssr: false });

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export function parseSolidDraft(d: Solid3DDraft): SolidDims {
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

/** Deep live table + rotatable 3D solid for the given (valid) draft. */
export default function VolumeLive3D({ draft }: { draft: Solid3DDraft }) {
  const t = useTranslations("tools.volume-calculator.live3d");
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
  const V = m.volume;
  const dim = (key: "side" | "length" | "width" | "height" | "radius" | "baseSide", sym: string): LiveTableRow => ({
    label: t(`rows.${key}`),
    formula: sym,
    value: f(d[key] as number),
    unit: uL,
  });

  const inputs: LiveTableRow[] = [];
  const steps: LiveTableRow[] = [];
  let volumeFormula = "";
  let labels: { x?: string; y?: string; z?: string; r?: string; slant?: string } = {};

  switch (d.shape) {
    case "cube": {
      const s = d.side as number;
      inputs.push(dim("side", "s"));
      steps.push(
        { label: t("rows.baseArea"), formula: `s² = ${n(s)}²`, value: f(m.baseArea), unit: uA },
        { label: t("rows.faceDiagonal"), formula: `s√2 = ${n(s)} × 1.414`, value: f(m.faceDiagonal as number), unit: uL },
        { label: t("rows.spaceDiagonal"), formula: `s√3 = ${n(s)} × 1.732`, value: f(m.spaceDiagonal as number), unit: uL }
      );
      volumeFormula = `s³ = ${n(s)}³`;
      labels = { x: `s = ${n(s)}`, y: `s = ${n(s)}`, z: `s = ${n(s)}` };
      break;
    }
    case "rectangular-prism": {
      const { length: l, width: w, height: h } = d as Required<SolidDims>;
      inputs.push(dim("length", "l"), dim("width", "w"), dim("height", "h"));
      steps.push(
        { label: t("rows.baseArea"), formula: `l × w = ${n(l)} × ${n(w)}`, value: f(m.baseArea), unit: uA },
        { label: t("rows.baseDiagonal"), formula: `√(l² + w²)`, value: f(m.faceDiagonal as number), unit: uL },
        { label: t("rows.spaceDiagonal"), formula: `√(l² + w² + h²)`, value: f(m.spaceDiagonal as number), unit: uL }
      );
      volumeFormula = `l × w × h = ${n(l)} × ${n(w)} × ${n(h)}`;
      labels = { x: `l = ${n(l)}`, y: `h = ${n(h)}`, z: `w = ${n(w)}` };
      break;
    }
    case "sphere": {
      const r = d.radius as number;
      inputs.push(dim("radius", "r"));
      steps.push(
        { label: t("rows.diameter"), formula: `2r = 2 × ${n(r)}`, value: f(m.diameter as number), unit: uL },
        { label: t("rows.rCubed"), formula: `r³ = ${n(r)}³`, value: f(r ** 3), unit: uV },
        { label: t("rows.greatCircle"), formula: `πr² = π × ${n(r)}²`, value: f(m.baseArea), unit: uA },
        { label: t("rows.circumference"), formula: `2πr = 2π × ${n(r)}`, value: f(m.circumference as number), unit: uL }
      );
      volumeFormula = `4/3 πr³ = 4/3 × π × ${n(r)}³`;
      labels = { r: `r = ${n(r)}` };
      break;
    }
    case "cylinder":
    case "cone": {
      const { radius: r, height: h } = d as Required<SolidDims>;
      const cone = d.shape === "cone";
      inputs.push(dim("radius", "r"), dim("height", "h"));
      steps.push(
        { label: t("rows.baseArea"), formula: `πr² = π × ${n(r)}²`, value: f(m.baseArea), unit: uA },
        { label: t("rows.circumference"), formula: `2πr = 2π × ${n(r)}`, value: f(m.circumference as number), unit: uL }
      );
      if (cone) {
        steps.push(
          { label: t("rows.slantHeight"), formula: `√(r² + h²) = √(${n(r)}² + ${n(h)}²)`, value: f(m.slantHeight as number), unit: uL },
          { label: t("rows.lateralArea"), formula: `πrℓ = π × ${n(r)} × ${n(m.slantHeight as number)}`, value: f(m.lateralArea), unit: uA },
          { label: t("rows.cylinderSameBase"), formula: `πr²h = ${n(m.baseArea)} × ${n(h)}`, value: f(m.baseArea * h), unit: uV }
        );
        volumeFormula = `⅓πr²h = ⅓ × ${n(m.baseArea)} × ${n(h)}`;
        labels = { r: `r = ${n(r)}`, y: `h = ${n(h)}`, slant: `ℓ = ${n(m.slantHeight as number)}` };
      } else {
        steps.push({ label: t("rows.lateralArea"), formula: `2πrh = 2π × ${n(r)} × ${n(h)}`, value: f(m.lateralArea), unit: uA });
        volumeFormula = `πr²h = ${n(m.baseArea)} × ${n(h)}`;
        labels = { r: `r = ${n(r)}`, y: `h = ${n(h)}` };
      }
      break;
    }
    case "square-pyramid": {
      const { baseSide: a, height: h } = d as Required<SolidDims>;
      inputs.push(dim("baseSide", "a"), dim("height", "h"));
      steps.push(
        { label: t("rows.baseArea"), formula: `a² = ${n(a)}²`, value: f(m.baseArea), unit: uA },
        { label: t("rows.slantHeight"), formula: `√(h² + (a/2)²)`, value: f(m.slantHeight as number), unit: uL },
        { label: t("rows.lateralEdge"), formula: `√(h² + a²/2)`, value: f(m.lateralEdge as number), unit: uL },
        { label: t("rows.prismSameBase"), formula: `a²h = ${n(m.baseArea)} × ${n(h)}`, value: f(m.baseArea * h), unit: uV }
      );
      volumeFormula = `⅓a²h = ⅓ × ${n(m.baseArea)} × ${n(h)}`;
      labels = { x: `a = ${n(a)}`, y: `h = ${n(h)}`, slant: `ℓ = ${n(m.slantHeight as number)}` };
      break;
    }
  }

  const groups: LiveTableGroup[] = [
    { title: t("groups.inputs"), rows: inputs },
    { title: t("groups.steps"), rows: steps },
    {
      title: t("groups.results"),
      rows: [
        { label: t("rows.volume"), formula: volumeFormula, value: f(V), unit: uV, emphasize: true },
        { label: t("rows.surfaceArea"), formula: "A", value: f(m.surfaceArea), unit: uA },
        { label: t("rows.surfaceToVolume"), formula: `A ÷ V = ${n(m.surfaceArea)} ÷ ${n(V)}`, value: f(m.surfaceToVolume), unit: `1/${uL}` },
      ],
    },
    {
      title: t("groups.related"),
      rows: [
        { label: t("rows.boundingBox"), formula: `${n(m.extents.x)} × ${n(m.extents.z)} × ${n(m.extents.y)}`, value: f(m.boundingBoxVolume), unit: uV },
        { label: t("rows.fillRatio"), formula: `V ÷ box`, value: f(m.fillRatio * 100, 2), unit: "%" },
        { label: t("rows.equivalentCube"), formula: `∛V = ∛${n(V)}`, value: f(m.equivalentCubeSide), unit: uL },
        { label: t("rows.equivalentSphere"), formula: `∛(3V ÷ 4π)`, value: f(m.equivalentSphereRadius), unit: uL },
        { label: t("rows.sphericity"), formula: `π^⅓(6V)^⅔ ÷ A`, value: f(m.sphericity, 3) },
        { label: t("rows.doubled"), formula: `2³ × V = 8 × ${n(V)}`, value: f(8 * V), unit: uV },
      ],
    },
    {
      title: t("groups.conversions"),
      rows: [
        { label: t("rows.litersFromM"), formula: `V × ${VOLUME_FACTORS.m3ToLiters}`, value: f(V * VOLUME_FACTORS.m3ToLiters, 2), unit: "L" },
        { label: t("rows.gallonsFromM"), formula: `V × ${VOLUME_FACTORS.m3ToUsGallons}`, value: f(V * VOLUME_FACTORS.m3ToUsGallons, 2), unit: "gal" },
        { label: t("rows.cubicFeetFromM"), formula: `V × ${VOLUME_FACTORS.m3ToCubicFeet}`, value: f(V * VOLUME_FACTORS.m3ToCubicFeet, 2), unit: "ft³" },
        { label: t("rows.mlFromCm"), formula: `1 cm³ = 1 mL`, value: f(V * VOLUME_FACTORS.cm3ToMilliliters, 2), unit: "mL" },
        { label: t("rows.litersFromCm"), formula: `V ÷ 1000`, value: f(V / 1000), unit: "L" },
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
          <SolidScene3D shape={m.shape} extents={m.extents} labels={labels} />
        </Scene3D>
      }
    />
  );
}

/** Education copy: follows the live inputs, holding the last valid solid while a field is mid-edit. */
export function VolumeLive3DLive() {
  const { dims } = useVolumeLive();
  const [lastValid, setLastValid] = useState(dims);
  const valid = solidMetrics(parseSolidDraft(dims)) !== null;
  if (valid && dims !== lastValid) setLastValid(dims);
  return <VolumeLive3D draft={valid ? dims : lastValid} />;
}
