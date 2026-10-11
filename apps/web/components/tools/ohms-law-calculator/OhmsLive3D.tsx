"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { COPPER_RESISTIVITY, ELEMENTARY_CHARGE, JOULES_PER_CALORIE } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { useOhmsModel, type OhmsQuantity } from "./OhmsLiveContext";
import type { OhmsLawKnownPair } from "./types";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const OhmsScene3D = dynamic(() => import("./OhmsScene3D"), { ssr: false, loading: () => null });

const ORBIT = { minAzimuth: -0.7, maxAzimuth: 0.7, minPolar: 0.9, maxPolar: 2.1 };

/** How each solved quantity is reached from the two known ones. */
const SOLVE: Record<OhmsLawKnownPair, Partial<Record<OhmsQuantity, string>>> = {
  VI: { resistance: "R = V / I", power: "P = V × I" },
  VR: { current: "I = V / R", power: "P = V² / R" },
  IR: { voltage: "V = I × R", power: "P = I² × R" },
  VP: { current: "I = P / V", resistance: "R = V² / P" },
  IP: { voltage: "V = P / I", resistance: "R = P / I²" },
  RP: { voltage: "V = √(P × R)", current: "I = √(P / R)" },
};

/**
 * Deep live table (the law → three power routes → units → charge flow → energy → same V on other
 * resistances → matching parts) beside a 3D circuit: battery, copper loop, a resistor glowing with
 * its power, and charges flowing at a speed set by the current. Reads the shared live inputs, so
 * the Result card and the encyclopedia copy follow every keystroke and every slider.
 */
export default function OhmsLive3D({ camera = [0, 0.4, 8], capHeight = false }: { camera?: [number, number, number]; capHeight?: boolean }) {
  const t = useTranslations("tools.ohms-law-calculator.live3d");
  const tr = useTranslations("tools.ohms-law-calculator.result");
  const tc = useTranslations("common.live3d");
  const { draft, a, solved, f } = useOhmsModel();

  if (!a) return null;

  const V = a.voltage;
  const I = a.current;
  const R = a.resistance;
  const P = a.power;
  const row = (q: OhmsQuantity, value: number, unit: string) => ({
    label: tr(q),
    formula: solved[q] ? SOLVE[draft.pair][q] : t("given"),
    value: f(value),
    unit,
    emphasize: solved[q],
  });
  const others = a.sensitivity.filter((s) => s.factor !== 1);

  const groups: LiveTableGroup[] = [
    { title: t("groupLaw"), rows: [row("voltage", V, "V"), row("current", I, "A"), row("resistance", R, "Ω"), row("power", P, "W")] },
    {
      title: t("groupPower"),
      rows: [
        { label: "V × I", formula: `${f(V)} × ${f(I)}`, value: f(a.powerViaVI), unit: "W" },
        { label: "I² × R", formula: `${f(I)}² × ${f(R)}`, value: f(a.powerViaI2R), unit: "W" },
        { label: "V² / R", formula: `${f(V)}² / ${f(R)}`, value: f(a.powerViaV2R), unit: "W" },
      ],
    },
    {
      title: t("groupUnits"),
      rows: [
        { label: t("milliamps"), formula: `${f(I)} × 1000`, value: f(a.milliamps), unit: "mA" },
        { label: t("kilohms"), formula: `${f(R)} / 1000`, value: f(a.kilohms), unit: "kΩ" },
        { label: t("milliwatts"), formula: `${f(P)} × 1000`, value: f(a.milliwatts), unit: "mW" },
        { label: t("conductance"), formula: `G = 1 / R = 1 / ${f(R)}`, value: f(a.conductance), unit: "S" },
      ],
    },
    {
      title: t("groupCharge"),
      rows: [
        { label: t("chargePerSecond"), formula: `Q = I × t = ${f(I)} × 1`, value: f(a.chargePerSecond), unit: "C" },
        { label: t("chargePerMinute"), formula: `${f(I)} × 60`, value: f(a.chargePerMinute), unit: "C" },
        { label: t("electrons"), formula: `I / e = ${f(Math.abs(I))} / ${f(ELEMENTARY_CHARGE)}`, value: f(a.electronsPerSecond), unit: "1/s", emphasize: true },
      ],
    },
    {
      title: t("groupEnergy"),
      rows: [
        { label: t("joulesPerMinute"), formula: `E = P × t = ${f(P)} × 60`, value: f(a.joulesPerMinute), unit: "J" },
        { label: t("wattHours"), formula: `${f(P)} × 1 h`, value: f(a.wattHoursPerHour), unit: "Wh" },
        { label: t("kWhPerDay"), formula: `${f(P)} × 24 / 1000`, value: f(a.kWhPerDay), unit: "kWh" },
        { label: t("kcalPerMinute"), formula: `${f(a.joulesPerMinute)} / ${JOULES_PER_CALORIE} / 1000`, value: f(a.kcalPerMinute), unit: "kcal" },
      ],
    },
    {
      title: t("groupSensitivity"),
      rows: others.flatMap((s) => [
        { label: t("currentWithR", { k: f(s.factor) }), formula: `${f(V)} / ${f(s.resistance)}`, value: f(s.current), unit: "A" },
        { label: t("powerWithR", { k: f(s.factor) }), formula: `${f(V)} × ${f(s.current)}`, value: f(s.power), unit: "W" },
      ]),
    },
    {
      title: t("groupParts"),
      rows: [
        { label: t("fuse"), formula: `≥ ${f(Math.abs(I))} A`, value: a.fuseExceeded ? `> ${f(a.fuse)}` : f(a.fuse), unit: "A" },
        { label: t("resistorRating"), formula: `≥ 2 × ${f(Math.abs(P))} W`, value: a.resistorRating === null ? "> 2" : f(a.resistorRating), unit: "W" },
        { label: t("e12"), formula: `≈ ${f(Math.abs(R))} Ω`, value: f(a.e12), unit: "Ω" },
        { label: t("copperLength"), formula: `L = R A / ρ = ${f(Math.abs(R))} × 10⁻⁶ / ${f(COPPER_RESISTIVITY)}`, value: f(a.copperLength1mm2), unit: "m" },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      capHeight={capHeight}
      drawing={
        <Scene3D camera={camera} orbit={ORBIT}>
          <OhmsScene3D
            data={{
              voltage: V,
              current: I,
              resistance: R,
              power: P,
              labels: {
                voltage: `V = ${f(V)} V`,
                current: `I = ${f(I)} A`,
                resistance: `R = ${f(R)} Ω`,
                power: `P = ${f(P)} W`,
                plus: "+",
                minus: "−",
              },
            }}
          />
        </Scene3D>
      }
    />
  );
}
