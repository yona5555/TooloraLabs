"use client";
import { useTranslations } from "next-intl";
import PmIndicatorCard from "./PmIndicatorCard";
import { r2, usePmModel } from "./PmLiveContext";

const W = 400;
const H = 250;
const CX = 200;
const PIVOT_Y = 150;
const ARM = 130;
const PAN_W = 96;
const STACK_H = 62;

/**
 * Type #14 (Balance Indicator): specific energy (J/kg) on a beam balance. The left pan holds the
 * launch energy ½v₀² + g·h₀ (kinetic + potential blocks), the right pan the impact energy ½v².
 * The beam tilt is computed from their real difference, so it stays level because energy is
 * conserved; the apex energy ½vₓ² + g·h_max is the check under the pivot.
 */
export default function PmEnergyBalance() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.energy");
  const { a, f } = usePmModel();
  if (!a) return null;

  const left = a.kineticLaunch + a.potentialLaunch;
  const right = a.kineticImpact;
  const scale = Math.max(left, right, 1e-9);
  const diff = (left - right) / scale;
  const tilt = Math.max(-12, Math.min(12, diff * 60));
  const rad = (tilt * Math.PI) / 180;
  const lx = r2(CX - ARM * Math.cos(rad));
  const ly = r2(PIVOT_Y - 60 + ARM * Math.sin(rad));
  const rx = r2(CX + ARM * Math.cos(rad));
  const ry = r2(PIVOT_Y - 60 - ARM * Math.sin(rad));
  const hKe = r2((a.kineticLaunch / scale) * STACK_H);
  const hPe = r2((a.potentialLaunch / scale) * STACK_H);
  const hImp = r2((right / scale) * STACK_H);
  const apex = a.kineticApex + a.potentialApex;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {/* stand and pivot */}
      <path d={`M${CX - 46},${H - 34} L${CX + 46},${H - 34} L${CX},${PIVOT_Y - 60} Z`} className="fill-zinc-200 stroke-zinc-400 dark:fill-zinc-800 dark:stroke-zinc-600" strokeWidth={1.5} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} strokeWidth={5} strokeLinecap="round" className="stroke-zinc-600 dark:stroke-zinc-300" />
      <circle cx={CX} cy={PIVOT_Y - 60} r={6} className="fill-blue-600 dark:fill-blue-400" />
      {/* left pan: launch KE + PE */}
      <line x1={lx} y1={ly} x2={lx} y2={ly + 10} strokeWidth={1.5} className="stroke-zinc-500" />
      <rect x={lx - PAN_W / 2} y={ly + 10} width={PAN_W} height={4} rx={2} className="fill-zinc-500 dark:fill-zinc-400" />
      <rect x={lx - PAN_W / 2 + 8} y={r2(ly + 10 - hKe)} width={PAN_W - 16} height={hKe} className="fill-blue-500 dark:fill-blue-400" />
      <rect x={lx - PAN_W / 2 + 8} y={r2(ly + 10 - hKe - hPe)} width={PAN_W - 16} height={hPe} className="fill-amber-500 dark:fill-amber-400" />
      {/* right pan: impact KE */}
      <line x1={rx} y1={ry} x2={rx} y2={ry + 10} strokeWidth={1.5} className="stroke-zinc-500" />
      <rect x={rx - PAN_W / 2} y={ry + 10} width={PAN_W} height={4} rx={2} className="fill-zinc-500 dark:fill-zinc-400" />
      <rect x={rx - PAN_W / 2 + 8} y={r2(ry + 10 - hImp)} width={PAN_W - 16} height={hImp} className="fill-red-500 dark:fill-red-400" />
      {/* pan captions under each pan */}
      <text x={lx} y={ly + 30} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">{`${f(left, 1)} J/kg`}</text>
      <text x={lx} y={ly + 44} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{t("launchPan")}</text>
      <text x={rx} y={ry + 30} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">{`${f(right, 1)} J/kg`}</text>
      <text x={rx} y={ry + 44} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">{t("impactPan")}</text>
      {/* legend + verdict along the top */}
      <rect x={8} y={6} width={10} height={10} rx={2} className="fill-blue-500 dark:fill-blue-400" />
      <text x={22} y={15} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">{`½v₀² ${f(a.kineticLaunch, 1)}`}</text>
      <rect x={140} y={6} width={10} height={10} rx={2} className="fill-amber-500 dark:fill-amber-400" />
      <text x={154} y={15} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">{`g·h₀ ${f(a.potentialLaunch, 1)}`}</text>
      <rect x={272} y={6} width={10} height={10} rx={2} className="fill-red-500 dark:fill-red-400" />
      <text x={286} y={15} fontSize={10} className="fill-zinc-600 dark:fill-zinc-300">{`½v² ${f(right, 1)}`}</text>
      <text x={CX} y={H - 12} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-emerald-700 dark:fill-emerald-300">
        {`Δ = ${f(left - right, 3)} J/kg`}
      </text>
    </svg>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("kinetic"), value: `½ × ${f(a.speed)}² = ${f(a.kineticLaunch)} J/kg` },
        { label: t("potential"), value: `${f(a.gravity)} × ${f(a.height)} = ${f(a.potentialLaunch)} J/kg` },
        { label: t("apex"), value: `½ × ${f(a.vx)}² + ${f(a.gravity)} × ${f(a.maxHeight)} = ${f(apex)} J/kg` },
        { label: t("impact"), value: `½ × ${f(a.impactSpeed)}² = ${f(right)} J/kg` },
        { label: t("verdict"), value: `${f(left)} = ${f(right)}`, emphasize: true, note: t("verdictNote") },
      ]}
    />
  );
}
