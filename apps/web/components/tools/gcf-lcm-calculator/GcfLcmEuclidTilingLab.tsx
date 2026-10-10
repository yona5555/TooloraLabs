"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { euclidTiling, gcd2 } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import GcfLcmIndicatorCard from "./GcfLcmIndicatorCard";
import { useGcfLcmModel, useSetGcfLcmNumber } from "./GcfLcmLiveContext";

const W = 320;
const H = 230;
const STEP_MS = 260;
const LIGHT = ["#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899", "#84cc16"];
const DARK = ["#60a5fa", "#a78bfa", "#fbbf24", "#22d3ee", "#f472b6", "#a3e635"];

/**
 * The page's "wow" piece: Euclid's algorithm as geometry. Two sliders set the first two numbers
 * (writing straight into the inputs, so the Result, the 3D towers and every indicator follow);
 * the a × b rectangle is filled with the largest squares that fit, and the last, smallest square
 * is the GCF. "Play" lays the squares down one at a time in the order Euclid finds them.
 */
export default function GcfLcmEuclidTilingLab() {
  const t = useTranslations("tools.gcf-lcm-calculator.education.lab.tiling");
  const isDark = useIsDarkMode();
  const palette = isDark ? DARK : LIGHT;
  const { a, b, f } = useGcfLcmModel();
  const setNumber = useSetGcfLcmNumber();
  const [playStart, setPlayStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  const { squares, truncated } = useMemo(() => euclidTiling(a, b, 240), [a, b]);
  const g = gcd2(a, b);
  const total = squares.length;

  useEffect(() => {
    if (playStart === null) return;
    let raf = 0;
    const tick = (ts: number) => {
      setNow(ts);
      if (ts - playStart > total * STEP_MS + 400) setPlayStart(null);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playStart, total]);

  const shown = playStart === null ? total : Math.max(0, Math.min(total, Math.floor((now - playStart) / STEP_MS) + 1));
  const k = Math.min((W - 4) / a, (H - 4) / b);
  const ox = (W - a * k) / 2;
  const oy = (H - b * k) / 2;

  // Count squares per size, in Euclid order.
  const bySize: Array<{ size: number; count: number }> = [];
  for (const s of squares) {
    const last = bySize[bySize.length - 1];
    if (last && last.size === s.size) last.count++;
    else bySize.push({ size: s.size, count: 1 });
  }

  const sliderMax = (v: number) => Math.max(60, v);
  const slider = (label: string, value: number, idx: number) => (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        <span>{label}</span>
        <span dir="ltr" className="font-mono text-blue-700 dark:text-blue-300">{f(value)}</span>
      </span>
      <input
        type="range"
        min={1}
        max={sliderMax(value)}
        value={value}
        onChange={(e) => {
          setPlayStart(null);
          setNumber(idx, Number(e.target.value));
        }}
        className="mt-1 w-full accent-blue-600"
        aria-label={label}
      />
    </label>
  );

  const drawing = (
    <div className="w-full lg:w-[340px]">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ direction: "ltr" }} className="mx-auto block max-w-full" role="img" aria-label={t("title")}>
        <rect x={ox} y={oy} width={a * k} height={b * k} className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-800 dark:stroke-zinc-500" strokeWidth={1.5} />
        {squares.slice(0, shown).map((s, i) => {
          const isG = s.size === g;
          const px = s.size * k;
          return (
            <g key={i}>
              <rect
                x={ox + s.x * k}
                y={oy + s.y * k}
                width={px}
                height={px}
                fill={palette[s.step % palette.length]}
                fillOpacity={isG ? 0.95 : 0.55}
                stroke={isDark ? "#18181b" : "#ffffff"}
                strokeWidth={px > 6 ? 1.5 : 0.5}
              />
              {px >= 26 && (
                <text x={ox + (s.x + s.size / 2) * k} y={oy + (s.y + s.size / 2) * k + 4} textAnchor="middle" className="fill-zinc-900 font-mono text-[11px] font-bold dark:fill-white">
                  {f(s.size)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        {slider(t("sliderA"), a, 0)}
        {slider(t("sliderB"), b, 1)}
        <button
          type="button"
          onClick={() => setPlayStart(performance.now())}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <Play size={12} aria-hidden />
          {t("play")}
        </button>
      </div>
    </div>
  );

  return (
    <GcfLcmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={drawing}
      rows={[
        { label: t("rectangle"), value: `${f(a)} × ${f(b)} = ${f(a * b)}` },
        ...bySize.slice(0, 5).map((s) => ({ label: t("squaresOf", { size: f(s.size) }), value: `${f(s.count)} × ${f(s.size)}²` })),
        { label: t("totalSquares"), value: truncated ? `${f(total)}+` : f(total) },
        { label: t("areaCheck"), value: `${f(bySize.reduce((s, x) => s + x.count * x.size * x.size, 0))}${truncated ? "…" : ""}` },
        { label: t("smallest"), value: `GCF = ${f(g)}`, emphasize: true },
      ]}
    />
  );
}
