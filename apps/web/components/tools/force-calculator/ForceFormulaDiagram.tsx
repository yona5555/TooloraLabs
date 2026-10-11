"use client";
import { useTranslations } from "next-intl";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";

const W = 340;
const H = 200;
const BOX_W = 92;
const BOX_H = 58;
const TOP = 30;

/**
 * Type #18 (Formula Diagram): F = m × a as three boxes with the live values and SI units, the
 * solved box outlined, the unit identity N = kg·m/s² and the two rearrangements underneath.
 */
export default function ForceFormulaDiagram() {
  const t = useTranslations("tools.force-calculator.education.lab.formula");
  const { draft, sl, f } = useForceModel();
  if (!sl) return <ForceIndicatorUnavailable title={t("title")} />;

  const solved = draft.slSolve;
  const boxes = [
    { key: "force", sym: "F", value: f(sl.force), unit: "N", x: 10, cls: "stroke-red-500 dark:stroke-red-400", txt: "fill-red-600 dark:fill-red-400" },
    { key: "mass", sym: "m", value: f(sl.mass), unit: "kg", x: 124, cls: "stroke-blue-500 dark:stroke-blue-400", txt: "fill-blue-700 dark:fill-blue-300" },
    { key: "acceleration", sym: "a", value: f(sl.acceleration), unit: "m/s²", x: 238, cls: "stroke-emerald-500 dark:stroke-emerald-400", txt: "fill-emerald-700 dark:fill-emerald-300" },
  ];
  const rearr = [
    { key: "mass", text: `m = F / a = ${f(sl.force)} / ${f(sl.acceleration)}` },
    { key: "acceleration", text: `a = F / m = ${f(sl.force)} / ${f(sl.mass)}` },
    { key: "force", text: `F = m × a = ${f(sl.mass)} × ${f(sl.acceleration)}` },
  ].filter((r) => r.key !== "force" || solved !== "force");

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {boxes.map((b) => {
        const on = b.key === solved;
        return (
          <g key={b.key}>
            <rect x={b.x} y={TOP} width={BOX_W} height={BOX_H} rx={10} strokeWidth={on ? 3.5 : 1.5} className={`fill-white dark:fill-zinc-900 ${b.cls}`} />
            <text x={b.x + BOX_W / 2} y={TOP + 22} textAnchor="middle" fontSize={16} fontWeight={700} className={b.txt}>
              {b.sym}
            </text>
            <text x={b.x + BOX_W / 2} y={TOP + 43} textAnchor="middle" fontSize={12.5} fontWeight={600} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {b.value}
            </text>
            <text x={b.x + BOX_W / 2} y={TOP + BOX_H + 14} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
              {b.unit}
            </text>
            {on && (
              <text x={b.x + BOX_W / 2} y={TOP - 8} textAnchor="middle" fontSize={10} fontWeight={700} className={b.txt}>
                {t("solved")}
              </text>
            )}
          </g>
        );
      })}
      <text x={113} y={TOP + 35} textAnchor="middle" fontSize={20} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        =
      </text>
      <text x={227} y={TOP + 35} textAnchor="middle" fontSize={20} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        ×
      </text>
      <line x1={10} y1={124} x2={W - 10} y2={124} className="stroke-zinc-200 dark:stroke-zinc-700" />
      <text x={W / 2} y={143} textAnchor="middle" fontSize={11} fontWeight={600} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
        1 N = 1 kg × 1 m/s² = 1 kg·m/s²
      </text>
      {rearr.slice(0, 2).map((r, i) => (
        <text key={r.key} x={W / 2} y={165 + i * 18} textAnchor="middle" fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
          {r.text}
        </text>
      ))}
    </svg>
  );

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "m", value: `${f(sl.mass)} kg` },
        { label: "a", value: `${f(sl.acceleration)} m/s²` },
        { label: "m × a", value: `${f(sl.mass)} kg × ${f(sl.acceleration)} m/s²` },
        { label: "F", value: `${f(sl.force)} kg·m/s² = ${f(sl.force)} N`, emphasize: true },
        { label: t("check"), value: `${f(sl.force)} / ${f(sl.mass)} = ${f(sl.acceleration)}` },
      ]}
    />
  );
}
