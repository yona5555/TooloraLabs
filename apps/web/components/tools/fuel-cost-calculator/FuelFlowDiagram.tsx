"use client";
import { useTranslations } from "next-intl";

type Props = {
  distanceLabel: string;
  fuelLabel: string;
  costLabel: string;
};

function Box({ x, label, value }: { x: number; label: string; value: string }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect
        width="86"
        height="56"
        rx="10"
        className="fill-blue-50 stroke-blue-400 dark:fill-zinc-800 dark:stroke-blue-500"
        strokeWidth="2"
      />
      <text x="43" y="22" textAnchor="middle" className="fill-zinc-500 text-[0.55rem] dark:fill-zinc-400">
        {label}
      </text>
      <text x="43" y="40" textAnchor="middle" className="fill-blue-700 font-mono text-[0.7rem] font-bold dark:fill-blue-300">
        {value}
      </text>
    </g>
  );
}

function Arrow({ x }: { x: number }) {
  return (
    <g transform={`translate(${x}, 28)`}>
      <line x1="0" y1="0" x2="20" y2="0" className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
      <polygon points="20,-4 28,0 20,4" className="fill-zinc-400 dark:fill-zinc-500" />
    </g>
  );
}

export default function FuelFlowDiagram({ distanceLabel, fuelLabel, costLabel }: Props) {
  const t = useTranslations("tools.fuel-cost-calculator.diagram");

  return (
    <svg viewBox="0 0 316 56" width={316} height={56} role="img" aria-label={t("ariaLabel")} className="max-w-full">
      <Box x={0} label={t("distance")} value={distanceLabel} />
      <Arrow x={86} />
      <Box x={115} label={t("fuelUsed")} value={fuelLabel} />
      <Arrow x={201} />
      <Box x={230} label={t("totalCost")} value={costLabel} />
    </svg>
  );
}
