"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import { useCircleRadius } from "./CircleLiveContext";

const W = 380;
const H = 192;
const R = 40;
const X0 = 46;
const BASE = 118;
const DURATION = 3200;

/**
 * §31 type 2 (flow arrow with embedded numbers), animated: the circle rolls along the line and
 * lays its rim down. The laid length passes the d, 2d and 3d marks and stops at πd = C — the
 * live numbers come from the tool's current radius. Play animates; the slider scrubs.
 */
export default function CircleUnroll() {
  const t = useTranslations("tools.circle-calculator.ind");
  const { r, fmt } = useCircleRadius();
  const { f, n } = fmt;
  const [p, setP] = useState(0.68);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const pRef = useRef(p);
  useEffect(() => {
    pRef.current = p;
  }, [p]);

  useEffect(() => {
    if (!playing) return;
    let start: number | null = null;
    const from = pRef.current >= 0.999 ? 0 : pRef.current;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const next = Math.min(1, from + (ts - start) / DURATION);
      setP(next);
      if (next < 1) raf.current = requestAnimationFrame(step);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const d = 2 * r;
  const C = Math.PI * d;
  const phi = p * 2 * Math.PI;
  const cx = X0 + phi * R;
  const cy = BASE - R;
  const pt = (deg: number) => [cx + R * Math.cos((deg * Math.PI) / 180), cy + R * Math.sin((deg * Math.PI) / 180)];
  const phiDeg = p * 360;
  const [sx, sy] = pt(90 + phiDeg);
  const [ex, ey] = pt(450);
  const remaining = 360 - phiDeg;
  const arc = `M ${sx} ${sy} A ${R} ${R} 0 ${remaining > 180 ? 1 : 0} 1 ${ex} ${ey}`;
  const endX = X0 + 2 * Math.PI * R;

  return (
    <IndicatorCard
      id="unroll"
      title={t("unroll.title")}
      heading={t("unroll.heading")}
      intro={t("unroll.intro")}
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? t("unroll.pause") : t("unroll.play")}
          </button>
          <label className="flex min-w-[180px] flex-1 items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {t("unroll.progress")}
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(p * 1000)}
              onChange={(e) => {
                setPlaying(false);
                setP(Number(e.target.value) / 1000);
              }}
              className="flex-1 accent-blue-600"
            />
            <span dir="ltr" className="w-12 text-end font-mono">{f(p * 100, 0)}%</span>
          </label>
        </div>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("unroll.rowDiameter"), value: `d = ${f(d)}` },
          { label: t("unroll.rowRolled"), value: `${f(phiDeg, 0)}°` },
          { label: t("unroll.rowLaid"), value: `${n(p, 3)} × ${n(C)} = ${f(p * C)}` },
          { label: t("unroll.rowLeft"), value: f(C - p * C) },
          { label: t("unroll.rowInD"), value: `${f((p * C) / d, 4)} d` },
          { label: t("unroll.rowFull"), value: `π × ${n(d)} = ${f(C)}`, emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto max-w-full" role="img" aria-label={t("unroll.aria")}>
          {/* Ground line and the d marks. */}
          <line x1={X0 - 12} y1={BASE} x2={W - 8} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth={2} />
          {[1, 2, 3].map((k) => (
            <g key={k}>
              <line x1={X0 + k * 2 * R} y1={BASE - 6} x2={X0 + k * 2 * R} y2={BASE + 8} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={1.5} />
              <text x={X0 + k * 2 * R} y={BASE + 22} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">{`${k}d`}</text>
              <text x={X0 + k * 2 * R} y={BASE + 35} textAnchor="middle" className="fill-zinc-400 font-mono text-[9px] dark:fill-zinc-500">{n(k * d)}</text>
            </g>
          ))}
          <line x1={endX} y1={BASE - 10} x2={endX} y2={BASE + 10} className="stroke-amber-500" strokeWidth={2} />
          <text x={endX} y={BASE + 52} textAnchor="middle" className="fill-amber-600 font-mono text-[10px] font-bold dark:fill-amber-400">πd = C</text>
          <text x={endX} y={BASE + 65} textAnchor="middle" className="fill-amber-600 font-mono text-[9px] dark:fill-amber-400">{n(C)}</text>
          <line x1={X0} y1={BASE - 6} x2={X0} y2={BASE + 8} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={1.5} />
          <text x={X0} y={BASE + 22} textAnchor="middle" className="fill-zinc-500 font-mono text-[10px] dark:fill-zinc-400">0</text>
          {/* The laid-down rim. */}
          <line x1={X0} y1={BASE} x2={cx} y2={BASE} className="stroke-amber-500" strokeWidth={4} strokeLinecap="round" />
          {/* The rolling circle: filled disk, remaining rim, spoke to the starting point. */}
          <circle cx={cx} cy={cy} r={R} className="fill-blue-500/15 dark:fill-blue-400/15" />
          {p < 0.001 ? (
            <circle cx={cx} cy={cy} r={R} fill="none" className="stroke-amber-500" strokeWidth={4} />
          ) : p < 0.999 ? (
            <path d={arc} fill="none" className="stroke-amber-500" strokeWidth={4} strokeLinecap="round" />
          ) : null}
          <circle cx={cx} cy={cy} r={R} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={1.5} />
          <line x1={cx} y1={cy} x2={sx} y2={sy} className="stroke-red-600 dark:stroke-red-400" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={2.5} className="fill-zinc-700 dark:fill-zinc-200" />
          <text x={cx} y={cy - R - 8} textAnchor="middle" className="fill-zinc-700 font-mono text-[11px] font-semibold dark:fill-zinc-200">{`${n(p * C)} / ${n(C)}`}</text>
        </svg>
      </div>
    </IndicatorCard>
  );
}
