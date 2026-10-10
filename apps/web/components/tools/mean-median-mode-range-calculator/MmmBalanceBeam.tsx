"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import MmmIndicatorCard, { scaleX } from "./MmmIndicatorCard";
import { useMmmModel } from "./MmmLiveContext";

type Pivot = "mean" | "median" | "midrange";
const W = 360;
const H = 210;
const BEAM_Y = 120;

/**
 * Type #14 (Balance Indicator), animated: the data set as weights on a seesaw. Pick where the
 * pivot goes — on the mean the moments Σ(x − pivot) cancel exactly and the beam rests level; on
 * the median or the midrange the leftover moment tips it (animated) toward the heavier side.
 */
export default function MmmBalanceBeam() {
  const t = useTranslations("tools.mean-median-mode-range-calculator.education.lab.balance");
  const tr = useTranslations("tools.mean-median-mode-range-calculator.result");
  const tl = useTranslations("tools.mean-median-mode-range-calculator.live3d");
  const { a, f } = useMmmModel();
  const [pivot, setPivot] = useState<Pivot>("mean");
  if (!a) return null;

  const pv = pivot === "mean" ? a.mean : pivot === "median" ? a.median : a.midrange;
  const pad = Math.max(a.range * 0.12, 0.5);
  const sx = scaleX(a.min - pad, a.max + pad, 24, W - 24);
  const left = a.sorted.filter((v) => v < pv).reduce((s, v) => s + (pv - v), 0);
  const right = a.sorted.filter((v) => v > pv).reduce((s, v) => s + (v - pv), 0);
  const net = right - left;
  const scale = Math.max(1e-9, a.n * Math.max(a.range, 1e-9));
  const eps = 1e-9 * Math.max(1, scale);
  const deg = Math.abs(net) < eps ? 0 : Math.max(-14, Math.min(14, (net / scale) * 60));
  const verdict = Math.abs(net) < eps ? t("level") : net > 0 ? t("tipsRight") : t("tipsLeft");
  const px = sx(pv);

  const seen = new Map<number, number>();
  const block = 12;

  const beam = (
    <div className="w-full lg:w-[360px]">
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {(["mean", "median", "midrange"] as Pivot[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setPivot(k)}
            aria-pressed={pivot === k}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              pivot === k
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:border-blue-400 dark:border-zinc-600 dark:text-zinc-300"
            }`}
          >
            {k === "midrange" ? tl("midrange") : tr(k)}
          </button>
        ))}
      </div>
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
        <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${px}px ${BEAM_Y}px`, transformBox: "view-box", transition: "transform 700ms cubic-bezier(.34,1.56,.64,1)" }}>
          <rect x={14} y={BEAM_Y} width={W - 28} height={7} rx={3} className="fill-zinc-500 dark:fill-zinc-400" />
          {a.sorted.map((v, i) => {
            const k = seen.get(v) ?? 0;
            seen.set(v, k + 1);
            const side = v < pv ? "fill-rose-500 dark:fill-rose-400" : v > pv ? "fill-sky-500 dark:fill-sky-400" : "fill-zinc-400";
            return <rect key={i} x={sx(v) - block / 2} y={BEAM_Y - (k + 1) * (block + 1)} width={block} height={block} rx={2} className={side} />;
          })}
        </g>
        <polygon points={`${px},${BEAM_Y + 8} ${px - 16},${BEAM_Y + 40} ${px + 16},${BEAM_Y + 40}`} className="fill-blue-600 dark:fill-blue-400" />
        <rect x={0} y={BEAM_Y + 40} width={W} height={3} className="fill-zinc-300 dark:fill-zinc-700" />
        <text x={px} y={BEAM_Y + 58} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
          {`${t("pivot")} ${f(pv)}`}
        </text>
        <text x={18} y={22} fontSize={12} fontWeight={700} className="fill-rose-600 dark:fill-rose-400">
          {`← ${f(left)}`}
        </text>
        <text x={W - 18} y={22} textAnchor="end" fontSize={12} fontWeight={700} className="fill-sky-600 dark:fill-sky-400">
          {`${f(right)} →`}
        </text>
        <text x={W / 2} y={22} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
          {verdict}
        </text>
      </svg>
    </div>
  );

  return (
    <MmmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={beam}
      rows={[
        { label: t("pivot"), value: f(pv) },
        { label: t("leftMoment"), value: `Σ(${f(pv)} − x) = ${f(left)}` },
        { label: t("rightMoment"), value: `Σ(x − ${f(pv)}) = ${f(right)}` },
        { label: t("netMoment"), value: f(net) },
        { label: t("tilt"), value: `${f(deg, 1)}°` },
        { label: t("verdict"), value: verdict, emphasize: true },
      ]}
    />
  );
}
