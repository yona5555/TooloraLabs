"use client";
import { useTranslations } from "next-intl";
import { STANDARD_FUSE_RATINGS } from "@tooloralabs/tools";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { useOhmsModel } from "./OhmsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const L = 36;
const R = 286;
const T = 26;
const B = 186;
const TOP_A = 32;

/**
 * Type #13 (Stepped Diagram): the standard fuse ratings as a staircase with your current as a
 * horizontal line. Steps under the line would blow at this current; the first step above it is
 * the fuse to fit (square-root scale so the small ratings stay readable).
 */
export default function OhmsFuseSteps() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.fuse");
  const { a, f } = useOhmsModel();
  if (!a) return <OhmsIndicatorUnavailable title={t("title")} />;

  const I = Math.abs(a.current);
  const n = STANDARD_FUSE_RATINGS.length;
  const stepW = (R - L) / n;
  const sy = (amps: number) => B - Math.sqrt(Math.min(amps, TOP_A) / TOP_A) * (B - T);
  const yI = sy(I);
  const idx = STANDARD_FUSE_RATINGS.findIndex((r) => r === a.fuse);
  const below = idx > 0 ? STANDARD_FUSE_RATINGS[idx - 1] : null;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={L} y1={B} x2={R} y2={B} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {STANDARD_FUSE_RATINGS.map((r, i) => {
        const x = L + i * stepW;
        const y = sy(r);
        const chosen = i === idx && !a.fuseExceeded;
        const blows = r < I;
        const cls = chosen ? "fill-emerald-500 dark:fill-emerald-400" : blows ? "fill-zinc-300 dark:fill-zinc-700" : "fill-blue-200 dark:fill-blue-900";
        return (
          <g key={r}>
            <rect x={x + 2} y={y} width={stepW - 4} height={B - y} rx={3} className={cls} />
            <text style={{ fontSize: svgPx(12) }} x={x + stepW / 2} y={y - 5} textAnchor="middle" fontWeight={chosen ? 700 : 500} fontFamily="var(--font-mono)" className={chosen ? "fill-emerald-700 dark:fill-emerald-300" : "fill-zinc-500 dark:fill-zinc-400"}>
              {`${r}`}
            </text>
          </g>
        );
      })}
      <line x1={L} y1={yI} x2={R} y2={yI} strokeWidth={2} strokeDasharray="5 3" className="stroke-red-600 dark:stroke-red-400" />
      <text style={{ fontSize: svgPx(12) }} x={R + 4} y={yI + 4} fontWeight={700} fontFamily="var(--font-mono)" className="fill-red-600 dark:fill-red-400">
        {`${f(I, 2)} A`}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={L - 6} y={B + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
        0
      </text>
      <text style={{ fontSize: svgPx(12) }} x={(L + R) / 2} y={B + 18} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
    </svg>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "I", value: `${f(I)} A` },
        a.fuseExceeded
          ? { label: t("fuse"), value: `> ${f(a.fuse)} A`, emphasize: true, note: t("exceeded") }
          : { label: t("fuse"), value: `${f(a.fuse)} A`, emphasize: true },
        { label: t("headroom"), value: a.fuseExceeded ? "—" : `${f(a.fuse)} / ${f(I)} = ${f(I > 0 ? a.fuse / I : 0, 2)} ×` },
        ...(below !== null ? [{ label: t("blows", { rating: below }), value: `${f(below)} A < ${f(I)} A` }] : []),
      ]}
    />
  );
}
