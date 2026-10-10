"use client";
/**
 * §31 type 10 -- interactive log-scale magnitude ladder, 10^-15 … 10^15. One real reference
 * length at each main power (LADDER_REFERENCES, sourced in packages/tools). Dragging the thumb
 * (or −/+) moves the result's exponent and re-runs the converter live; the readout names the
 * nearest reference and how many of it the number is, read in metres.
 */
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LADDER_MIN, LADDER_MAX, LADDER_REFERENCES, clampLadder, log10Of, nearestLadderReference, type NormalizedScientific } from "@tooloralabs/tools";
import { coef, sup } from "./sciFormat";

const W = 400;
const X0 = 36;
const X1 = 364;
const AXIS_Y = 92;
const H = 184;
const xOf = (e: number) => X0 + ((Math.min(LADDER_MAX, Math.max(LADDER_MIN, e)) - LADDER_MIN) / (LADDER_MAX - LADDER_MIN)) * (X1 - X0);

export default function MagnitudeLadder({ sci, onSetExponent }: { sci: NormalizedScientific; onSetExponent: (exponent: number) => void }) {
  const t = useTranslations("tools.scientific-notation-converter.result.ladder");
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const lv = log10Of(sci);
  const off = lv > LADDER_MAX + 1 ? "right" : lv < LADDER_MIN ? "left" : null;
  const tx = xOf(lv);
  const { ref, ratio } = nearestLadderReference(sci);

  function fromClient(clientX: number) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const p = new DOMPoint(clientX, 0).matrixTransform(ctm.inverse());
    const e = clampLadder(LADDER_MIN + ((p.x - X0) / (X1 - X0)) * (LADDER_MAX - LADDER_MIN));
    if (e !== sci.exponent) onSetExponent(e);
  }

  const ratioText = ratio >= 0.01 && ratio < 1000 ? coef(ratio, 3) : `${coef(ratio / 10 ** Math.floor(Math.log10(ratio)), 3)}×10${sup(Math.floor(Math.log10(ratio)))}`;

  return (
    <div data-testid="ladder">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="block touch-none select-none"
        style={{ direction: "ltr" }}
        role="img"
        aria-label={t("aria")}
        onPointerMove={(e) => dragging && fromClient(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* tinted bands: small / human scale / large */}
        <rect x={X0} y={AXIS_Y - 6} width={xOf(-3) - X0} height="12" rx="6" className="fill-violet-100 dark:fill-violet-500/15" />
        <rect x={xOf(-3)} y={AXIS_Y - 6} width={xOf(3) - xOf(-3)} height="12" className="fill-emerald-100 dark:fill-emerald-500/15" />
        <rect x={xOf(3)} y={AXIS_Y - 6} width={X1 - xOf(3)} height="12" rx="6" className="fill-amber-100 dark:fill-amber-500/15" />
        <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="1.5" />
        {Array.from({ length: LADDER_MAX - LADDER_MIN + 1 }, (_, i) => LADDER_MIN + i).map((e) => {
          const main = e % 3 === 0;
          return (
            <g key={e}>
              <line x1={xOf(e)} y1={AXIS_Y - (main ? 8 : 4)} x2={xOf(e)} y2={AXIS_Y + (main ? 8 : 4)} className="stroke-zinc-400 dark:stroke-zinc-500" strokeWidth={main ? 1.4 : 0.8} />
              {main && (
                <text x={xOf(e)} y={AXIS_Y + 20} textAnchor="middle" fontSize="10" fontWeight="700" className="fill-zinc-600 dark:fill-zinc-300">{`10${sup(e)}`}</text>
              )}
            </g>
          );
        })}
        {/* reference objects alternate above / below so no two labels share a band (§39) */}
        {LADDER_REFERENCES.map((r, i) => {
          const x = xOf(Math.log10(r.coefficient) + r.exponent);
          const up = i % 2 === 0;
          const active = r.key === ref.key;
          const y = up ? 20 : AXIS_Y + 46;
          return (
            <g key={r.key} data-ref={r.key}>
              <line x1={x} y1={up ? y + 14 : AXIS_Y + 26} x2={x} y2={up ? AXIS_Y - 8 : y - 10} className={active ? "stroke-blue-500" : "stroke-zinc-300 dark:stroke-zinc-600"} strokeDasharray={active ? undefined : "2 2"} />
              <circle cx={x} cy={AXIS_Y} r="2.5" className={active ? "fill-blue-600 dark:fill-blue-400" : "fill-zinc-400"} />
              <text x={x} y={y} textAnchor="middle" fontSize="10.5" fontWeight={active ? 800 : 600} className={active ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-700 dark:fill-zinc-300"}>
                {t(`refs.${r.key}`)}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize="9" className="fill-zinc-500 dark:fill-zinc-400">{`${coef(r.coefficient, 4)}×10${sup(r.exponent)} m`}</text>
            </g>
          );
        })}
        {/* thumb */}
        <g style={{ cursor: dragging ? "grabbing" : "grab" }} data-testid="ladder-thumb">
          <line x1={tx} y1={AXIS_Y - 22} x2={tx} y2={AXIS_Y + 8} className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" />
          <rect x={tx - 22} y={AXIS_Y - 38} width="44" height="17" rx="8.5" className="fill-blue-600 dark:fill-blue-500" />
          <text x={tx} y={AXIS_Y - 26} textAnchor="middle" fontSize="10" fontWeight="800" fill="white">{off ? `${off === "right" ? "" : "←"}10${sup(sci.exponent)}${off === "right" ? "→" : ""}` : `10${sup(sci.exponent)}`}</text>
          <circle cx={tx} cy={AXIS_Y} r="8" className="fill-white stroke-blue-600 dark:fill-zinc-900 dark:stroke-blue-400" strokeWidth="3" />
          <circle
            cx={tx}
            cy={AXIS_Y}
            r="20"
            fill="transparent"
            onPointerDown={(e) => {
              (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
              setDragging(true);
            }}
          />
        </g>
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => onSetExponent(Math.max(LADDER_MIN, Math.min(LADDER_MAX, sci.exponent) - 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-base font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" aria-label={t("down")}>−</button>
        <p className="min-w-0 flex-1 text-center text-sm text-zinc-600 dark:text-zinc-300" data-testid="ladder-readout">
          {t("readout", { ref: t(`refs.${ref.key}`), ratio: ratioText })}
        </p>
        <button type="button" onClick={() => onSetExponent(Math.min(LADDER_MAX, Math.max(LADDER_MIN, sci.exponent) + 1))} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-base font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" aria-label={t("up")}>+</button>
      </div>
    </div>
  );
}
