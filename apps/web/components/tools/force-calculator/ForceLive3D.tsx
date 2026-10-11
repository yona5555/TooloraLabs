"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { FORCE_G, STANDARD_GRAVITY } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useForceModel } from "./ForceLiveContext";
import type { ForceScene3DProps } from "./ForceScene3D";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const ForceScene3D = dynamic(() => import("./ForceScene3D"), { ssr: false, loading: () => null });

const ORBIT = { minAzimuth: -0.7, maxAzimuth: 0.7, minPolar: 0.65, maxPolar: 1.62 };

/**
 * Deep live table (inputs → unit conversions → weight comparison → motion from rest, or masses →
 * fields → energy and orbit → barycentre → inverse square) beside a 3D drawing of the active law:
 * a block pushed along a track with its 1-second strobe positions, or two attracting spheres over
 * their gravitational potential well. Reads the shared live inputs, so the Result card and the
 * encyclopedia copy follow every keystroke and every slider.
 */
export default function ForceLive3D({ camera = [0, 2.4, 8.6], capHeight = false }: { camera?: [number, number, number]; capHeight?: boolean }) {
  const t = useTranslations("tools.force-calculator.live3d");
  const tr = useTranslations("tools.force-calculator.result");
  const tc = useTranslations("common.live3d");
  const { draft, result, sl, gr, f } = useForceModel();

  if (result.error) return null;

  let groups: LiveTableGroup[];
  let data: ForceScene3DProps["data"];

  if (draft.mode === "secondLaw" && sl) {
    const s1 = sl.snapshots[1];
    const s4 = sl.snapshots[4];
    const solved = draft.slSolve;
    groups = [
      {
        title: t("groupLaw"),
        rows: [
          { label: tr("force"), formula: solved === "force" ? `F = m × a = ${f(sl.mass)} × ${f(sl.acceleration)}` : t("given"), value: f(sl.force), unit: "N", emphasize: solved === "force" },
          { label: tr("mass"), formula: solved === "mass" ? `m = F / a = ${f(sl.force)} / ${f(sl.acceleration)}` : t("given"), value: f(sl.mass), unit: "kg", emphasize: solved === "mass" },
          { label: tr("acceleration"), formula: solved === "acceleration" ? `a = F / m = ${f(sl.force)} / ${f(sl.mass)}` : t("given"), value: f(sl.acceleration), unit: "m/s²", emphasize: solved === "acceleration" },
        ],
      },
      {
        title: t("groupUnits"),
        rows: [
          { label: t("kilonewtons"), formula: `${f(sl.force)} / 1000`, value: f(sl.kN), unit: "kN" },
          { label: t("poundsForce"), formula: `${f(sl.force)} / 4.4482`, value: f(sl.lbf), unit: "lbf" },
          { label: t("kilogramForce"), formula: `${f(sl.force)} / ${STANDARD_GRAVITY}`, value: f(sl.kgf), unit: "kgf" },
          { label: t("dynes"), formula: `${f(sl.force)} × 10⁵`, value: f(sl.dyn), unit: "dyn" },
        ],
      },
      {
        title: t("groupWeight"),
        rows: [
          { label: t("ownWeight"), formula: `m × g₀ = ${f(sl.mass)} × ${STANDARD_GRAVITY}`, value: f(sl.ownWeight), unit: "N" },
          { label: t("thrustToWeight"), formula: `F / (m g₀) = ${f(sl.force)} / ${f(sl.ownWeight)}`, value: f(sl.thrustToWeight, 3) },
          { label: t("gForce"), formula: `a / g₀ = ${f(sl.acceleration)} / ${STANDARD_GRAVITY}`, value: f(sl.gForce, 3), unit: "g" },
          { label: t("weightEquivalent"), formula: `F / g₀ = ${f(sl.force)} / ${STANDARD_GRAVITY}`, value: f(sl.weightEquivalentKg, 3), unit: "kg" },
        ],
      },
      {
        title: t("groupMotion"),
        rows: [
          { label: t("speedAt", { t: 1 }), formula: `v = a t = ${f(sl.acceleration)} × 1`, value: f(s1.v), unit: "m/s" },
          { label: t("distanceAt", { t: 1 }), formula: `x = ½ a t² = ½ × ${f(sl.acceleration)} × 1²`, value: f(s1.x), unit: "m" },
          { label: t("speedAt", { t: 4 }), formula: `v = ${f(sl.acceleration)} × 4`, value: f(s4.v), unit: "m/s" },
          { label: t("distanceAt", { t: 4 }), formula: `x = ½ × ${f(sl.acceleration)} × 4²`, value: f(s4.x), unit: "m" },
          { label: t("impulse"), formula: `p = F t = ${f(sl.force)} × 4`, value: f(s4.p), unit: "kg·m/s" },
          { label: t("kineticEnergy"), formula: `½ m v² = ½ × ${f(sl.mass)} × ${f(s4.v)}²`, value: f(s4.ke), unit: "J", emphasize: true },
          { label: t("work"), formula: `W = F x = ${f(sl.force)} × ${f(s4.x)}`, value: f(sl.force * s4.x), unit: "J" },
          { label: t("power"), formula: `P = F v = ${f(sl.force)} × ${f(s4.v)}`, value: f(s4.power), unit: "W" },
          { label: t("timeTo100"), formula: `27.78 / ${f(Math.abs(sl.acceleration))}`, value: f(sl.timeTo100kmh, 3), unit: "s" },
          { label: t("distanceTo100"), formula: `27.78² / (2 × ${f(Math.abs(sl.acceleration))})`, value: f(sl.distanceTo100kmh, 3), unit: "m" },
        ],
      },
      {
        title: t("groupSensitivity"),
        rows: sl.massSensitivity
          .filter((m) => m.factor !== 1)
          .map((m) => ({
            label: t("aWithMass", { k: f(m.factor) }),
            formula: `${f(sl.force)} / ${f(m.mass)}`,
            value: f(m.acceleration),
            unit: "m/s²",
          })),
      },
    ];
    data = {
      kind: "secondLaw",
      mass: sl.mass,
      force: sl.force,
      acceleration: sl.acceleration,
      x: sl.snapshots.map((s) => s.x),
      labels: {
        force: `F = ${f(sl.force)} N`,
        acceleration: `a = ${f(sl.acceleration)} m/s²`,
        mass: `${f(sl.mass)} kg`,
        times: sl.snapshots.map((s) => (s.t === 0 ? "0 s" : `${s.t} s · ${f(s.x, 2)} m`)),
        speeds: sl.snapshots.map((s) => `v = ${f(s.v, 2)} m/s`),
      },
    };
  } else if (gr) {
    const solved = draft.gSolve;
    const days = gr.orbitalPeriod / 86400;
    groups = [
      {
        title: t("groupLaw"),
        rows: [
          { label: tr("mass1"), formula: solved === "mass1" ? `F r² / (G m₂)` : t("given"), value: f(gr.mass1), unit: "kg", emphasize: solved === "mass1" },
          { label: tr("mass2"), formula: solved === "mass2" ? `F r² / (G m₁)` : t("given"), value: f(gr.mass2), unit: "kg", emphasize: solved === "mass2" },
          { label: tr("distance"), formula: solved === "distance" ? `√(G m₁ m₂ / F)` : t("given"), value: f(gr.distance), unit: "m", emphasize: solved === "distance" },
          { label: `${t("constant")} G`, formula: "N·m²/kg²", value: f(FORCE_G) },
          {
            label: tr("force"),
            formula: solved === "force" ? `G m₁ m₂ / r²` : t("given"),
            value: f(gr.force),
            unit: "N",
            emphasize: solved === "force",
          },
        ],
      },
      {
        title: t("groupFields"),
        rows: [
          { label: t("field1"), formula: `G m₁ / r²`, value: f(gr.field1), unit: "m/s²" },
          { label: t("field2"), formula: `G m₂ / r²`, value: f(gr.field2), unit: "m/s²" },
          { label: t("accel1"), formula: `F / m₁`, value: f(gr.accel1), unit: "m/s²" },
          { label: t("accel2"), formula: `F / m₂`, value: f(gr.accel2), unit: "m/s²" },
          { label: t("weightEquivalent"), formula: `F / g₀`, value: f(gr.weightEquivalentKg), unit: "kg" },
        ],
      },
      {
        title: t("groupOrbit"),
        rows: [
          { label: t("potentialEnergy"), formula: `U = −G m₁ m₂ / r`, value: f(gr.potentialEnergy), unit: "J" },
          { label: t("escapeSpeed"), formula: `√(2 G m₁ / r)`, value: f(gr.escapeSpeed), unit: "m/s" },
          { label: t("orbitalSpeed"), formula: `√(G (m₁ + m₂) / r)`, value: f(gr.orbitalSpeed), unit: "m/s", emphasize: true },
          { label: t("orbitalPeriod"), formula: `2π √(r³ / (G (m₁ + m₂)))`, value: `${f(gr.orbitalPeriod)} s`, unit: `≈ ${f(days, 2)} d` },
        ],
      },
      {
        title: t("groupBarycenter"),
        rows: [
          { label: t("baryFrom1"), formula: `r m₂ / (m₁ + m₂)`, value: f(gr.barycenterFrom1), unit: "m" },
          { label: t("baryFrom2"), formula: `r m₁ / (m₁ + m₂)`, value: f(gr.barycenterFrom2), unit: "m" },
        ],
      },
      {
        title: t("groupInverseSquare"),
        rows: gr.atMultiples
          .filter((m) => m.k !== 1)
          .map((m) => ({ label: t("forceAt", { k: f(m.k) }), formula: `F / ${f(m.k * m.k)}`, value: f(m.force), unit: "N" })),
      },
    ];
    data = {
      kind: "gravitation",
      mass1: gr.mass1,
      mass2: gr.mass2,
      labels: {
        mass1: `m₁ = ${f(gr.mass1)} kg`,
        mass2: `m₂ = ${f(gr.mass2)} kg`,
        force: `F = ${f(gr.force)} N`,
        distance: `r = ${f(gr.distance)} m`,
      },
    };
  } else {
    return null;
  }

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      capHeight={capHeight}
      drawing={
        <Scene3D camera={camera} orbit={ORBIT}>
          <ForceScene3D data={data} />
        </Scene3D>
      }
    />
  );
}
