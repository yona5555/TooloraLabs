"use client";
import { useTranslations } from "next-intl";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";

const W = 340;
const H = 220;
const CX = W / 2;
const BEAM_Y = 70;
const ARM = 120;

const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-300));

/**
 * Type #14 (Balance Indicator): Newton's third law. m₁ pulls m₂ exactly as hard as m₂ pulls m₁, so
 * the beam carrying the two forces stays level for any masses; what differs is the response,
 * a = F / m, shown under each pan.
 */
export default function ForceThirdLawBalance() {
  const t = useTranslations("tools.force-calculator.education.lab.balance");
  const { gr, f } = useForceModel();
  if (!gr) return <ForceIndicatorUnavailable title={t("title")} />;

  const L1 = lg(gr.mass1);
  const L2 = lg(gr.mass2);
  const lo = Math.min(L1, L2);
  const hi = Math.max(L1, L2);
  const rad = (Lm: number) => (hi - lo < 1e-9 ? 22 : 15 + 12 * ((Lm - lo) / (hi - lo)));
  const pans = [
    { x: CX - ARM, r: rad(L1), name: "m₁", mass: gr.mass1, acc: gr.accel1, cls: "fill-blue-600 dark:fill-blue-400" },
    { x: CX + ARM, r: rad(L2), name: "m₂", mass: gr.mass2, acc: gr.accel2, cls: "fill-amber-500 dark:fill-amber-400" },
  ];
  const ratio = gr.accel1 !== 0 ? gr.accel2 / gr.accel1 : 0;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <path d={`M ${CX} ${BEAM_Y} L ${CX - 16} ${BEAM_Y + 32} L ${CX + 16} ${BEAM_Y + 32} z`} className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x={CX - ARM - 10} y={BEAM_Y - 4} width={ARM * 2 + 20} height={8} rx={4} className="fill-zinc-700 dark:fill-zinc-300" />
      <text x={CX} y={BEAM_Y - 34} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-emerald-600 dark:fill-emerald-400">
        {t("level")}
      </text>
      <text x={CX} y={BEAM_Y - 18} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
        {`F₁₂ = F₂₁ = ${f(gr.force)} N`}
      </text>
      {pans.map((p, i) => (
        <g key={p.name}>
          <line x1={p.x} y1={BEAM_Y + 4} x2={p.x} y2={BEAM_Y + 50 - p.r} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
          <circle cx={p.x} cy={BEAM_Y + 50} r={p.r} className={p.cls} />
          <text x={p.x} y={BEAM_Y + 54} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ffffff">
            {p.name}
          </text>
          <text x={p.x} y={BEAM_Y + 94} textAnchor="middle" fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
            {`${f(p.mass)} kg`}
          </text>
          <text x={p.x} y={BEAM_Y + 112} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className={i === 0 ? "fill-blue-700 dark:fill-blue-300" : "fill-amber-600 dark:fill-amber-400"}>
            {`a = ${f(p.acc)} m/s²`}
          </text>
        </g>
      ))}
      <text x={CX} y={H - 8} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {t("ratioLine", { ratio: f(ratio) })}
      </text>
    </svg>
  );

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("pullOn2"), value: `${f(gr.force)} N` },
        { label: t("pullOn1"), value: `${f(gr.force)} N` },
        { label: "a₁ = F / m₁", value: `${f(gr.force)} / ${f(gr.mass1)} = ${f(gr.accel1)} m/s²` },
        { label: "a₂ = F / m₂", value: `${f(gr.force)} / ${f(gr.mass2)} = ${f(gr.accel2)} m/s²` },
        { label: "a₂ / a₁ = m₁ / m₂", value: f(ratio), emphasize: true },
      ]}
    />
  );
}
