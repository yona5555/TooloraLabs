"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { usePmModel } from "./PmLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const PmScene3D = dynamic(() => import("./PmScene3D"), { ssr: false, loading: () => null });

/**
 * Deep live table (inputs → components → rise → fall → impact → energy → optimum → path) beside
 * the live 3D trajectory. Reads the shared live launch, so the Result card and the encyclopedia
 * copy follow every keystroke, every quick example and every slider in the launch lab.
 */
export default function PmLive3D({ camera = [0.6, 1.2, 8.6] }: { camera?: [number, number, number] }) {
  const t = useTranslations("tools.projectile-motion-calculator.live3d");
  const tr = useTranslations("tools.projectile-motion-calculator.result");
  const tc = useTranslations("common.live3d");
  const { a, f, pct } = usePmModel();
  if (!a) return <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("invalid")}</p>;

  const v0 = f(a.speed);
  const th = f(a.angle, 2);
  const g = f(a.gravity, 3);
  const groups: LiveTableGroup[] = [
    {
      title: t("groupInputs"),
      rows: [
        { label: tr("speedField"), formula: "v₀", value: v0, unit: "m/s" },
        { label: tr("angleField"), formula: "θ", value: th, unit: "°" },
        { label: tr("heightField"), formula: "h₀", value: f(a.height), unit: "m" },
        { label: tr("gravityField"), formula: "g", value: g, unit: "m/s²" },
      ],
    },
    {
      title: t("groupComponents"),
      rows: [
        { label: t("vx"), formula: `v₀·cos θ = ${v0}·cos ${th}°`, value: f(a.vx, 3), unit: "m/s" },
        { label: t("vy"), formula: `v₀·sin θ = ${v0}·sin ${th}°`, value: f(a.vy, 3), unit: "m/s" },
      ],
    },
    {
      title: t("groupRise"),
      rows: [
        { label: t("timeUp"), formula: `vy / g = ${f(a.vy)} / ${g}`, value: f(a.timeUp, 3), unit: "s" },
        { label: t("rise"), formula: `vy² / 2g = ${f(a.vy)}² / (2·${g})`, value: f(a.rise, 3), unit: "m" },
        { label: tr("maxHeight"), formula: `h₀ + ${f(a.rise)}`, value: f(a.maxHeight, 3), unit: "m", emphasize: true },
        { label: t("apexX"), formula: `vₓ·t↑ = ${f(a.vx)}·${f(a.timeUp)}`, value: f(a.apexX, 3), unit: "m" },
      ],
    },
    {
      title: t("groupFall"),
      rows: [
        { label: t("timeDown"), formula: a.vy >= 0 ? `√(2·${f(a.maxHeight)} / ${g})` : `t − t↑`, value: f(a.timeDown, 3), unit: "s" },
        { label: tr("timeOfFlight"), formula: `[vy + √(vy² + 2g·h₀)] / g`, value: f(a.timeOfFlight, 3), unit: "s", emphasize: true },
        { label: tr("range"), formula: `vₓ·t = ${f(a.vx)}·${f(a.timeOfFlight)}`, value: f(a.range, 3), unit: "m", emphasize: true },
      ],
    },
    {
      title: t("groupImpact"),
      rows: [
        { label: t("impactVy"), formula: `vy − g·t = ${f(a.vy)} − ${g}·${f(a.timeOfFlight)}`, value: f(a.impactVy, 3), unit: "m/s" },
        { label: tr("impactSpeed"), formula: `√(vₓ² + vy,imp²)`, value: f(a.impactSpeed, 3), unit: "m/s", emphasize: true },
        { label: tr("impactAngle"), formula: `atan(|vy,imp| / vₓ)`, value: f(a.impactAngle, 2), unit: "°" },
      ],
    },
    {
      title: t("groupEnergy"),
      rows: [
        { label: t("keLaunch"), formula: `½v₀² = ½·${v0}²`, value: f(a.kineticLaunch, 2), unit: "J/kg" },
        { label: t("peLaunch"), formula: `g·h₀ = ${g}·${f(a.height)}`, value: f(a.potentialLaunch, 2), unit: "J/kg" },
        { label: t("energyApex"), formula: `½vₓ² + g·h_max`, value: f(a.kineticApex + a.potentialApex, 2), unit: "J/kg" },
        { label: t("keImpact"), formula: `½v² = ½·${f(a.impactSpeed)}²`, value: f(a.kineticImpact, 2), unit: "J/kg" },
      ],
    },
    {
      title: t("groupOptimum"),
      rows: [
        { label: t("optimalAngle"), formula: `atan(v₀ / √(v₀² + 2g·h₀))`, value: f(a.optimalAngle, 2), unit: "°" },
        { label: t("maxRange"), formula: `(v₀/g)·√(v₀² + 2g·h₀)`, value: f(a.maxRange, 3), unit: "m" },
        { label: t("efficiency"), formula: `R / R_max = ${f(a.range)} / ${f(a.maxRange)}`, value: pct(a.rangeEfficiency) },
        { label: t("complementary"), formula: `R(90° − θ) = R(${f(90 - a.angle, 2)}°)`, value: f(a.complementaryRange, 3), unit: "m" },
      ],
    },
    {
      title: t("groupPath"),
      rows: [
        { label: t("arcLength"), formula: `∫ |v| dt`, value: f(a.arcLength, 3), unit: "m" },
        { label: t("averageSpeed"), formula: `s / t = ${f(a.arcLength)} / ${f(a.timeOfFlight)}`, value: f(a.averageSpeed, 3), unit: "m/s" },
        { label: t("minSpeed"), formula: "min |v| = vₓ", value: f(a.minSpeed, 3), unit: "m/s" },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={camera} fitWidth={false}>
          <PmScene3D a={a} fmt={f} />
        </Scene3D>
      }
    />
  );
}
