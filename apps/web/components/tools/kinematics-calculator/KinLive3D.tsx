"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { KINEMATICS_G0 } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useKinModel } from "./KinLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const KinScene3D = dynamic(() => import("./KinScene3D"), { ssr: false, loading: () => null });

const ORBIT = { minAzimuth: -0.7, maxAzimuth: 0.7, minPolar: 0.65, maxPolar: 1.62 };

/**
 * Deep live table (known and solved values → time steps t, v, x at constant a → derived motion →
 * the four equations checked) beside a 3D drawing of the motion: a car on a track at nine equal
 * instants with its velocity arrows and speed columns. Reads the shared live inputs, so the
 * Result card and the encyclopedia copy follow every keystroke and every lab slider.
 */
export default function KinLive3D({ camera = [0, 2.6, 8.8], capHeight = false }: { camera?: [number, number, number]; capHeight?: boolean }) {
  const t = useTranslations("tools.kinematics-calculator.live3d");
  const tr = useTranslations("tools.kinematics-calculator.result");
  const tq = useTranslations("tools.kinematics-calculator.aboveFold.quickReference.formulas");
  const tc = useTranslations("common.live3d");
  const { draft, k, solved, f } = useKinModel();
  if (!k) return null;

  const [v0, v, a, tt, dx] = [f(k.v0), f(k.v), f(k.a), f(k.t), f(k.dx)];
  const tb = draft.mode === "timeBased";
  const given = t("given");
  const formulaFor = (q: string): string => {
    if (q !== solved) return given;
    const map: Record<string, string> = tb
      ? { v: `v₀ + a t = ${v0} + ${a} × ${tt}`, v0: `v − a t = ${v} − ${a} × ${tt}`, a: `(v − v₀) / t`, t: `(v − v₀) / a` }
      : { v: `√(v₀² + 2aΔx)`, v0: `√(v² − 2aΔx)`, a: `(v² − v₀²) / (2Δx)`, dx: `(v² − v₀²) / (2a)` };
    return map[q] ?? given;
  };

  const groups: LiveTableGroup[] = [
    {
      title: t("groupKnown"),
      rows: [
        { label: t("initialVelocity"), formula: formulaFor("v0"), value: v0, unit: "m/s", emphasize: solved === "v0" },
        { label: t("finalVelocity"), formula: formulaFor("v"), value: v, unit: "m/s", emphasize: solved === "v" },
        { label: t("acceleration"), formula: formulaFor("a"), value: a, unit: "m/s²", emphasize: solved === "a" },
        {
          label: t("time"),
          formula: tb ? formulaFor("t") : k.tAvailable ? `(v − v₀) / a = (${v} − ${v0}) / ${a}` : "—",
          value: k.tAvailable ? tt : tr("undefined"),
          unit: k.tAvailable ? "s" : undefined,
          emphasize: solved === "t",
        },
        { label: t("displacement"), formula: tb ? `½ (v₀ + v) t = ½ (${v0} + ${v}) × ${tt}` : formulaFor("dx"), value: dx, unit: "m", emphasize: solved === "dx" },
      ],
    },
    {
      title: t("groupSteps", { a }),
      rows: k.steps.map((s) => ({
        label: `t = ${f(s.t)} s`,
        formula: `v = ${v0} + ${a} × ${f(s.t)} = ${f(s.v)} m/s`,
        value: f(s.x),
        unit: "m",
      })),
    },
    {
      title: t("groupDerived"),
      rows: [
        { label: t("deltaV"), formula: `v − v₀ = ${v} − ${v0}`, value: f(k.dv), unit: "m/s" },
        { label: t("averageVelocity"), formula: `½ (v₀ + v) = ½ (${v0} + ${v})`, value: f(k.averageVelocity), unit: "m/s", emphasize: true },
        { label: t("gForce"), formula: `a / g₀ = ${a} / ${KINEMATICS_G0}`, value: f(k.gForce, 3), unit: "g" },
        { label: t("v0Kmh"), formula: `${v0} × 3.6`, value: f(k.v0Kmh, 1), unit: "km/h" },
        { label: t("vKmh"), formula: `${v} × 3.6`, value: f(k.vKmh, 1), unit: "km/h" },
        { label: t("pathLength"), formula: k.turning ? `|x*| + |Δx − x*|` : `|Δx|`, value: f(k.pathLength), unit: "m" },
        ...(k.turning ? [{ label: t("turningPoint"), formula: `t* = −v₀ / a = ${f(k.turning.t)} s`, value: f(k.turning.x), unit: "m" }] : []),
        { label: t("timeTo100"), formula: `27.78 / |a|`, value: f(k.timeTo100kmh), unit: Number.isFinite(k.timeTo100kmh) ? "s" : undefined },
        { label: t("stoppingDistance"), formula: `v_max² / (2|a|)`, value: f(k.stoppingDistance), unit: Number.isFinite(k.stoppingDistance) ? "m" : undefined },
      ],
    },
    {
      title: t("groupEquations"),
      rows: k.checks.map((c) => ({
        label: tq(`${c.key}.label`),
        formula: tq(`${c.key}.expression`),
        value: `${f(c.lhs)} ${c.holds ? "=" : "≠"} ${f(c.rhs)}`,
        unit: c.holds ? "✓" : "✗",
      })),
    },
  ];

  const vMax = Math.max(...k.steps.map((s) => Math.abs(s.v)), 1e-9);
  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      capHeight={capHeight}
      drawing={
        <Scene3D camera={camera} orbit={ORBIT}>
          <KinScene3D
            data={{
              x: k.steps.map((s) => s.x),
              v: k.steps.map((s) => s.v / vMax),
              a: k.a,
              turningX: k.turning ? k.turning.x : null,
              labels: {
                accel: `a = ${a} m/s²`,
                speeds: k.steps.map((s) => `v = ${f(s.v, 1)} m/s`),
                times: k.steps.map((s) => `${f(s.t, 2)} s · ${f(s.x, 1)} m`),
                turning: k.turning ? `v = 0 · ${f(k.turning.x, 1)} m` : "",
              },
            }}
          />
        </Scene3D>
      }
    />
  );
}
