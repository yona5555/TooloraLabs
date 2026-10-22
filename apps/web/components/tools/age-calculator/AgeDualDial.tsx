"use client";
import type { CalendarAge } from "@tooloralabs/tools";

type Ring = { age: CalendarAge; color: string; label: string; next: string };

/**
 * Result drawing: two concentric year-of-life dials, Gregorian outside and Hijri inside. Each
 * arc runs from the last birthday (top) to today; the gap is the countdown to the next birthday
 * in that calendar. Both rings animate as the inputs change.
 */
export default function AgeDualDial({ outer, inner, centerTop, centerBottom }: { outer: Ring; inner: Ring | null; centerTop: string; centerBottom: string }) {
  const S = 300;
  const c = S / 2;
  const rings = [
    { ...outer, r: 118 },
    ...(inner ? [{ ...inner, r: 88 }] : []),
  ];
  const sw = 20;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width="100%" height="100%" style={{ direction: "ltr" }} role="img" aria-label={`${centerTop} ${centerBottom}`} className="mx-auto block max-h-full">
      {rings.map((ring) => {
        const circ = 2 * Math.PI * ring.r;
        const p = ring.age.isBirthdayToday ? 1 : Math.min(1, Math.max(0, ring.age.yearProgress));
        const ticks = Array.from({ length: 12 }, (_, i) => (i / 12) * 2 * Math.PI);
        const endA = p * 2 * Math.PI - Math.PI / 2;
        return (
          <g key={ring.label}>
            <circle cx={c} cy={c} r={ring.r} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={sw} />
            <circle
              cx={c}
              cy={c}
              r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${p * circ} ${circ}`}
              transform={`rotate(-90 ${c} ${c})`}
              style={{ transition: "stroke-dasharray 700ms ease" }}
            />
            {ticks.map((a, i) => (
              <line
                key={i}
                x1={c + Math.cos(a - Math.PI / 2) * (ring.r - sw / 2)}
                y1={c + Math.sin(a - Math.PI / 2) * (ring.r - sw / 2)}
                x2={c + Math.cos(a - Math.PI / 2) * (ring.r - sw / 2 + 4)}
                y2={c + Math.sin(a - Math.PI / 2) * (ring.r - sw / 2 + 4)}
                stroke="currentColor"
                strokeOpacity={0.35}
              />
            ))}
            <circle cx={c + Math.cos(endA) * ring.r} cy={c + Math.sin(endA) * ring.r} r={7} fill="white" stroke={ring.color} strokeWidth={3} style={{ transition: "all 700ms ease" }} />
            <text x={c + 4} y={c - ring.r + 4} fontSize={10} fontWeight={800} fill="white">
              {ring.label}
            </text>
          </g>
        );
      })}
      <text x={c} y={c - 4} textAnchor="middle" fontSize={22} fontWeight={800} className="fill-zinc-900 dark:fill-zinc-50">
        {centerTop}
      </text>
      <text x={c} y={c + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-500 dark:fill-zinc-400">
        {centerBottom}
      </text>
      {rings.map((ring, i) => (
        <text key={ring.label} x={c} y={c + 34 + i * 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={ring.color}>
          {ring.next}
        </text>
      ))}
    </svg>
  );
}

