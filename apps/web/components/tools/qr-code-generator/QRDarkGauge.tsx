"use client";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;
const LO = 0.35;
const HI = 0.65;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/**
 * Type #8 (Gradient Gauge): share of dark modules in the whole symbol. The mask the encoder picks
 * (one of eight) is the one whose penalty score is lowest, and an even dark/light balance is one of
 * those penalty rules, so real codes sit near 50 %.
 */
export default function QRDarkGauge() {
  const t = useTranslations("tools.qr-code-generator.education.lab.dark");
  const { a, f, pct } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const total = a.size * a.size;
  const share = a.darkModules / total;
  const frac = Math.min(1, Math.max(0, (share - LO) / (HI - LO)));
  const [nx, ny] = pt(frac, R - 20);
  const zones = [
    { from: 0, to: 1 / 6, cls: "stroke-zinc-300 dark:stroke-zinc-600" },
    { from: 1 / 6, to: 5 / 6, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
    { from: 5 / 6, to: 1, cls: "stroke-zinc-500 dark:stroke-zinc-400" },
  ];
  // ISO/IEC 18004 rule N4: 10 penalty points for every full 5 % the dark share deviates from 50 %.
  const n4 = Math.floor(Math.abs(share * 100 - 50) / 5) * 10;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      {[0.35, 0.45, 0.5, 0.55, 0.65].map((v) => {
        const [x, y] = pt((v - LO) / (HI - LO), R + 22);
        return (
          <text key={v} x={x} y={Number(y) + 4} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
            {Math.round(v * 100)}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 38} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {pct(a.darkModules, total)}
      </text>
    </svg>
  );

  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={0} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        { label: t("dark"), value: `${f(a.darkModules)} / ${f(total)}` },
        { label: t("dataDark"), value: pct(a.regionDark.data, a.regionCounts.data) },
        { label: t("mask"), value: String(a.mask) },
        { label: t("n4"), value: String(n4) },
        { label: t("balance"), value: `${share >= 0.5 ? "+" : "−"}${f(Math.abs(share - 0.5) * 100, 1)} pt`, emphasize: true },
      ]}
    />
  );
}
