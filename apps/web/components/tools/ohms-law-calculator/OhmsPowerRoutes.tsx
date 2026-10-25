"use client";
import { useTranslations } from "next-intl";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { useOhmsModel } from "./OhmsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const L = 92;
const R = 300;
const ROW = 50;
const TOP = 30;
const CLS = ["fill-blue-600 dark:fill-blue-400", "fill-emerald-500 dark:fill-emerald-400", "fill-amber-500 dark:fill-amber-400"];

/**
 * Type #11 (Side-by-Side Equivalence): the power computed three independent ways — V × I, I² × R and
 * V² / R — as three bars that always land on the same length, each with its own substituted numbers.
 */
export default function OhmsPowerRoutes() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.routes");
  const { a, f } = useOhmsModel();
  if (!a) return <OhmsIndicatorUnavailable title={t("title")} />;

  const routes = [
    { label: "V × I", sub: `${f(a.voltage)} × ${f(a.current)}`, v: a.powerViaVI },
    { label: "I² × R", sub: `${f(a.current)}² × ${f(a.resistance)}`, v: a.powerViaI2R },
    { label: "V² / R", sub: `${f(a.voltage)}² / ${f(a.resistance)}`, v: a.powerViaV2R },
  ];
  const max = Math.max(...routes.map((r) => Math.abs(r.v)), 1e-30);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {routes.map((r, i) => {
        const y = TOP + i * ROW;
        const w = (Math.abs(r.v) / max) * (R - L);
        return (
          <g key={r.label}>
            <text style={{ fontSize: svgPx(13) }} x={L - 8} y={y + 13} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {r.label}
            </text>
            <rect x={L} y={y} width={Math.max(1, w)} height={20} rx={5} className={CLS[i]} />
            <text style={{ fontSize: svgPx(12) }} x={L + w - 6} y={y + 14} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-white">
              {`${f(r.v)} W`}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={L} y={y + 34} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {r.sub}
            </text>
          </g>
        );
      })}
      <line x1={R} y1={TOP - 8} x2={R} y2={TOP + 2 * ROW + 28} strokeDasharray="4 3" strokeWidth={1.5} className="stroke-red-500 dark:stroke-red-400" />
      <text style={{ fontSize: svgPx(12) }} x={R} y={TOP - 12} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
        {`P = ${f(a.power)} W`}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={H - 8} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("footer")}
      </text>
    </svg>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...routes.map((r) => ({ label: r.label, value: `${r.sub} = ${f(r.v)} W` })),
        { label: "P", value: `${f(a.power)} W = ${f(a.power)} J/s`, emphasize: true },
        { label: t("perHour"), value: `${f(a.power)} W × 3600 s = ${f(a.power * 3600)} J` },
      ]}
    />
  );
}
