"use client";
import { useTranslations } from "next-intl";
import EnergyIndicatorCard, { EnergyIndicatorUnavailable } from "./EnergyIndicatorCard";
import { useEnergyModel } from "./EnergyLiveContext";

const W = 320;
const H = 220;
const BASE = 168;
const TOP = 40;
const BAR = 60;
const CLS = ["fill-sky-500 dark:fill-sky-400", "fill-emerald-600 dark:fill-emerald-400", "fill-amber-500 dark:fill-amber-400"];

/** Type #12 (Sensitivity Trio): the same mass at half, the current and double the speed → KE = ½mv² goes ¼ : 1 : 4. */
export default function EnergySpeedTrio() {
  const t = useTranslations("tools.energy-work-power-calculator.education.lab.trio");
  const { kinetic: k, f } = useEnergyModel();
  if (k.kineticEnergy === 0) return <EnergyIndicatorUnavailable title={t("title")} />;

  const items = k.speedSensitivity;
  const maxE = Math.max(...items.map((i) => Math.abs(i.kineticEnergy)), 1e-30);
  const names = [t("half"), t("current"), t("double")];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {items.map((it, i) => {
        const cx = (W / 3) * i + W / 6;
        const h = (Math.abs(it.kineticEnergy) / maxE) * (BASE - TOP);
        return (
          <g key={it.factor}>
            <rect x={cx - BAR / 2} y={BASE - h} width={BAR} height={Math.max(1, h)} rx={6} className={CLS[i]} />
            <text x={cx} y={BASE - h - 8} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {`${f(it.kineticEnergy, 2)} J`}
            </text>
            <text x={cx} y={BASE + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {names[i]}
            </text>
            <text x={cx} y={BASE + 31} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(it.velocity)} m/s`}
            </text>
          </g>
        );
      })}
      <text x={4} y={14} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {`KE (J) · m = ${f(k.mass)} kg`}
      </text>
    </svg>
  );

  return (
    <EnergyIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("half"), value: `½ × ${f(k.mass)} × ${f(items[0].velocity)}² = ${f(items[0].kineticEnergy)} J` },
        { label: t("current"), value: `½ × ${f(k.mass)} × ${f(items[1].velocity)}² = ${f(items[1].kineticEnergy)} J`, emphasize: true },
        { label: t("double"), value: `½ × ${f(k.mass)} × ${f(items[2].velocity)}² = ${f(items[2].kineticEnergy)} J` },
        { label: t("ratio"), value: `${f(items[2].kineticEnergy / items[1].kineticEnergy)} : 1`, note: t("ratioNote") },
      ]}
    />
  );
}
