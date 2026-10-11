"use client";
import { useTranslations } from "next-intl";
import { RESISTOR_POWER_RATINGS } from "@tooloralabs/tools";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { pow10, useOhmsModel } from "./OhmsLiveContext";

const W = 360;
const H = 170;
const X0 = 20;
const X1 = W - 20;
const STRIP = 70;
const LO = -2;
const HI = 3;
const ZONES = [
  "fill-emerald-400 dark:fill-emerald-500",
  "fill-lime-400 dark:fill-lime-500",
  "fill-yellow-400 dark:fill-yellow-500",
  "fill-amber-400 dark:fill-amber-500",
  "fill-orange-400 dark:fill-orange-500",
  "fill-red-500 dark:fill-red-500",
];
const NAMES = ["⅛ W", "¼ W", "½ W", "1 W", "2 W"];

/**
 * Type #19 (Zone Strip): the power your resistor dissipates on a log strip split into the common
 * fixed-resistor ratings (⅛, ¼, ½, 1 and 2 W, then power resistors). Both P and the 2× derated
 * value 2P are marked; the rating to buy is the zone that holds 2P.
 */
export default function OhmsResistorRating() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.rating");
  const { a, f } = useOhmsModel();
  if (!a) return <OhmsIndicatorUnavailable title={t("title")} />;

  const P = Math.abs(a.power);
  const sx = (w: number) => X0 + ((Math.max(LO, Math.min(HI, Math.log10(Math.max(w, 1e-30)))) - LO) / (HI - LO)) * (X1 - X0);
  const edges = [10 ** LO, ...RESISTOR_POWER_RATINGS, 10 ** HI];
  const marks = [
    { key: "p", label: `P = ${f(P)} W`, x: sx(P), y: STRIP - 34, cls: "fill-blue-700 dark:fill-blue-300", stroke: "stroke-blue-700 dark:stroke-blue-300" },
    { key: "p2", label: `2P = ${f(2 * P)} W`, x: sx(2 * P), y: STRIP - 14, cls: "fill-red-600 dark:fill-red-400", stroke: "stroke-red-600 dark:stroke-red-400" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {edges.slice(0, -1).map((e, i) => (
        <rect key={i} x={sx(e)} y={STRIP} width={Math.max(1, sx(edges[i + 1]) - sx(e))} height={22} className={ZONES[i]} />
      ))}
      {RESISTOR_POWER_RATINGS.map((r, i) => (
        <g key={r}>
          <line x1={sx(r)} y1={STRIP - 2} x2={sx(r)} y2={STRIP + 26} strokeWidth={1.5} className="stroke-zinc-700 dark:stroke-zinc-200" />
          <text x={sx(r)} y={STRIP + 38 + (i % 2) * 12} textAnchor="middle" fontSize={10} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
            {NAMES[i]}
          </text>
        </g>
      ))}
      <text x={X0} y={STRIP + 38} fontSize={9.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {`${pow10(LO)} W`}
      </text>
      <text x={X1} y={STRIP + 38} textAnchor="end" fontSize={9.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
        {`${pow10(HI)} W`}
      </text>
      <text x={X1} y={STRIP + 66} textAnchor="end" fontSize={10} fontWeight={600} className="fill-red-600 dark:fill-red-400">
        {t("powerResistor")}
      </text>
      {marks.map((m) => {
        const lx = Math.max(60, Math.min(W - 60, m.x));
        return (
          <g key={m.key}>
            <line x1={m.x} y1={STRIP} x2={lx} y2={m.y + 4} strokeWidth={1.5} className={m.stroke} />
            <path d={`M ${m.x - 5} ${STRIP - 6} L ${m.x + 5} ${STRIP - 6} L ${m.x} ${STRIP + 1} z`} className={m.cls} />
            <text x={lx} y={m.y} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className={m.cls}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const rating = a.resistorRating;
  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "P", value: `${f(a.current)}² × ${f(a.resistance)} = ${f(P)} W` },
        { label: t("derated"), value: `2 × ${f(P)} = ${f(2 * P)} W` },
        rating === null
          ? { label: t("choose"), value: t("powerResistor"), emphasize: true, note: t("above2W") }
          : { label: t("choose"), value: `${f(rating)} W`, emphasize: true },
        { label: t("load"), value: rating === null ? "—" : `${f(P)} / ${f(rating)} = ${f((P / rating) * 100, 1)}%` },
      ]}
    />
  );
}
