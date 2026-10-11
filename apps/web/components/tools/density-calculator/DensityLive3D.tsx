"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { DENSITY_WATER, LB_FT3_PER_G_CM3, niceCeil, STANDARD_GRAVITY } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useDensityModel } from "./DensityLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const DensityScene3D = dynamic(() => import("./DensityScene3D"), { ssr: false, loading: () => null });

const ORBIT = { minAzimuth: -0.75, maxAzimuth: 0.75, minPolar: 0.6, maxPolar: 1.62 };

/**
 * Deep live table (the relation → SI units → the cube of this volume → in water → six real fluids →
 * same mass in other volumes) beside a 3D water tank holding a true-scale cube of the material,
 * floating at its real waterline or resting on the floor. Reads the shared live inputs.
 */
export default function DensityLive3D({ camera = [0, 1.6, 8.4], capHeight = false }: { camera?: [number, number, number]; capHeight?: boolean }) {
  const t = useTranslations("tools.density-calculator.live3d");
  const tFluids = useTranslations("tools.density-calculator.live3d.fluids");
  const tc = useTranslations("common.live3d");
  const { draft, a, f } = useDensityModel();
  if (!a) return null;

  const solved = draft.operation;
  const pct = (x: number) => `${f(x * 100, 1)} %`;
  const verdict = (floats: boolean) => (floats ? t("floats") : t("sinks"));

  const groups: LiveTableGroup[] = [
    {
      title: t("groupRelation"),
      rows: [
        { label: t("density"), formula: solved === "solveDensity" ? `ρ = m / V = ${f(a.mass)} / ${f(a.volume)}` : t("given"), value: f(a.density), unit: "g/cm³", emphasize: solved === "solveDensity" },
        { label: t("mass"), formula: solved === "solveMass" ? `m = ρ × V = ${f(a.density)} × ${f(a.volume)}` : t("given"), value: f(a.mass), unit: "g", emphasize: solved === "solveMass" },
        { label: t("volume"), formula: solved === "solveVolume" ? `V = m / ρ = ${f(a.mass)} / ${f(a.density)}` : t("given"), value: f(a.volume), unit: "cm³", emphasize: solved === "solveVolume" },
      ],
    },
    {
      title: t("groupSI"),
      rows: [
        { label: t("density"), formula: `${f(a.density)} × 1000`, value: f(a.densitySI), unit: "kg/m³", emphasize: true },
        { label: t("mass"), formula: `${f(a.mass)} / 1000`, value: f(a.massKg), unit: "kg" },
        { label: t("volume"), formula: `${f(a.volume)} × 10⁻⁶`, value: f(a.volumeM3), unit: "m³" },
        { label: t("litres"), formula: `${f(a.volume)} / 1000`, value: f(a.volumeL), unit: "L" },
        { label: t("poundsPerFoot"), formula: `${f(a.density)} × ${LB_FT3_PER_G_CM3.toFixed(3)}`, value: f(a.lbPerFt3), unit: "lb/ft³" },
        { label: t("specificGravity"), formula: `${f(a.density)} / ${DENSITY_WATER.toFixed(1)}`, value: f(a.specificGravity) },
      ],
    },
    {
      title: t("groupShape"),
      rows: [
        { label: t("cubeEdge"), formula: `∛V = ∛${f(a.volume)}`, value: f(a.cubeEdge), unit: "cm" },
        { label: t("cubeFace"), formula: `a² = ${f(a.cubeEdge, 3)}²`, value: f(a.cubeEdge ** 2), unit: "cm²" },
        { label: t("sphereDiameter"), formula: `∛(6V / π)`, value: f(a.sphereDiameter), unit: "cm" },
        { label: t("massPerLitre"), formula: `ρ × 1 L`, value: f(a.kgPerL), unit: "kg" },
      ],
    },
    {
      title: t("groupWater"),
      rows: [
        { label: t("weight"), formula: `W = m g₀ = ${f(a.massKg)} × ${STANDARD_GRAVITY}`, value: f(a.weight), unit: "N" },
        { label: t("displacedWater"), formula: `ρ_w V = 1 × ${f(a.volume)}`, value: f(a.displacedWaterMass), unit: "g" },
        { label: t("buoyancyFull"), formula: `ρ_w V g₀`, value: f(((DENSITY_WATER * a.volume) / 1000) * STANDARD_GRAVITY), unit: "N" },
        { label: t("verdict"), formula: `ρ ${a.water.floats ? "<" : "≥"} ρ_w`, value: verdict(a.water.floats), emphasize: true },
        { label: t("submerged"), formula: a.water.floats ? `ρ / ρ_w = ${f(a.density)} / 1` : "100 %", value: pct(a.water.submergedFraction) },
        { label: t("waterline"), formula: `${f(a.water.submergedFraction, 3)} × ${f(a.cubeEdge, 3)}`, value: f(a.waterlineDepth), unit: "cm" },
        { label: t("buoyancyRest"), formula: a.water.floats ? `F_b = W` : `ρ_w V g₀`, value: f(a.water.buoyantForce), unit: "N" },
        { label: t("apparentWeight"), formula: `W − F_b`, value: f(a.water.apparentWeight), unit: "N" },
      ],
    },
    {
      title: t("groupFluids"),
      rows: a.fluids.map((fl) => ({
        label: tFluids(fl.key),
        formula: `ρ_f = ${f(fl.density)} · ${pct(fl.submergedFraction)}`,
        value: verdict(fl.floats),
      })),
    },
    {
      title: t("groupSensitivity"),
      rows: a.volumeSensitivity
        .filter((s) => s.factor !== 1)
        .map((s) => ({ label: t("densityAtVolume", { k: f(s.factor) }), formula: `${f(a.mass)} / ${f(s.volume)}`, value: f(s.density), unit: "g/cm³" })),
    },
  ];

  const tankWidth = niceCeil(3 * a.cubeEdge);
  const data = {
    edge: a.cubeEdge,
    tankWidth,
    submerged: a.water.submergedFraction,
    floats: a.water.floats,
    weight: a.weight,
    buoyancy: a.water.buoyantForce,
    labels: {
      edge: `a = ${f(a.cubeEdge, 3)} cm`,
      density: `ρ = ${f(a.density)} g/cm³`,
      mass: `m = ${f(a.mass)} g`,
      tank: t("tankWidth", { w: f(tankWidth) }),
      waterline: a.water.floats ? t("underWater", { p: pct(a.water.submergedFraction) }) : t("onFloor"),
      weight: `W = ${f(a.weight, 3)} N`,
      buoyancy: `F_b = ${f(a.water.buoyantForce, 3)} N`,
      water: t("waterLabel"),
    },
  };

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      capHeight={capHeight}
      drawing={
        <Scene3D camera={camera} orbit={ORBIT}>
          <DensityScene3D data={data} />
        </Scene3D>
      }
    />
  );
}
