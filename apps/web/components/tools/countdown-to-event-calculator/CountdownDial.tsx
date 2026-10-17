"use client";
import type { Derived } from "./model";
import { num, pct, two } from "./model";

const S = 260;
const C = S / 2;
const R_OUT = 100;
const R_SEC = 78;

function polar(r: number, frac: number) {
  const a = -Math.PI / 2 + frac * 2 * Math.PI;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
}

function arcPath(r: number, frac: number) {
  const f = Math.min(0.9999, Math.max(0, frac));
  const [x0, y0] = polar(r, 0);
  const [x1, y1] = polar(r, f);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${x1} ${y1}`;
}

/**
 * Live countdown dial: the outer arc is the share of the wait already elapsed since the progress
 * start (with the 100/30/7/1-day milestones as ticks), the inner ring sweeps the seconds, and the
 * centre ticks the days and h:m:s. Numbers only inside the SVG; words live in the caption.
 */
export default function CountdownDial({ d }: { d: Derived }) {
  const span = d.target.utcMs - d.startMs;
  const marks = d.milestones
    .filter((m) => m.utcMs > d.startMs && m.utcMs < d.target.utcMs && m.key !== "h1")
    .map((m) => ({ ...m, frac: (m.utcMs - d.startMs) / span }));
  const sec = d.b.seconds;
  const elapsedColor = d.b.isPast ? "#10b981" : "#2563eb";

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" role="img" aria-label={`${d.b.days} d ${two(d.b.hours)}:${two(d.b.minutes)}:${two(d.b.seconds)}`} style={{ direction: "ltr" }} data-testid="countdown-dial">
      <circle cx={C} cy={C} r={R_OUT} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={16} />
      <path d={arcPath(R_OUT, d.progress)} fill="none" stroke={elapsedColor} strokeWidth={16} strokeLinecap="round" style={{ transition: "d 600ms ease" }} />
      {marks.map((m) => {
        const [x0, y0] = polar(R_OUT - 11, m.frac);
        const [x1, y1] = polar(R_OUT + 11, m.frac);
        const [tx, ty] = polar(R_OUT + 19, m.frac);
        return (
          <g key={m.key}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={m.passed ? "#f59e0b" : "currentColor"} strokeOpacity={m.passed ? 1 : 0.45} strokeWidth={2.5} />
            <text x={tx} y={ty + 3} textAnchor="middle" fontSize={8.5} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
              {m.key.replace("d", "−").replace("h", "−")}
              {m.key.startsWith("d") ? "d" : "h"}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 60 }, (_, i) => {
        const [x0, y0] = polar(R_SEC - (i % 5 === 0 ? 7 : 4), i / 60);
        const [x1, y1] = polar(R_SEC, i / 60);
        const lit = d.b.isPast ? i <= sec : i >= 60 - sec || sec === 0;
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={lit ? "#f59e0b" : "currentColor"} strokeOpacity={lit ? 0.95 : 0.25} strokeWidth={i % 5 === 0 ? 2.2 : 1.3} />;
      })}
      {(() => {
        const frac = d.b.isPast ? sec / 60 : (60 - sec) / 60;
        const [x, y] = polar(R_SEC - 14, frac % 1);
        return <circle cx={x} cy={y} r={4.5} fill="#f59e0b" />;
      })()}
      <text x={C} y={C - 12} textAnchor="middle" fontSize={44} fontWeight={800} className="fill-zinc-900 dark:fill-zinc-50" style={{ fontVariantNumeric: "tabular-nums" }}>
        {num(d.b.days)}
      </text>
      <text x={C} y={C + 16} textAnchor="middle" fontSize={20} fontWeight={700} fill={elapsedColor} style={{ fontVariantNumeric: "tabular-nums", fontFamily: "ui-monospace, monospace" }}>
        {`${two(d.b.hours)}:${two(d.b.minutes)}:${two(d.b.seconds)}`}
      </text>
      <text x={C} y={C + 38} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        {pct(d.progress)}
      </text>
    </svg>
  );
}
