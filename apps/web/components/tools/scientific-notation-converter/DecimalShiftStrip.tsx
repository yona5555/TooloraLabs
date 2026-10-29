"use client";
/**
 * Animated decimal-point shift: the real digits of the standard form, the point hopping one
 * place at a time from its standard position to just after the first nonzero digit, each hop
 * drawn and counted. Long zero runs collapse into one "0…0 ×n" cell so the strip always fits.
 */
import { useRef, useState } from "react";
import { useMotionEpisode, useVisibleInterval } from "@/components/tool-ui/motion/motion";
import { useTranslations } from "next-intl";
import { decimalShift } from "@tooloralabs/tools";
import { sup } from "./sciFormat";
import { svgPx } from "@/components/tool-ui/svgPx";

type Cell = { text: string; span: number; wide: boolean };
const CW = 20;
const WIDE = 44;
const TOP = 30;
const CH = 30;
const H = TOP + CH + 8;

function buildCells(digits: string[]): Cell[] {
  if (digits.length <= 20) return digits.map((d) => ({ text: d, span: 1, wide: false }));
  const cells: Cell[] = [];
  let i = 0;
  while (i < digits.length) {
    if (digits[i] === "0") {
      let j = i;
      while (j < digits.length && digits[j] === "0") j++;
      if (j - i >= 5) {
        cells.push({ text: `0…0`, span: j - i, wide: true });
        i = j;
        continue;
      }
    }
    cells.push({ text: digits[i], span: 1, wide: false });
    i++;
  }
  return cells;
}

/** x of the boundary after `b` original digits. */
function boundaryX(cells: Cell[], b: number): number {
  let x = 0;
  let seen = 0;
  for (const c of cells) {
    const w = c.wide ? WIDE : CW;
    if (b <= seen + c.span) return x + (w * (b - seen)) / c.span;
    x += w;
    seen += c.span;
  }
  return x;
}

export default function DecimalShiftStrip({ coefficient, exponent }: { coefficient: number; exponent: number }) {
  const t = useTranslations("tools.scientific-notation-converter.result.shift");
  const s = decimalShift(coefficient, exponent);
  const cells = buildCells(s.digits);
  const width = cells.reduce((w, c) => w + (c.wide ? WIDE : CW), 0);
  const pad = s.negative ? 18 : 6;
  const vbW = width + pad + 6;
  // tool-ui/motion: a new value hops the point place by place (a motion episode, paused off screen or with the
  // page hidden); on load, at rest and for reduced motion the point sits at its final place. Progress is keyed
  // to the value it belongs to, so a new value starts at hop 0.
  const key = `${coefficient}e${exponent}`;
  const [anim, setAnim] = useState({ key: "", k: 0 });
  const motion = useMotionEpisode([key]);
  const box = useRef<HTMLDivElement>(null);
  const k = motion.active ? (anim.key === key ? anim.k : 0) : s.places;
  useVisibleInterval(
    box,
    () => {
      const next = Math.min((anim.key === key ? anim.k : 0) + 1, s.places);
      setAnim({ key, k: next });
      if (next >= s.places) motion.stop();
    },
    Math.max(45, Math.min(160, 1100 / Math.max(1, s.places))),
    { motion: true, active: motion.active },
  );

  const dir = s.direction === "left" ? -1 : 1;
  const pos = s.fromIndex + dir * k;
  const bx = (b: number) => pad + boundaryX(cells, b);
  const labelEvery = s.places <= 14 ? 1 : 5;

  const cellX = cells.reduce<number[]>((xs, c, i) => [...xs, i === 0 ? pad : xs[i - 1] + (cells[i - 1].wide ? WIDE : CW)], []);
  return (
    <div ref={box} data-testid="shift-strip">
      <svg viewBox={`0 0 ${vbW} ${H}`} width="100%" className="block max-h-24" role="img" aria-label={t("aria", { places: s.places })} style={{ direction: "ltr" }}>
        {s.negative && (
          <text style={{ fontSize: svgPx(15) }} x={6} y={TOP + CH / 2 + 5} fontWeight="700" fill="currentColor" className="text-zinc-500">−</text>
        )}
        {cells.map((c, i) => {
          const w = c.wide ? WIDE : CW;
          const x = cellX[i];
          return (
            <g key={i}>
              <rect x={x + 1} y={TOP} width={w - 2} height={CH} rx="5" className="fill-zinc-100 dark:fill-zinc-800" />
              <text style={{ fontSize: svgPx(c.wide ? 12 : 14) }} x={x + w / 2} y={TOP + CH / 2 + 5} textAnchor="middle" fontWeight="700" className="fill-zinc-800 dark:fill-zinc-100">
                {c.text}
              </text>
              {c.wide && (
                <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={TOP - 3} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">{`×${c.span}`}</text>
              )}
            </g>
          );
        })}
        {/* hops already made */}
        {Array.from({ length: k }, (_, i) => {
          const a = bx(s.fromIndex + dir * i);
          const b = bx(s.fromIndex + dir * (i + 1));
          const mid = (a + b) / 2;
          return (
            <g key={i}>
              <path d={`M ${a} ${TOP - 2} Q ${mid} ${TOP - 18} ${b} ${TOP - 2}`} fill="none" className="stroke-emerald-500" strokeWidth="1.5" />
              {(i + 1) % labelEvery === 0 && (
                <text style={{ fontSize: svgPx(12) }} x={mid} y={TOP - 17} textAnchor="middle" fontWeight="700" className="fill-emerald-700 dark:fill-emerald-300">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}
        {/* original point (ghost) and moving point */}
        {s.places > 0 && <circle cx={bx(s.fromIndex)} cy={TOP + CH - 3} r="3" className="fill-zinc-400" />}
        <circle cx={bx(pos)} cy={TOP + CH - 3} r="4.5" className="fill-emerald-500" />
      </svg>
      <p className="mt-1 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200" data-testid="shift-caption">
        {s.direction === "none"
          ? t("none")
          : t(s.direction, { places: k, total: s.places, power: `10${sup(exponent)}` })}
      </p>
    </div>
  );
}
