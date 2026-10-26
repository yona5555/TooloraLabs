"use client";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The math section's indicators. Every figure is computed in the browser, with no request:
 * - π, e, φ, √2: Math.PI, Math.E, (1 + Math.sqrt(5)) / 2 and Math.SQRT2, each with a drawing built
 *   from that value (a circle unrolled to π diameters, the curve eˣ, nested golden rectangles, a unit
 *   square beside its diagonal laid flat).
 * - Today's day of the year from the device clock, factored into primes by trial division.
 * The server snapshot is null, so the date never renders stale or mismatches on hydration.
 */

const PHI = (1 + Math.sqrt(5)) / 2;
const W = 44;
const H = 18;

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
}
const localDay = () => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

function dayOfYear(stamp: number) {
  const year = Math.floor(stamp / 10000);
  const month = Math.floor(stamp / 100) % 100;
  const date = stamp % 100;
  const day = (Date.UTC(year, month - 1, date) - Date.UTC(year, 0, 1)) / 86_400_000 + 1;
  const length = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
  return { year, day, length };
}

/** Prime factors with exponents, e.g. 292 → [[2, 2], [73, 1]]. */
function factorize(n: number): [number, number][] {
  const out: [number, number][] = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    let k = 0;
    while (rest % p === 0) {
      rest /= p;
      k++;
    }
    if (k) out.push([p, k]);
  }
  if (rest > 1) out.push([rest, 1]);
  return out;
}

const SUP: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const sup = (k: number) => (k === 1 ? "" : String(k).replace(/\d/g, (c) => SUP[c]));

const svg = "shrink-0 text-blue-500 max-md:text-blue-600 dark:text-blue-400";

/** A circle of diameter d and, beside it, its circumference unrolled: a line π·d long. */
function PiDrawing() {
  const d = 8;
  const y = H / 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={svg}>
      <circle cx={1 + d / 2} cy={y} r={d / 2} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <line x1={1} y1={y} x2={1 + d} y2={y} stroke="currentColor" strokeWidth={1} opacity={0.6} />
      <line x1={13} y1={y} x2={13 + Math.PI * d} y2={y} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** y = eˣ for x in [-3, 1], scaled to the box. */
function EDrawing() {
  const n = 24;
  const top = Math.exp(1);
  const points = Array.from({ length: n + 1 }, (_, i) => {
    const x = -3 + (4 * i) / n;
    return `${((i / n) * W).toFixed(1)},${(H - 1 - (Math.exp(x) / top) * (H - 2)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={svg}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** A golden rectangle (H·φ by H) with four squares cut off in turn. */
function PhiDrawing() {
  const h = H - 2;
  const w = h * PHI;
  const x0 = (W - w) / 2;
  let x = x0;
  let y = 1;
  let rw = w;
  let rh = h;
  const cuts: string[] = [];
  for (let i = 0; i < 4; i++) {
    if (rw >= rh) {
      const cx = i % 4 === 0 ? x + rh : x + rw - rh;
      cuts.push(`M${cx.toFixed(1)},${y.toFixed(1)}V${(y + rh).toFixed(1)}`);
      if (i % 4 === 0) x += rh;
      rw -= rh;
    } else {
      const cy = i % 4 === 1 ? y + rw : y + rh - rw;
      cuts.push(`M${x.toFixed(1)},${cy.toFixed(1)}H${(x + rw).toFixed(1)}`);
      if (i % 4 === 1) y += rw;
      rh -= rw;
    }
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={svg}>
      <rect x={x0} y={1} width={w} height={h} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <path d={cuts.join("")} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.7} />
    </svg>
  );
}

/** A unit square and, beside it, its diagonal laid flat: a line √2 sides long. */
function Sqrt2Drawing() {
  const side = 12;
  const y0 = (H - side) / 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={svg}>
      <rect x={1} y={y0} width={side} height={side} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <line x1={1} y1={y0 + side} x2={1 + side} y2={y0} stroke="currentColor" strokeWidth={1} opacity={0.7} />
      <line x1={17} y1={y0 + side} x2={17 + Math.SQRT2 * side} y2={y0 + side} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** How far through the year today is. */
function YearBar({ fraction }: { fraction: number }) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={svg}>
      <rect x={1} y={7} width={W - 2} height={4} rx={2} fill="currentColor" opacity={0.2} />
      <rect x={1} y={7} width={(W - 2) * fraction} height={4} rx={2} fill="currentColor" />
    </svg>
  );
}

export default function MathPulse() {
  const t = useTranslations("categoryPulse");
  const stamp = useSyncExternalStore(subscribe, localDay, () => null);
  const ltr = (s: string) => <span dir="ltr">{s}</span>;

  const items: IndicatorItem[] = [
    { id: "pi", href: "/tools/circle-calculator", label: t("math.pi"), value: ltr(Math.PI.toFixed(8)), trailing: <PiDrawing />, note: t("math.piNote") },
    { id: "e", href: "/tools/scientific-calculator", label: t("math.e"), value: ltr(Math.E.toFixed(8)), trailing: <EDrawing />, note: t("math.eNote") },
    { id: "phi", href: "/tools/fraction-calculator", label: t("math.phi"), value: ltr(PHI.toFixed(8)), trailing: <PhiDrawing />, note: t("math.phiNote") },
    { id: "sqrt2", href: "/tools/triangle-calculator", label: t("math.sqrt2"), value: ltr(Math.SQRT2.toFixed(8)), trailing: <Sqrt2Drawing />, note: t("math.sqrt2Note") },
  ];

  if (stamp === null) {
    items.push({ id: "day", href: "/tools/gcf-lcm-calculator", label: " ", value: " " });
  } else {
    const { year, day, length } = dayOfYear(stamp);
    const factors = factorize(day);
    const isPrime = factors.length === 1 && factors[0][1] === 1;
    const product = day === 1 ? "1" : factors.map(([p, k]) => `${p}${sup(k)}`).join(" × ");
    items.push({
      id: "day",
      href: "/tools/gcf-lcm-calculator",
      label: t("math.day", { day, year }),
      value: isPrime ? t("math.dayPrime", { day }) : ltr(`${day} = ${product}`),
      trailing: <YearBar fraction={day / length} />,
      note: t("math.dayNote"),
    });
  }

  return <IndicatorStrip label={t("label")} items={items} />;
}
