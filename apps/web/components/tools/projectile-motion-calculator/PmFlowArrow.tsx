"use client";
import { useTranslations } from "next-intl";
import PmIndicatorCard from "./PmIndicatorCard";
import { usePmModel } from "./PmLiveContext";

const W = 320;
const BOX_H = 36;
const GAP = 26;
const BOX_W = 176;

/** Type #2 (Flow Arrow with Embedded Numbers): v₀ → vy → t↑ → t → R, each arrow labelled with the live operation applied. */
export default function PmFlowArrow() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.flow");
  const { a, f } = usePmModel();
  if (!a) return null;

  const steps = [
    { text: `v₀ = ${f(a.speed)} m/s`, cls: "fill-sky-100 stroke-sky-500 dark:fill-sky-500/15 dark:stroke-sky-400" },
    { text: `vy = ${f(a.vy)} m/s`, cls: "fill-emerald-100 stroke-emerald-500 dark:fill-emerald-500/15 dark:stroke-emerald-400" },
    { text: `t↑ = ${f(a.timeUp)} s`, cls: "fill-amber-100 stroke-amber-500 dark:fill-amber-500/15 dark:stroke-amber-400" },
    { text: `t = ${f(a.timeOfFlight)} s`, cls: "fill-violet-100 stroke-violet-500 dark:fill-violet-500/15 dark:stroke-violet-400" },
    { text: `R = ${f(a.range)} m`, cls: "fill-blue-100 stroke-blue-600 dark:fill-blue-500/15 dark:stroke-blue-400" },
  ];
  const ops = [`× sin ${f(a.angle, 1)}°`, `÷ g (${f(a.gravity)})`, `+ t↓ (${f(a.timeDown)} s)`, `× vₓ (${f(a.vx)} m/s)`];
  const H = steps.length * BOX_H + (steps.length - 1) * GAP + 4;
  const x0 = 4;
  const cx = x0 + BOX_W / 2;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <marker id="pm-flow-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="fill-zinc-500 dark:fill-zinc-400" />
        </marker>
      </defs>
      {steps.map((s, i) => {
        const y = 2 + i * (BOX_H + GAP);
        return (
          <g key={i}>
            <rect x={x0} y={y} width={BOX_W} height={BOX_H} rx={9} strokeWidth={1.5} className={s.cls} />
            <text x={cx} y={y + BOX_H / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {s.text}
            </text>
            {i < ops.length && (
              <>
                <line x1={cx} y1={y + BOX_H + 2} x2={cx} y2={y + BOX_H + GAP - 4} strokeWidth={2} markerEnd="url(#pm-flow-head)" className="stroke-zinc-500 dark:stroke-zinc-400" />
                <text x={cx + 14} y={y + BOX_H + GAP / 2 + 4} fontSize={11} fontWeight={600} className="fill-blue-700 dark:fill-blue-300">
                  {ops[i]}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("vertical"), value: `${f(a.speed)} × sin ${f(a.angle, 1)}° = ${f(a.vy, 3)} m/s` },
        { label: t("horizontal"), value: `${f(a.speed)} × cos ${f(a.angle, 1)}° = ${f(a.vx, 3)} m/s` },
        { label: t("up"), value: `${f(a.vy)} / ${f(a.gravity)} = ${f(a.timeUp, 3)} s` },
        { label: t("down"), value: `${f(a.timeDown, 3)} s` },
        { label: t("range"), value: `${f(a.vx)} × ${f(a.timeOfFlight)} = ${f(a.range, 3)} m`, emphasize: true },
      ]}
    />
  );
}
