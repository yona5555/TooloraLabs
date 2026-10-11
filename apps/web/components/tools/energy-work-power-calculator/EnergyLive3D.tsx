"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { BULB_WATTS, ENERGY_GRAVITY, energyEquivalents, energyUnits, fallStage } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useEnergyModel } from "./EnergyLiveContext";
import type { EnergyScene3DProps } from "./EnergyScene3D";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const EnergyScene3D = dynamic(() => import("./EnergyScene3D"), { ssr: false, loading: () => null });

const ORBIT = { minAzimuth: -0.7, maxAzimuth: 0.7, minPolar: 0.65, maxPolar: 1.62 };

/**
 * Deep live table (inputs → the formula → the same energy in other units → everyday terms →
 * sensitivity) beside a 3D drawing of the active formula: a block dragged along its displacement by
 * an angled force, a moving cart, a ball dropping from its height, or the work stacked second by
 * second. Reads the shared live inputs, so the Result card and the encyclopedia copy follow every
 * keystroke and every slider.
 */
export default function EnergyLive3D({ camera = [0, 2.2, 8.6], capHeight = false }: { camera?: [number, number, number]; capHeight?: boolean }) {
  const t = useTranslations("tools.energy-work-power-calculator.live3d");
  const tc = useTranslations("common.live3d");
  const { draft, result, work, kinetic, potential, power, f } = useEnergyModel();

  if (result.error) return null;

  const unitsGroup = (joules: number): LiveTableGroup => {
    const u = energyUnits(joules);
    return {
      title: t("groupUnits"),
      rows: [
        { label: t("kilojoules"), formula: `${f(joules)} / 1000`, value: f(u.kJ), unit: "kJ" },
        { label: t("kilocalories"), formula: `${f(joules)} / 4184`, value: f(u.kcal), unit: "kcal" },
        { label: t("wattHours"), formula: `${f(joules)} / 3600`, value: f(u.wh), unit: "Wh" },
        { label: t("kilowattHours"), formula: `${f(joules)} / 3.6 × 10⁶`, value: f(u.kwh), unit: "kWh" },
        { label: t("electronvolts"), formula: `${f(joules)} / 1.602 × 10⁻¹⁹`, value: f(u.ev), unit: "eV" },
        { label: t("footPounds"), formula: `${f(joules)} / 1.3558`, value: f(u.ftlbf), unit: "ft·lbf" },
      ],
    };
  };
  const everydayGroup = (joules: number): LiveTableGroup => {
    const e = energyEquivalents(joules);
    return {
      title: t("groupEveryday"),
      rows: [
        { label: t("bulbSeconds"), formula: `${f(joules)} / ${BULB_WATTS}`, value: f(e.bulbSeconds), unit: "s" },
        { label: t("liftOneKg"), formula: `${f(joules)} / (1 × ${ENERGY_GRAVITY})`, value: f(e.liftOneKgMetres), unit: "m" },
        { label: t("appleLifts"), formula: `${f(joules)} / 0.98`, value: f(e.appleLifts, 1) },
      ],
    };
  };

  let groups: LiveTableGroup[];
  let data: EnergyScene3DProps["data"];

  switch (draft.mode) {
    case "work": {
      const w = work;
      groups = [
        {
          title: t("groupInputs"),
          rows: [
            { label: "F", formula: t("given"), value: f(w.force), unit: "N" },
            { label: "d", formula: t("given"), value: f(w.distance), unit: "m" },
            { label: "θ", formula: t("given"), value: f(w.angleDegrees), unit: "°" },
          ],
        },
        {
          title: t("groupWork"),
          rows: [
            { label: t("parallel"), formula: `F cos θ = ${f(w.force)} × ${f(w.share, 4)}`, value: f(w.parallel), unit: "N" },
            { label: t("perpendicular"), formula: `F sin θ`, value: f(w.perpendicular), unit: "N" },
            { label: t("alignedWork"), formula: `F d = ${f(w.force)} × ${f(w.distance)}`, value: f(w.alignedWork), unit: "J" },
            { label: t("share"), formula: `cos ${f(w.angleDegrees)}°`, value: `${f(w.share * 100, 2)}`, unit: "%" },
            { label: t("work"), formula: `F d cos θ = ${f(w.parallel)} × ${f(w.distance)}`, value: f(w.work), unit: "J", emphasize: true },
          ],
        },
        unitsGroup(w.work),
        everydayGroup(w.work),
        {
          title: t("groupAngles"),
          rows: w.atAngles.map((a) => ({ label: t("workAt", { angle: a.angle }), formula: `${f(w.alignedWork)} × cos ${a.angle}°`, value: f(a.work), unit: "J" })),
        },
      ];
      data = {
        kind: "work",
        angle: w.angleDegrees,
        force: w.force,
        labels: {
          force: `F = ${f(w.force)} N`,
          parallel: `F cos θ = ${f(w.parallel)} N`,
          perpendicular: `F sin θ = ${f(w.perpendicular)} N`,
          angle: `θ = ${f(w.angleDegrees)}°`,
          distance: `d = ${f(w.distance)} m`,
          work: `W = ${f(w.work)} J`,
        },
      };
      break;
    }
    case "kineticEnergy": {
      const k = kinetic;
      groups = [
        {
          title: t("groupInputs"),
          rows: [
            { label: "m", formula: t("given"), value: f(k.mass), unit: "kg" },
            { label: "v", formula: t("given"), value: f(k.velocity), unit: "m/s" },
          ],
        },
        {
          title: t("groupMotion"),
          rows: [
            { label: t("kineticEnergy"), formula: `½ m v² = ½ × ${f(k.mass)} × ${f(k.velocity)}²`, value: f(k.kineticEnergy), unit: "J", emphasize: true },
            { label: t("momentum"), formula: `p = m v = ${f(k.mass)} × ${f(k.velocity)}`, value: f(k.momentum), unit: "kg·m/s" },
            { label: t("speedKmh"), formula: `${f(k.velocity)} × 3.6`, value: f(k.kmh), unit: "km/h" },
            { label: t("dropHeight"), formula: `v² / 2g = ${f(k.velocity)}² / ${2 * ENERGY_GRAVITY}`, value: f(k.equivalentDropHeight), unit: "m" },
            { label: t("stopForce"), formula: `KE / 10 m`, value: f(k.stopForce10m), unit: "N" },
          ],
        },
        unitsGroup(k.kineticEnergy),
        everydayGroup(k.kineticEnergy),
        {
          title: t("groupSensitivity"),
          rows: [
            ...k.speedSensitivity
              .filter((s) => s.factor !== 1)
              .map((s) => ({ label: t("keAtSpeed", { k: f(s.factor) }), formula: `½ × ${f(k.mass)} × ${f(s.velocity)}²`, value: f(s.kineticEnergy), unit: "J" })),
            { label: t("keDoubleMass"), formula: `2 × ${f(k.kineticEnergy)}`, value: f(k.doubleMassEnergy), unit: "J" },
          ],
        },
      ];
      data = {
        kind: "kinetic",
        mass: k.mass,
        velocity: k.velocity,
        energies: k.speedSensitivity.map((s) => s.kineticEnergy),
        labels: {
          mass: `${f(k.mass)} kg`,
          velocity: `v = ${f(k.velocity)} m/s`,
          energy: `KE = ${f(k.kineticEnergy)} J`,
          columns: k.speedSensitivity.map((s) => `${f(s.factor)}v · ${f(s.kineticEnergy)} J`),
        },
      };
      break;
    }
    case "potentialEnergy": {
      const p = potential;
      const mid = fallStage(p.mass, p.height, 0.5);
      groups = [
        {
          title: t("groupInputs"),
          rows: [
            { label: "m", formula: t("given"), value: f(p.mass), unit: "kg" },
            { label: "h", formula: t("given"), value: f(p.height), unit: "m" },
            { label: t("gravity"), formula: t("constant"), value: f(ENERGY_GRAVITY), unit: "m/s²" },
          ],
        },
        {
          title: t("groupFall"),
          rows: [
            { label: t("weight"), formula: `m g = ${f(p.mass)} × ${ENERGY_GRAVITY}`, value: f(p.weight), unit: "N" },
            { label: t("potentialEnergy"), formula: `m g h = ${f(p.weight)} × ${f(p.height)}`, value: f(p.potentialEnergy), unit: "J", emphasize: true },
            { label: t("impactSpeed"), formula: `√(2 g h) = √(${2 * ENERGY_GRAVITY} × ${f(p.height)})`, value: f(p.impactSpeed), unit: "m/s" },
            { label: t("fallTime"), formula: `√(2 h / g)`, value: f(p.fallTime), unit: "s" },
            { label: t("midFall"), formula: `m g (h/2)`, value: f(mid.kinetic), unit: "J" },
          ],
        },
        unitsGroup(p.potentialEnergy),
        everydayGroup(p.potentialEnergy),
        {
          title: t("groupSensitivity"),
          rows: p.heightSensitivity
            .filter((s) => s.factor !== 1)
            .map((s) => ({ label: t("peAtHeight", { k: f(s.factor) }), formula: `${f(p.weight)} × ${f(s.height)}`, value: f(s.potentialEnergy), unit: "J" })),
        },
      ];
      data = {
        kind: "potential",
        mass: p.mass,
        height: p.height,
        fallTime: p.fallTime,
        labels: {
          mass: `${f(p.mass)} kg`,
          height: `h = ${f(p.height)} m`,
          energy: `PE = ${f(p.potentialEnergy)} J`,
          impact: `v = ${f(p.impactSpeed)} m/s`,
          pe: "PE",
          ke: "KE",
        },
      };
      break;
    }
    case "power": {
      if (!power) return null;
      const p = power;
      const slabs = Math.max(1, Math.min(10, Math.round(p.time) || 1));
      const per = p.time / slabs;
      groups = [
        {
          title: t("groupInputs"),
          rows: [
            { label: "W", formula: t("given"), value: f(p.work), unit: "J" },
            { label: "t", formula: t("given"), value: f(p.time), unit: "s" },
          ],
        },
        {
          title: t("groupPower"),
          rows: [
            { label: t("power"), formula: `W / t = ${f(p.work)} / ${f(p.time)}`, value: f(p.power), unit: "W", emphasize: true },
            { label: t("kilowatts"), formula: `${f(p.power)} / 1000`, value: f(p.kW), unit: "kW" },
            { label: t("horsepower"), formula: `${f(p.power)} / 745.7`, value: f(p.horsepower), unit: "hp" },
            { label: t("hourEnergy"), formula: `${f(p.power)} × 3600 / 3.6 × 10⁶`, value: f(p.kwhPerHour), unit: "kWh" },
            { label: t("bulbs"), formula: `${f(p.power)} / ${BULB_WATTS}`, value: f(p.bulbs, 2) },
          ],
        },
        unitsGroup(p.work),
        {
          title: t("groupTime"),
          rows: p.timeSteps
            .filter((s) => s.factor !== 1)
            .map((s) => ({ label: t("powerAtTime", { k: f(s.factor) }), formula: `${f(p.work)} / ${f(s.time)}`, value: f(s.power), unit: "W" })),
        },
      ];
      data = {
        kind: "power",
        slabs,
        labels: {
          work: `W = ${f(p.work)} J`,
          power: `P = ${f(p.power)} W`,
          time: `t = ${f(p.time)} s`,
          slab: `${f(per)} s → ${f(p.power * per)} J`,
        },
      };
      break;
    }
  }

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      capHeight={capHeight}
      drawing={
        <Scene3D camera={camera} orbit={ORBIT}>
          <EnergyScene3D data={data} />
        </Scene3D>
      }
    />
  );
}
