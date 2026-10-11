"use client";
import { useTranslations } from "next-intl";
import EnergyIndicatorCard, { EnergyIndicatorUnavailable } from "./EnergyIndicatorCard";
import { useEnergyModel } from "./EnergyLiveContext";

const W = 360;
const H = 220;
const BASE = 170;
const TOP = 34;
const L = 14;
const STEP = (W - 2 * L) / 5;

/**
 * Type #13 (Stepped Diagram): the same work W delivered in t/4, t/2, t, 2t and 4t. Power P = W / t
 * halves at every step to the right — the work stays the same, only its rate changes.
 */
export default function EnergyPowerSteps() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.steps");
  const { power, f } = useEnergyModel();
  if (!power || power.power === 0) return <EnergyIndicatorUnavailable title={t("title")} />;

  const steps = power.timeSteps;
  const maxP = Math.max(...steps.map((s) => Math.abs(s.power)), 1e-30);
  const names = ["t/4", "t/2", "t", "2t", "4t"];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {steps.map((s, i) => {
        const x = L + i * STEP;
        const h = (Math.abs(s.power) / maxP) * (BASE - TOP);
        const on = s.factor === 1;
        return (
          <g key={s.factor}>
            <rect x={x + 2} y={BASE - h} width={STEP - 4} height={Math.max(1, h)} rx={3} className={on ? "fill-amber-500 dark:fill-amber-400" : "fill-zinc-300 dark:fill-zinc-600"} />
            <text x={x + STEP / 2} y={BASE - h - 7} textAnchor="middle" fontSize={10.5} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(s.power, 2)}
            </text>
            <text x={x + STEP / 2} y={BASE + 15} textAnchor="middle" fontSize={11} fontWeight={on ? 700 : 500} fontFamily="ui-monospace, monospace" className={on ? "fill-amber-600 dark:fill-amber-400" : "fill-zinc-600 dark:fill-zinc-300"}>
              {names[i]}
            </text>
            <text x={x + STEP / 2} y={BASE + 30} textAnchor="middle" fontSize={9.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(s.time, 2)} s`}
            </text>
          </g>
        );
      })}
      <text x={4} y={14} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {`P (W) · W = ${f(power.work)} J`}
      </text>
    </svg>
  );

  return (
    <EnergyIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "t/4", value: `${f(power.work)} / ${f(steps[0].time)} = ${f(steps[0].power)} W` },
        { label: "t", value: `${f(power.work)} / ${f(power.time)} = ${f(power.power)} W`, emphasize: true },
        { label: "4t", value: `${f(power.work)} / ${f(steps[4].time)} = ${f(steps[4].power)} W` },
        { label: t("ratio"), value: `${f(steps[0].power / steps[4].power)} : 1`, note: t("ratioNote") },
      ]}
    />
  );
}
