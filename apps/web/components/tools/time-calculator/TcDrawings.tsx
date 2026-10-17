"use client";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { px2 } from "@/components/tool-ui/indicator-kit/SvgBits";
import { C } from "./state";

const axisText = "fill-zinc-500 dark:fill-zinc-400";
const valueText = "fill-zinc-800 dark:fill-zinc-100";
const DAY = 86400;

/* ── 24-hour shift dial (drag the start / end handles) ─────────────────────────── */

type DialProps = {
  start: number;
  end: number;
  /** Whole days added on top of the arc (multi-day spans / long durations). */
  extraDays?: number;
  /** Seconds the real elapsed time differs from the wall reading (DST); drawn as a violet sliver at the end. */
  dstDelta?: number;
  hourLabel: (h: number) => string;
  center: [string, string, string];
  startLabel: string;
  endLabel: string;
  onDrag?: (which: "start" | "end", seconds: number) => void;
  size?: number;
  fill?: boolean;
  ariaLabel: string;
};

const R = 98;
const CX = 130;
const CY = 130;
const ang = (sec: number) => (((sec % DAY) + DAY) % DAY) / DAY * 2 * Math.PI;
const pt = (sec: number, r: number) => ({ x: px2(CX + r * Math.sin(ang(sec))), y: px2(CY - r * Math.cos(ang(sec))) });

