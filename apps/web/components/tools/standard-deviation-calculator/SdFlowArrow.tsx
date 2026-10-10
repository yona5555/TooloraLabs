"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 280;
const BOX_H = 38;
const GAP = 26;
const BOX_W = 180;

/** Type #2 (Flow Arrow with Embedded Numbers): Σx → μ → Σ(x − μ)² → σ² → σ, each arrow labelled with the operation applied. */
export default function SdFlowArrow() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.flow");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, f } = useSdModel();
  if (!a) return null;

  const steps = [
    { text: `Σx = ${f(a.sum)}`, cls: "fill-sky-100 stroke-sky-500 dark:fill-sky-500/15 dark:stroke-sky-400" },
    { text: `μ = ${f(a.mean)}`, cls: "fill-blue-100 stroke-blue-500 dark:fill-blue-500/15 dark:stroke-blue-400" },
    { text: `Σ(x − μ)² = ${f(a.sumSquares)}`, cls: "fill-violet-100 stroke-violet-500 dark:fill-violet-500/15 dark:stroke-violet-400" },
    { text: `σ² = ${f(a.populationVariance)}`, cls: "fill-amber-100 stroke-amber-500 dark:fill-amber-500/15 dark:stroke-amber-400" },
    { text: `σ = ${f(a.populationStdDev)}`, cls: "fill-emerald-100 stroke-emerald-600 dark:fill-emerald-500/15 dark:stroke-emerald-400" },
  ];
  const ops = [`÷ ${a.n}`, t("opSquare"), `÷ ${a.n}`, "√"];
  const H = steps.length * BOX_H + (steps.length - 1) * GAP + 4;
  const x0 = 8;
  const cx = x0 + BOX_W / 2;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <defs>
        <marker id="sd-flow-head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
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
                <line x1={cx} y1={y + BOX_H + 2} x2={cx} y2={y + BOX_H + GAP - 4} strokeWidth={2} markerEnd="url(#sd-flow-head)" className="stroke-zinc-500 dark:stroke-zinc-400" />
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
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: tl("sum"), value: f(a.sum, 4) },
        { label: t("mean"), value: `${f(a.sum)} / ${a.n} = ${f(a.mean, 4)}` },
        { label: tl("ss"), value: f(a.sumSquares, 4) },
        { label: t("variance"), value: `${f(a.sumSquares)} / ${a.n} = ${f(a.populationVariance, 4)}` },
        { label: "σ", value: `√${f(a.populationVariance)} = ${f(a.populationStdDev, 4)}`, emphasize: true },
      ]}
    />
  );
}
