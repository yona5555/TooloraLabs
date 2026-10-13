"use client";
import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { KitControls, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { snap } from "@/components/tool-ui/indicator-kit/format";
import { places, ROMAN_MAX, ROMAN_MIN, toRoman } from "./romanMath";

/**
 * §44 (2D): the main visual at the top of the Roman Result card — a Roman counting board. One rail
 * per place (thousands → units): the upper counter is worth five (D, L, V), each lower counter one
 * (M, C, X, I); counters pushed to the bar are counted. Under it, a 1–3999 track whose handle writes
 * the converter's field; editing the field moves the counters and the handle.
 */
const STEP = 1;
const PLACE_KEYS = ["thousands", "hundreds", "tens", "units"] as const;

export default function RomanScene({ value, seed, onSet }: { value: number; seed: number; onSet: (v: number) => void }) {
  const t = useTranslations("tools.roman-numeral-converter.visuals.hero");
  const set = useCallback((v: number) => onSet(snap(v, STEP, ROMAN_MIN, ROMAN_MAX)), [onSet]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + STEP),
    dec: () => set(value - STEP),
    reset: () => set(seed),
    flash: 0,
    atMin: value <= ROMAN_MIN,
    atMax: value >= ROMAN_MAX,
    isSeed: value === seed,
    min: ROMAN_MIN,
    max: ROMAN_MAX,
    step: STEP,
  };
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 420, h: 320 });
  const X0 = 30;
  const X1 = W - 30;
  const trackY = H - 30;
  const xv = (v: number) => X0 + ((v - ROMAN_MIN) / (ROMAN_MAX - ROMAN_MIN)) * (X1 - X0);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (x) => set(ROMAN_MIN + ((x - X0) / (X1 - X0)) * (ROMAN_MAX - ROMAN_MIN)));
  const numeral = toRoman(value);
  const valueText = `${value} = ${numeral}`;

  // Board geometry
  const top = 54;
  const bar = top + 58;
  const bottom = trackY - 52;
  const r = Math.min(11, (bottom - bar - 16) / 9);
  const colX = (i: number) => X0 + 12 + ((X1 - X0 - 24) * (i + 0.5)) / 4;
  const pl = places(value);

  return (
    <div data-ph-scene-block className="flex flex-1 flex-col gap-3">
      {/* Grows with the Result card's spare height (the rods lengthen), so the column ends flush (§41). */}
      <div ref={box} dir="ltr" className="relative min-h-[320px] w-full flex-1" data-testid="roman-hero-drawing">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
          <rect x={X0} y={top} width={X1 - X0} height={bottom - top + 14} rx={16} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} strokeWidth={1.25} />
          <rect x={X0 + 6} y={bar - 3} width={X1 - X0 - 12} height={6} rx={3} style={{ fill: "var(--ph-ink-muted)" }} />
          {pl.map((p, i) => {
            const x = colX(i);
            const five = p.d >= 5;
            const ones = p.d % 5;
            const canFive = p.p < 3;
            return (
              <g key={p.p}>
                <line x1={x} y1={top + 8} x2={x} y2={bottom + 6} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} />
                {canFive && <circle cx={x} cy={five ? bar - r - 5 : top + r + 8} r={r} style={{ fill: five ? "var(--cv-to)" : "var(--ph-surface)", stroke: "var(--ph-line)" }} strokeWidth={1} />}
                {Array.from({ length: 4 }, (_, k) => {
                  const on = k < ones;
                  const y = on ? bar + 5 + r + k * (2 * r + 3) : bottom + 4 - r - (3 - k) * (2 * r + 3);
                  return <circle key={k} cx={x} cy={y} r={r} style={{ fill: on ? "var(--cv-from)" : "var(--ph-surface)", stroke: "var(--ph-line)" }} strokeWidth={1} />;
                })}
                <text x={x} y={22} fontSize={17} fontWeight={800} textAnchor="middle" style={{ fill: p.d ? "var(--ph-ink)" : "var(--ph-ink-muted)" }}>
                  {p.piece || "—"}
                </text>
                <text x={x} y={42} fontSize={11} fontWeight={600} textAnchor="middle" className="tabular-nums" style={{ fill: "var(--ph-ink-muted)" }}>
                  {p.value.toLocaleString("en-US")}
                </text>
                <text x={x} y={bottom + 34} fontSize={10.5} fontWeight={600} textAnchor="middle" style={{ fill: "var(--ph-ink-muted)" }}>
                  {t(`place.${PLACE_KEYS[i]}`)}
                </text>
              </g>
            );
          })}
          <line x1={X0} y1={trackY} x2={X1} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={10} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={xv(value)} y2={trackY} style={{ stroke: "var(--cv-from)" }} strokeWidth={10} strokeLinecap="round" />
          {[1, 1000, 2000, 3000, 3999].map((v) => (
            <text key={v} x={xv(v)} y={trackY + 22} fontSize={10.5} fontWeight={600} textAnchor={v === 1 ? "start" : v === 3999 ? "end" : "middle"} className="tabular-nums" style={{ fill: "var(--ph-ink-muted)" }}>
              {v.toLocaleString("en-US")}
            </text>
          ))}
        </svg>
        <SvgHandle x={xv(value)} y={trackY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="roman-hero-handle" />
      </div>
      <KitControls s={s} valueText={valueText} testId="roman-hero" />
    </div>
  );
}
