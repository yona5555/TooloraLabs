"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { Pause, Play } from "lucide-react";
import { dimmerCircuit } from "@tooloralabs/tools";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { FIELDS_BY_PAIR, SYMBOL, UNIT, toInput, useOhmsLive, useOhmsModel, type OhmsQuantity } from "./OhmsLiveContext";

const W = 360;
const H = 240;
const L = 44;
const R = 316;
const T = 62;
const B = 196;
const SIDES = [B - T, R - L, B - T, R - L];
const PERIM = SIDES.reduce((s, v) => s + v, 0);
const DOTS = 18;
const RANGE: Record<OhmsQuantity, [number, number]> = { voltage: [-1, 3], current: [-3, 2], resistance: [-1, 6], power: [-3, 4] };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Point at arc length s, conventional direction: up the battery side, across the top, down, back along the bottom. */
function along(s: number): [number, number] {
  let d = ((s % PERIM) + PERIM) % PERIM;
  if (d <= SIDES[0]) return [L, B - d];
  d -= SIDES[0];
  if (d <= SIDES[1]) return [L + d, T];
  d -= SIDES[1];
  if (d <= SIDES[2]) return [R, T + d];
  d -= SIDES[2];
  return [R - d, B];
}

/**
 * The page's "wow" piece: your source and resistance drive a bulb through a dimmer (a series
 * rheostat Rd). Charges flow round the loop at a speed set by the current; the bulb glows with
 * the share of full power it receives, (R / (R + Rd))². The two sliders for the known values
 * write back into the calculator, so the Result card, the 3D circuit and every indicator follow.
 */
