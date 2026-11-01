"use client";
import { useTranslations } from "next-intl";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { useFitWidth } from "@/components/tool-ui/useFitWidth";
import { labelW, wrapLabel } from "@/components/tool-ui/labelLayout";

const MAX_W = 340;
const BEAM_Y = 70;
const LINE = 15;

const lg = (v: number) => Math.log10(Math.max(Math.abs(v), 1e-300));

/**
 * Type #14 (Balance Indicator): Newton's third law. m₁ pulls m₂ exactly as hard as m₂ pulls m₁, so
 * the beam carrying the two forces stays level for any masses; what differs is the response,
 * a = F / m, shown under each pan.
 */
export default function ForceThirdLawBalance() {
  const t = useTranslations("tools.force-calculator.education.lab.balance");
  const { gr, f } = useForceModel();
  // laid out at its on-screen width so the 12px labels keep their true size on a phone
  const [fitRef, W] = useFitWidth(MAX_W);
  const CX = W / 2;
  const ARM = Math.min(120, W / 2 - 50);
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
  // each pan's mass and acceleration: wrapped at an operator when wider than its half of the drawing,
  // and kept inside it, so long powers of ten never run off the edge or into the other pan's (§39)
  const half = W / 2 - 8;
  const lines = pans.map((p) => [...wrapLabel(`${f(p.mass)} kg`, half), ...wrapLabel(`a = ${f(p.acc)} m/s²`, half)]);
  const massLines = pans.map((p) => wrapLabel(`${f(p.mass)} kg`, half).length);
  const H = BEAM_Y + 94 + (Math.max(...lines.map((l) => l.length)) - 1) * LINE + 48;
  const cx = (p: (typeof pans)[number], text: string) => {
    const w = labelW(text) / 2 + 2;
    return p.x < CX ? Math.max(w, p.x) : Math.min(W - w, p.x);
  };

  const svg = (
    <svg ref={fitRef} direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <path d={`M ${CX} ${BEAM_Y} L ${CX - 16} ${BEAM_Y + 32} L ${CX + 16} ${BEAM_Y + 32} z`} className="fill-zinc-400 dark:fill-zinc-500" />
      <rect x={CX - ARM - 10} y={BEAM_Y - 4} width={ARM * 2 + 20} height={8} rx={4} className="fill-zinc-700 dark:fill-zinc-300" />
      <text style={{ fontSize: svgPx(12) }} x={CX} y={BEAM_Y - 34} textAnchor="middle" fontWeight={700} className="fill-emerald-600 dark:fill-emerald-400">
        {t("level")}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={BEAM_Y - 18} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-red-600 dark:fill-red-400">
        {`F₁₂ = F₂₁ = ${f(gr.force)} N`}
      </text>
      {pans.map((p, i) => (
        <g key={p.name}>
          <line x1={p.x} y1={BEAM_Y + 4} x2={p.x} y2={BEAM_Y + 50 - p.r} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
          <circle cx={p.x} cy={BEAM_Y + 50} r={p.r} className={p.cls} />
          <text style={{ fontSize: svgPx(12) }} x={p.x} y={BEAM_Y + 54} textAnchor="middle" fontWeight={700} fill="#ffffff">
            {p.name}
          </text>
          {lines[i].map((line, j) => (
            <text
              key={j}
              style={{ fontSize: svgPx(12) }}
              x={cx(p, line)}
              y={BEAM_Y + 94 + j * LINE + (j >= massLines[i] ? 3 : 0)}
              textAnchor="middle"
              fontWeight={j >= massLines[i] ? 700 : undefined}
              fontFamily="var(--font-mono)"
              className={j < massLines[i] ? "fill-zinc-600 dark:fill-zinc-300" : i === 0 ? "fill-blue-700 dark:fill-blue-300" : "fill-amber-600 dark:fill-amber-400"}
            >
              {line}
            </text>
          ))}
        </g>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={CX} y={H - 8} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
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
