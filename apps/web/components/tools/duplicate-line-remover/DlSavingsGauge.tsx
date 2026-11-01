"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/** Type #8 (Gradient Gauge): the share of non-blank lines that were duplicates and got removed. */
export default function DlSavingsGauge() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.gauge");
  const { out, f } = useDlModel();
  if (!out || out.totalLines === 0) return <DlIndicatorUnavailable title={t("title")} />;

  const share = out.removedCount / out.totalLines;
  const [nx, ny] = pt(share, R - 20);
  const zones = [
    { from: 0, to: 0.1, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
    { from: 0.1, to: 0.4, cls: "stroke-amber-400 dark:stroke-amber-500" },
    { from: 0.4, to: 1, cls: "stroke-rose-400 dark:stroke-rose-500" },
  ];

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      {[0, 25, 50, 75, 100].map((v) => {
        const [x, y] = pt(v / 100, R + 24);
        return (
          <text style={{ fontSize: svgPx(12) }} key={v} x={x} y={Number(y) + 4} textAnchor={Number(x) > W - 40 ? "end" : Number(x) < 40 ? "start" : "middle"} className="fill-zinc-500 dark:fill-zinc-400">
            {v}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text style={{ fontSize: svgPx(22) }} x={CX} y={CY - 38} textAnchor="middle" fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {f(share * 100, 1)}%
      </text>
    </FitSvg>
  );

  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={0}
      indicator={svg}
      rows={[
        { label: t("total"), value: f(out.totalLines) },
        { label: t("unique"), value: f(out.uniqueLines) },
        { label: t("removed"), value: f(out.removedCount) },
        { label: t("formula"), value: `${f(out.removedCount)} / ${f(out.totalLines)}` },
        { label: t("share"), value: `${f(share * 100, 2)}%`, emphasize: true },
      ]}
    />
  );
}