function arcPath(from: number, to: number, r: number) {
  let span = (((to - from) % DAY) + DAY) % DAY;
  if (span === 0) span = DAY - 1;
  const a = pt(from, r);
  const b = pt(from + span, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${span > DAY / 2 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

export function ShiftDial({ start, end, extraDays = 0, dstDelta = 0, hourLabel, center, startLabel, endLabel, onDrag, size = 280, fill, ariaLabel }: DialProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  const toSeconds = (e: ReactPointerEvent<SVGSVGElement>) => {
    const box = ref.current!.getBoundingClientRect();
    const scale = 260 / Math.min(box.width, box.height);
    const x = (e.clientX - box.left - box.width / 2) * scale;
    const y = (e.clientY - box.top - box.height / 2) * scale;
    let a = Math.atan2(x, -y);
    if (a < 0) a += 2 * Math.PI;
    return (Math.round(((a / (2 * Math.PI)) * DAY) / 900) * 900) % DAY;
  };
  const down = (which: "start" | "end") => (e: ReactPointerEvent<SVGElement>) => {
    if (!onDrag) return;
    e.preventDefault();
    ref.current?.setPointerCapture?.(e.pointerId);
    setDragging(which);
  };
  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragging && onDrag) onDrag(dragging, toSeconds(e));
  };
  const up = () => setDragging(null);

  const s = pt(start, R);
  const en = pt(end, R);
  const dstFrom = end;
  const dstTo = end + Math.abs(dstDelta);

  return (
    <svg
      ref={ref}
      viewBox="0 0 260 260"
      width={fill ? "100%" : size}
      height={fill ? "100%" : size}
      style={{ direction: "ltr", touchAction: onDrag ? "none" : undefined }}
      role="img"
      aria-label={ariaLabel}
      className="mx-auto max-w-full select-none"
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={up}
    >
      {/* night band 18:00 → 06:00 */}
      <path d={arcPath(18 * 3600, 6 * 3600, R - 22)} fill="none" stroke={C.night} strokeOpacity={0.18} strokeWidth={14} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={18} />
      {Array.from({ length: 24 }, (_, h) => {
        const a = pt(h * 3600, R + 12);
        const b = pt(h * 3600, R + (h % 3 === 0 ? 18 : 15));
        const lbl = pt(h * 3600, R - 38);
        return (
          <g key={h}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={0.4} />
            {h % 3 === 0 && (
              <text x={lbl.x} y={lbl.y + 3} textAnchor="middle" fontSize={9} className={axisText}>
                {hourLabel(h)}
              </text>
            )}
          </g>
        );
      })}
      <path d={arcPath(start, end, R)} fill="none" stroke={C.main} strokeWidth={18} strokeLinecap="butt" style={{ transition: dragging ? undefined : "all 300ms ease" }} />
      {dstDelta !== 0 && <path d={arcPath(dstFrom, dstTo, R + 14)} fill="none" stroke={C.dst} strokeWidth={6} />}
      {extraDays > 0 && <circle cx={CX} cy={CY} r={R + 24} fill="none" stroke={C.main} strokeOpacity={0.35} strokeDasharray="3 4" strokeWidth={2} />}
      <text x={CX} y={CY - 18} textAnchor="middle" fontSize={10} className={axisText}>{center[0]}</text>
      <text x={CX} y={CY + 6} textAnchor="middle" fontSize={22} fontWeight={800} className={valueText}>{center[1]}</text>
      <text x={CX} y={CY + 24} textAnchor="middle" fontSize={10} fontWeight={700} fill={dstDelta ? C.dst : C.main}>{center[2]}</text>
      {[
        { p: s, which: "start" as const, color: C.add, label: startLabel },
        { p: en, which: "end" as const, color: C.main, label: endLabel },
      ].map((h) => (
        <g key={h.which} onPointerDown={down(h.which)} style={{ cursor: onDrag ? "grab" : undefined }}>
          <circle cx={h.p.x} cy={h.p.y} r={onDrag ? 13 : 10} fill={h.color} stroke="white" strokeWidth={2.5} />
          <text x={h.p.x} y={h.p.y + 3.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="white">{h.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Running-total waterfall (timesheet) ───────────────────────────────────────── */

export function Waterfall({
  items,
  running,
  total,
  totalLabel,
  fmt,
  fill,
  width = 400,
  height = 260,
  ariaLabel,
}: {
  items: { label: string; value: number }[];
  running: number[];
  total: number;
  totalLabel: string;
  fmt: (sec: number) => string;
  fill?: boolean;
  width?: number;
  height?: number;
  ariaLabel: string;
}) {
  const W = 400;
  const H = 260;
  const T = 22;
  const B = 34;
  const levels = [0, ...running, total];
  const max = Math.max(1, ...levels);
  const min = Math.min(0, ...levels);
  const y = (v: number) => T + ((max - v) / (max - min)) * (H - T - B);
  const n = items.length + 1;
  const slot = (W - 16) / n;
  const bw = Math.min(46, slot * 0.66);
  const x = (i: number) => 8 + i * slot + slot / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={fill ? "100%" : width} height={fill ? "100%" : height} style={{ direction: "ltr" }} role="img" aria-label={ariaLabel} className="max-w-full">
      <line x1={4} x2={W - 4} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity={0.35} />
      {items.map((it, i) => {
        const from = i === 0 ? 0 : running[i - 1];
        const to = running[i];
        const top = y(Math.max(from, to));
        const h = Math.max(2, Math.abs(y(from) - y(to)));
        return (
          <g key={i}>
            <rect x={x(i) - bw / 2} y={top} width={bw} height={h} rx={3} fill={it.value < 0 ? C.sub : C.add} fillOpacity={0.85} style={{ transition: "all 350ms ease" }} />
            {i < items.length - 1 && <line x1={x(i) + bw / 2} x2={x(i + 1) - bw / 2} y1={y(to)} y2={y(to)} stroke="currentColor" strokeOpacity={0.4} strokeDasharray="3 3" />}
            <text x={x(i)} y={top - 5} textAnchor="middle" fontSize={9} fontWeight={700} fill={it.value < 0 ? C.sub : C.add}>
              {it.value < 0 ? "−" : "+"}
              {fmt(Math.abs(it.value))}
            </text>
            <text x={x(i)} y={H - 18} textAnchor="middle" fontSize={9} className={axisText}>
              {it.label.length > 10 ? `${it.label.slice(0, 9)}…` : it.label}
            </text>
          </g>
        );
      })}
      <rect x={x(n - 1) - bw / 2} y={y(Math.max(0, total))} width={bw} height={Math.max(2, Math.abs(y(0) - y(total)))} rx={3} fill={C.main} style={{ transition: "all 350ms ease" }} />
      <text x={x(n - 1)} y={y(Math.max(0, total)) - 5} textAnchor="middle" fontSize={10} fontWeight={800} fill={C.main}>{fmt(total)}</text>
      <text x={x(n - 1)} y={H - 18} textAnchor="middle" fontSize={9} fontWeight={700} className={valueText}>{totalLabel}</text>
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={8.5} className={axisText}>{`Σ = ${fmt(total)}`}</text>
    </svg>
  );
}

/* ── Week bars (regular + overtime stacked) ────────────────────────────────────── */

export type WeekBar = { key: number; label: string; regular: number; overtime: number; on: boolean; overnight: boolean };

export function WeekBars({
  days,
  dailyThreshold,
  fmt,
  onToggle,
  fill,
  width = 400,
  height = 250,
  ariaLabel,
  offLabel,
}: {
  days: WeekBar[];
  dailyThreshold?: number | null;
  fmt: (sec: number) => string;
  onToggle?: (weekday: number) => void;
  fill?: boolean;
  width?: number;
  height?: number;
  ariaLabel: string;
  offLabel: string;
}) {
  const W = 400;
  const H = 250;
  const T = 20;
  const B = 32;
  const max = Math.max(10 * 3600, ...days.map((d) => d.regular + d.overtime), (dailyThreshold ?? 0) * 1.1);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const slot = (W - 30) / 7;
  const bw = slot * 0.62;
  const x = (i: number) => 26 + i * slot + slot / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={fill ? "100%" : width} height={fill ? "100%" : height} style={{ direction: "ltr" }} role="img" aria-label={ariaLabel} className="max-w-full">
      {[0, 4, 8, 12].filter((h) => h * 3600 <= max).map((h) => (
        <g key={h}>
          <line x1={22} x2={W - 4} y1={y(h * 3600)} y2={y(h * 3600)} stroke="currentColor" strokeOpacity={0.1} />
          <text x={18} y={y(h * 3600) + 3} textAnchor="end" fontSize={8.5} className={axisText}>{`${h}h`}</text>
        </g>
      ))}
      {dailyThreshold ? <line x1={22} x2={W - 4} y1={y(dailyThreshold)} y2={y(dailyThreshold)} stroke={C.ot} strokeDasharray="5 3" strokeWidth={1.5} /> : null}
      {days.map((d, i) => {
        const total = d.regular + d.overtime;
        return (
          <g key={d.key} onClick={onToggle ? () => onToggle(d.key) : undefined} style={{ cursor: onToggle ? "pointer" : undefined }}>
            <rect x={x(i) - slot / 2} y={T} width={slot} height={H - T - B} fill="transparent" />
            {d.on ? (
              <>
                <rect x={x(i) - bw / 2} y={y(d.regular)} width={bw} height={Math.max(1, y(0) - y(d.regular))} rx={3} fill={C.main} fillOpacity={0.85} style={{ transition: "all 350ms ease" }} />
                {d.overtime > 0 && <rect x={x(i) - bw / 2} y={y(total)} width={bw} height={y(d.regular) - y(total)} rx={3} fill={C.ot} style={{ transition: "all 350ms ease" }} />}
                <text x={x(i)} y={y(total) - 5} textAnchor="middle" fontSize={9.5} fontWeight={700} className={valueText}>{fmt(total)}</text>
                {d.overnight && <text x={x(i)} y={y(0) - 6} textAnchor="middle" fontSize={10} fill="white">☾</text>}
              </>
            ) : (
              <text x={x(i)} y={y(0) - 8} textAnchor="middle" fontSize={8.5} className={axisText}>{offLabel}</text>
            )}
            <text x={x(i)} y={H - 16} textAnchor="middle" fontSize={10} fontWeight={d.on ? 700 : 400} className={d.on ? valueText : axisText}>{d.label}</text>
          </g>
        );
      })}
      <line x1={22} x2={W - 4} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity={0.4} />
    </svg>
  );
}

/* ── Hour pie (decimal hours as whole hours + a fraction of an hour) ───────────── */

export function HourPie({
  seconds,
  rounded,
  decimalLabel,
  hmsLabel,
  fill,
  size = 260,
  ariaLabel,
}: {
  seconds: number;
  rounded?: number;
  decimalLabel: string;
  hmsLabel: string;
  fill?: boolean;
  size?: number;
  ariaLabel: string;
}) {
  const whole = Math.floor(seconds / 3600);
  const frac = (seconds % 3600) / 3600;
  const r = 80;
  const cx = 130;
  const cy = 118;
  const at = (f: number, rr: number) => ({ x: px2(cx + rr * Math.sin(f * 2 * Math.PI)), y: px2(cy - rr * Math.cos(f * 2 * Math.PI)) });
  const e = at(frac, r);
  const slice = frac <= 0 ? "" : frac >= 0.9999 ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z` : `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${e.x} ${e.y} Z`;
  const rf = rounded !== undefined ? (rounded % 3600) / 3600 : null;
  const dots = Math.min(whole, 24);
  return (
    <svg viewBox="0 0 260 260" width={fill ? "100%" : size} height={fill ? "100%" : size} style={{ direction: "ltr" }} role="img" aria-label={ariaLabel} className="mx-auto max-w-full">
      <circle cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity={0.06} stroke="currentColor" strokeOpacity={0.25} />
      {slice && <path d={slice} fill={C.main} fillOpacity={0.8} style={{ transition: "all 300ms ease" }} />}
      {Array.from({ length: 60 }, (_, m) => {
        const a = at(m / 60, r + 3);
        const b = at(m / 60, r + (m % 15 === 0 ? 12 : m % 5 === 0 ? 8 : 5));
        const l = at(m / 60, r + 21);
        return (
          <g key={m}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeOpacity={m % 5 === 0 ? 0.55 : 0.25} />
            {m % 15 === 0 && (
              <text x={l.x} y={l.y + 3} textAnchor="middle" fontSize={8.5} className={axisText}>{`${m}′ · .${String(m / 60 * 100).padStart(2, "0")}`}</text>
            )}
          </g>
        );
      })}
      {rf !== null && (
        <line x1={cx} y1={cy} x2={at(rf, r + 4).x} y2={at(rf, r + 4).y} stroke={C.ot} strokeWidth={2.5} strokeDasharray="4 2" />
      )}
      <circle cx={cx} cy={cy} r={34} className="fill-white dark:fill-zinc-900" />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={17} fontWeight={800} className={valueText}>{decimalLabel}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.main}>{hmsLabel}</text>
      {Array.from({ length: dots }, (_, i) => (
        <circle key={i} cx={px2(130 - ((dots - 1) * 9) / 2 + i * 9)} cy={242} r={3.5} fill={C.main} />
      ))}
      {whole > 24 && <text x={232} y={245} fontSize={9} className={axisText}>{`+${whole - 24}`}</text>}
    </svg>
  );
}
