"use client";
import { useTranslations } from "next-intl";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { useOhmsModel } from "./OhmsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const BOX_W = 92;
const BOX_H = 58;
const TOP = 30;

/**
 * Type #18 (Formula Diagram): V = I × R as three boxes with the live values and SI units, the solved
 * boxes outlined, the unit identity V = A·Ω and the power identity P = V × I underneath.
 */
export default function OhmsFormulaDiagram() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.formula");
  const { a, solved, f } = useOhmsModel();
  if (!a) return <OhmsIndicatorUnavailable title={t("title")} />;

  const boxes = [
    { key: "voltage" as const, sym: "V", value: f(a.voltage), unit: "V", x: 10, cls: "stroke-blue-500 dark:stroke-blue-400", txt: "fill-blue-700 dark:fill-blue-300" },
    { key: "current" as const, sym: "I", value: f(a.current), unit: "A", x: 124, cls: "stroke-emerald-500 dark:stroke-emerald-400", txt: "fill-emerald-700 dark:fill-emerald-300" },
    { key: "resistance" as const, sym: "R", value: f(a.resistance), unit: "Ω", x: 238, cls: "stroke-amber-500 dark:stroke-amber-400", txt: "fill-amber-700 dark:fill-amber-300" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {boxes.map((b) => {
        const on = solved[b.key];
        return (
          <g key={b.key}>
            <rect x={b.x} y={TOP} width={BOX_W} height={BOX_H} rx={10} strokeWidth={on ? 3.5 : 1.5} className={`fill-white dark:fill-zinc-900 ${b.cls}`} />
            <text style={{ fontSize: svgPx(16) }} x={b.x + BOX_W / 2} y={TOP + 22} textAnchor="middle" fontWeight={700} className={b.txt}>
              {b.sym}
            </text>
            <text style={{ fontSize: svgPx(12.5) }} x={b.x + BOX_W / 2} y={TOP + 43} textAnchor="middle" fontWeight={600} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {b.value}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={b.x + BOX_W / 2} y={TOP + BOX_H + 14} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
              {b.unit}
            </text>
            {on && (
              <text style={{ fontSize: svgPx(12) }} x={b.x + BOX_W / 2} y={TOP - 8} textAnchor="middle" fontWeight={700} className={b.txt}>
                {t("solved")}
              </text>
            )}
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(20) }} x={113} y={TOP + 35} textAnchor="middle" fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        =
      </text>
      <text style={{ fontSize: svgPx(20) }} x={227} y={TOP + 35} textAnchor="middle" fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        ×
      </text>
      <line x1={10} y1={124} x2={W - 10} y2={124} className="stroke-zinc-200 dark:stroke-zinc-700" />
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={143} textAnchor="middle" fontWeight={600} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
        1 V = 1 A × 1 Ω · 1 W = 1 V × 1 A
      </text>
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={165} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {`I = V / R = ${f(a.voltage)} / ${f(a.resistance)}`}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={183} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
        {`P = V × I = ${f(a.power)} W`}
      </text>
    </svg>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "I", value: `${f(a.current)} A` },
        { label: "R", value: `${f(a.resistance)} Ω` },
        { label: "I × R", value: `${f(a.current)} A × ${f(a.resistance)} Ω`, emphasize: solved.voltage },
        { label: "V", value: `${f(a.voltage)} A·Ω = ${f(a.voltage)} V`, emphasize: true },
        { label: t("check"), value: `${f(a.voltage)} / ${f(a.current)} = ${f(a.resistance)} Ω` },
      ]}
    />
  );
}