export default function OhmsDimmerLab() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.dimmer");
  const rtl = useLocale() === "ar";
  const { setDim } = useOhmsLive();
  const { draft, a, f } = useOhmsModel();
  const [k, setK] = useState(1);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = useRef<number | null>(null);

  const d = a ? dimmerCircuit(a.voltage, a.resistance, k * a.resistance) : null;
  const speed = d ? 20 + 160 * clamp((Math.log10(Math.max(Math.abs(d.current), 1e-30)) + 3) / 5, 0, 1) : 0;
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    last.current = null;
    const tick = (now: number) => {
      if (last.current === null && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        // Reduced motion: keep the charges still.
        setPlaying(false);
        return;
      }
      const dt = last.current === null ? 0 : Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      setPhase((p) => (p + dt * speedRef.current) % PERIM);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  if (!a || !d) return <OhmsIndicatorUnavailable title={t("title")} />;

  const glow = d.brightness;
  const knobs = FIELDS_BY_PAIR[draft.pair];
  const wiper = 150 + (60 * k) / 9;
  const lab = (
    <div className="w-full max-w-[360px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <defs>
          <radialGradient id="ohms-bulb-glow">
            <stop offset="0%" stopColor="#fde047" stopOpacity={0.95} />
            <stop offset="60%" stopColor="#facc15" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
          </radialGradient>
        </defs>
        {/* Formula/number runs isolated as LTR and set in mono; the word keeps the sans font (mono breaks Arabic joining). */}
        <text x={W / 2} y={18} textAnchor="middle" direction={rtl ? "rtl" : "ltr"} fontSize={13} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
          <tspan fontFamily="ui-monospace, monospace">{ltr(`I = ${f(d.current)} A`)}</tspan>
          <tspan>{` · ${t("brightness")} `}</tspan>
          <tspan fontFamily="ui-monospace, monospace">{ltr(`${f(glow * 100, 1)}%`)}</tspan>
        </text>
        {/* wire loop */}
        <rect x={L} y={T} width={R - L} height={B - T} fill="none" strokeWidth={3} className="stroke-amber-700 dark:stroke-amber-500" />
        {/* battery on the left side */}
        <rect x={L - 14} y={(T + B) / 2 - 18} width={28} height={36} className="fill-white dark:fill-zinc-900" />
        <line x1={L - 14} y1={(T + B) / 2 - 6} x2={L + 14} y2={(T + B) / 2 - 6} strokeWidth={3} className="stroke-zinc-800 dark:stroke-zinc-100" />
        <line x1={L - 8} y1={(T + B) / 2 + 6} x2={L + 8} y2={(T + B) / 2 + 6} strokeWidth={5} className="stroke-zinc-800 dark:stroke-zinc-100" />
        <text x={L + 20} y={(T + B) / 2 - 2} fontSize={11} fontWeight={700} className="fill-red-600 dark:fill-red-400">+</text>
        <text x={L + 18} y={(T + B) / 2 + 26} fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-blue-700 dark:fill-blue-300">
          {`${f(a.voltage)} V`}
        </text>
        {/* bulb on the top side */}
        <circle cx={W / 2} cy={T} r={34 + 18 * glow} fill="url(#ohms-bulb-glow)" opacity={glow} />
        <circle cx={W / 2} cy={T} r={16} strokeWidth={2} className="fill-white stroke-zinc-500 dark:fill-zinc-900 dark:stroke-zinc-300" style={{ fill: glow > 0.02 ? `rgba(250, 204, 21, ${0.15 + 0.85 * glow})` : undefined }} />
        <path d={`M ${W / 2 - 7} ${T + 5} q 3.5 -12 7 0 q 3.5 -12 7 0`} fill="none" strokeWidth={1.5} className="stroke-zinc-700 dark:stroke-zinc-200" />
        <text x={W / 2} y={T + 32} textAnchor="middle" fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
          {`R = ${f(a.resistance)} Ω · ${f(d.loadPower)} W`}
        </text>
        {/* dimmer (rheostat) on the bottom side */}
        <rect x={146} y={B - 9} width={68} height={18} className="fill-white dark:fill-zinc-900" />
        <path
          d={`M 146 ${B} ${Array.from({ length: 8 }, (_, i) => `L ${150 + i * 8} ${B + (i % 2 ? 7 : -7)}`).join(" ")} L 214 ${B}`}
          fill="none"
          strokeWidth={2}
          className="stroke-zinc-700 dark:stroke-zinc-200"
        />
        <line x1={wiper} y1={B + 22} x2={wiper} y2={B + 6} strokeWidth={2} className="stroke-violet-600 dark:stroke-violet-400" />
        <path d={`M ${wiper - 4} ${B + 11} L ${wiper + 4} ${B + 11} L ${wiper} ${B + 5} z`} className="fill-violet-600 dark:fill-violet-400" />
        <text x={W / 2} y={B + 36} textAnchor="middle" fontSize={10.5} fontFamily="ui-monospace, monospace" className="fill-violet-700 dark:fill-violet-300">
          {`Rd = ${f(k * a.resistance)} Ω · ${f(d.dimmerPower)} W`}
        </text>
        {/* flowing charges */}
        {Array.from({ length: DOTS }, (_, i) => {
          const [x, y] = along(phase + (i * PERIM) / DOTS);
          return <circle key={i} cx={x} cy={y} r={3.2} className="fill-emerald-500 dark:fill-emerald-400" />;
        })}
      </svg>
      <div className="mt-2 space-y-2">
        <label className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
          <span dir="ltr" className="w-6 shrink-0 font-mono font-semibold">Rd</span>
          <input
            type="range"
            dir="ltr"
            min={0}
            max={9}
            step={0.05}
            value={k}
            aria-label={t("dimmerSlider")}
            onChange={(e) => setK(Number(e.target.value))}
            className="h-2 min-w-0 flex-1 cursor-pointer accent-violet-600"
          />
          <span dir="ltr" className="w-28 shrink-0 text-end font-mono">{`${f(k, 2)} × R`}</span>
        </label>
        {knobs.map((q) => {
          const [lo, hi] = RANGE[q];
          const v = clamp(Math.log10(Math.max(Math.abs(a[q]), 1e-12)), lo, hi);
          return (
            <label key={q} className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-300">
              <span dir="ltr" className="w-6 shrink-0 font-mono font-semibold">{SYMBOL[q]}</span>
              <input
                type="range"
                dir="ltr"
                min={lo}
                max={hi}
                step={0.01}
                value={v}
                aria-label={t(`slider.${q}`)}
                onChange={(e) => setDim(q, toInput(10 ** Number(e.target.value)))}
                className="h-2 min-w-0 flex-1 cursor-pointer accent-blue-600"
              />
              <span dir="ltr" className="w-28 shrink-0 text-end font-mono">{`${f(a[q])} ${UNIT[q]}`}</span>
            </label>
          );
        })}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? t("pause") : t("play")}
        </button>
      </div>
    </div>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={lab}
      rows={[
        { label: t("total"), value: `${f(a.resistance)} + ${f(k * a.resistance)} = ${f(d.total)} Ω` },
        { label: t("current"), value: `${f(a.voltage)} / ${f(d.total)} = ${f(d.current)} A` },
        { label: t("bulbVoltage"), value: `${f(d.current)} × ${f(a.resistance)} = ${f(d.loadVoltage)} V` },
        { label: t("bulbPower"), value: `${f(d.current)} × ${f(d.loadVoltage)} = ${f(d.loadPower)} W`, emphasize: true },
        { label: t("dimmerPower"), value: `${f(d.dimmerPower)} W`, note: t("dimmerNote") },
        { label: t("brightness"), value: `(${f(a.resistance)} / ${f(d.total)})² = ${f(glow * 100, 1)}%` },
      ]}
    />
  );
}
