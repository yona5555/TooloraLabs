"use client";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { UnitCategory } from "@tooloralabs/tools";
import { KitControls, SvgChem, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { clamp, fmtSmart, niceCeil, snap } from "@/components/tool-ui/indicator-kit/format";
import type { HandleDirection } from "@/components/tool-ui/glass/GlassPrimitives";
import { sceneBase } from "./units";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The measuring-instrument card under the unit-converter input card (§41: it keeps the input
 * column flush with the Result column). Each category gets the picture its quantity is measured with — rulers (length), a balance (weight), a thermometer
 * (temperature), a disc of true area (area), a graduated vessel (volume) and a speedometer
 * (speed). The handle writes the "Value" field; typing in the field moves the handle.
 */
type Ctx = {
  W: number;
  H: number;
  f: number;
  lo: number;
  hi: number;
  toLo: number;
  toHi: number;
  value: number;
  toValue: number;
  fromSym: string;
  toSym: string;
};
type Variant = { svg: ReactNode; hx: number; hy: number; dir: HandleDirection; toF: (x: number, y: number) => number };

/** Trig results differ in the last bits between Node and browsers: round so hydration matches. */
const px2 = (v: number) => Math.round(v * 100) / 100;
const INK = { fill: "var(--ph-ink)" };
const MUTED = { fill: "var(--ph-ink-muted)" };
const LINE = { stroke: "var(--ph-line)" };

const lbl = (v: number) => fmtSmart(v, 3);
/** Rough label width in px at 11px Inter (for spacing and edge clamping). */
const textW = (s: string, size = 12) => s.length * size * 0.58;

/**
 * Tick values on [lo, hi] spaced so their labels never collide (§39): at least `minGap` px apart
 * over `px`, and wider still when the labels themselves are wide (scientific notation at big values).
 * `along` = labels sit along the axis (their width counts), else stacked (their height counts).
 */
function ticks(lo: number, hi: number, px: number, minGap: number, along = true): number[] {
  for (let n = Math.max(1, Math.floor(px / minGap)); n >= 1; n--) {
    const step = niceCeil((hi - lo) / n);
    const out: number[] = [];
    for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step) out.push(Number(v.toPrecision(12)));
    const need = along ? Math.max(...out.map((v) => textW(lbl(v)))) + 14 : minGap;
    if (out.length < 2 || px / (out.length - 1) >= need) return out;
  }
  return [lo, hi];
}
function Label({ x, y, text, anchor = "middle", size = 12, bold, style = MUTED }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; size?: number; bold?: boolean; style?: { fill: string } }) {
  return (
    <text x={x} y={y} fontWeight={bold ? 800 : 600} textAnchor={anchor} style={{ ...style, fontSize: svgPx(size) }} className="tabular-nums">
      <SvgChem text={text} />
    </text>
  );
}

// ── Length: two rulers, one bar of the same physical length on each ──────────────────
function rulers(c: Ctx): Variant {
  const X0 = 30;
  const X1 = c.W - 30;
  const xOf = (f: number) => X0 + f * (X1 - X0);
  const xf = xOf(c.f);
  const topAxis = 44;
  const botAxis = c.H - 44;
  const mid = c.H / 2;
  const bar = (y: number, color: string, text: string) => {
    const w = textW(text, 12.5) + 8;
    const outside = xf + w + 6 < X1;
    return (
      <g>
        <rect x={X0} y={y} width={Math.max(10, xf - X0)} height={22} rx={11} style={{ fill: color }} />
        {/* Beside the bar end when it fits, else just above the bar's end (never on the coloured fill). */}
        <Label x={outside ? xf + 8 : xf} y={outside ? y + 16 : y - 5} text={text} anchor={outside ? "start" : "end"} size={12.5} bold style={INK} />
      </g>
    );
  };
  const axis = (y: number, lo: number, hi: number, up: boolean) => (
    <g>
      <line x1={X0} y1={y} x2={X1} y2={y} style={LINE} strokeWidth={2} strokeLinecap="round" />
      {ticks(lo, hi, X1 - X0, 64).map((v) => {
        const x = xOf((v - lo) / (hi - lo));
        const s = lbl(v);
        const anchor = x - textW(s) / 2 < 2 ? "start" : x + textW(s) / 2 > c.W - 2 ? "end" : "middle";
        return (
          <g key={v}>
            <line x1={x} y1={y} x2={x} y2={up ? y - 8 : y + 8} style={LINE} strokeWidth={1.5} />
            <Label x={x} y={up ? y - 13 : y + 21} text={s} anchor={anchor} />
          </g>
        );
      })}
    </g>
  );
  return {
    svg: (
      <>
        {axis(topAxis, c.lo, c.hi, true)}
        {axis(botAxis, c.toLo, c.toHi, false)}
        <line x1={xf} y1={topAxis} x2={xf} y2={botAxis} style={{ stroke: "var(--ph-focus)" }} strokeWidth={1.5} strokeDasharray="5 5" />
        {bar(topAxis + 18, "var(--cv-from)", `${lbl(c.value)} ${c.fromSym}`)}
        {bar(botAxis - 40, "var(--cv-to)", `${lbl(c.toValue)} ${c.toSym}`)}
        {/* The ratio both rulers share, beside the handle on the side with room. */}
        <Label x={xf > c.W * 0.55 ? xf - 34 : xf + 34} y={mid + 5} text={`1 ${c.fromSym} = ${lbl(c.toHi / c.hi)} ${c.toSym}`} anchor={xf > c.W * 0.55 ? "end" : "start"} size={12} />
      </>
    ),
    hx: xf,
    hy: mid,
    dir: "horizontal",
    toF: (x) => (x - X0) / (X1 - X0),
  };
}

// ── Weight: a level balance, the same load counted in both units ──────────────────────
function balance(c: Ctx): Variant {
  const cx = c.W / 2;
  const arm = Math.min(c.W * 0.32, 190);
  const beamY = 64;
  const panY = c.H - 58;
  const top = beamY + 46;
  const hs = (f: number) => 12 + f * (panY - top - 12);
  const stack = (x: number, color: string, text: string) => {
    const h = hs(c.f);
    return (
      <g>
        <line x1={x} y1={beamY} x2={x - 46} y2={panY} style={LINE} strokeWidth={1.5} />
        <line x1={x} y1={beamY} x2={x + 46} y2={panY} style={LINE} strokeWidth={1.5} />
        <rect x={x - 26} y={panY - h} width={52} height={h} rx={12} style={{ fill: color }} />
        <path d={`M ${x - 60} ${panY} Q ${x} ${panY + 22} ${x + 60} ${panY}`} style={{ fill: "var(--cv-metal)" }} />
        <Label x={x} y={panY + 38} text={text} size={13} bold style={INK} />
      </g>
    );
  };
  return {
    svg: (
      <>
        <path d={`M ${cx} ${beamY + 4} L ${cx - 24} ${c.H - 8} L ${cx + 24} ${c.H - 8} Z`} style={{ fill: "var(--cv-metal)" }} />
        <rect x={cx - arm - 6} y={beamY - 5} width={2 * arm + 12} height={10} rx={5} style={{ fill: "var(--ph-ink-muted)" }} />
        <circle cx={cx} cy={beamY} r={8} style={{ fill: "var(--ph-focus)" }} />
        {stack(cx - arm, "var(--cv-from)", `${lbl(c.value)} ${c.fromSym}`)}
        {stack(cx + arm, "var(--cv-to)", `${lbl(c.toValue)} ${c.toSym}`)}
      </>
    ),
    hx: cx - arm,
    hy: panY - hs(c.f),
    dir: "vertical",
    toF: (_x, y) => (panY - y - 12) / (panY - top - 12),
  };
}

// ── Vertical dual scale (thermometer and vessel share the tick logic) ─────────────────
function dualScale(c: Ctx, yTop: number, yBot: number, xl: number, xr: number) {
  const yOf = (f: number) => yBot - f * (yBot - yTop);
  const side = (lo: number, hi: number, x: number, left: boolean) =>
    ticks(lo, hi, yBot - yTop, 28, false).map((v) => {
      const y = yOf((v - lo) / (hi - lo));
      return (
        <g key={v}>
          <line x1={x} y1={y} x2={left ? x + 9 : x - 9} y2={y} style={LINE} strokeWidth={1.5} />
          <Label x={left ? x - 6 : x + 6} y={y + 4} text={lbl(v)} anchor={left ? "end" : "start"} />
        </g>
      );
    });
  return { yOf, marks: [side(c.lo, c.hi, xl, true), side(c.toLo, c.toHi, xr, false)] };
}

function thermometer(c: Ctx): Variant {
  const cx = c.W / 2;
  const yTop = 34;
  const bulbY = c.H - 34;
  const yBot = bulbY - 30;
  const { yOf, marks } = dualScale(c, yTop, yBot, cx - 22, cx + 22);
  const yf = yOf(c.f);
  const mix = `color-mix(in oklab, var(--cv-warm) ${Math.round(clamp(c.f, 0, 1) * 100)}%, var(--cv-cool))`;
  return {
    svg: (
      <>
        <Label x={cx - 30} y={16} text={c.fromSym} anchor="end" size={12.5} bold style={{ fill: "var(--cv-from)" }} />
        <Label x={cx + 30} y={16} text={c.toSym} anchor="start" size={12.5} bold style={{ fill: "var(--cv-to)" }} />
        <rect x={cx - 12} y={yTop - 12} width={24} height={bulbY - yTop + 12} rx={12} style={{ fill: "var(--glass-track)", ...LINE }} strokeWidth={1.5} />
        <circle cx={cx} cy={bulbY} r={22} style={{ fill: mix, ...LINE }} strokeWidth={1.5} />
        <rect x={cx - 6} y={yf} width={12} height={bulbY - yf} rx={6} style={{ fill: mix }} />
        {marks}
        <line x1={cx - 22} y1={yf} x2={cx + 22} y2={yf} style={{ stroke: "var(--ph-focus)" }} strokeWidth={2} />
      </>
    ),
    hx: cx,
    hy: yf,
    dir: "vertical",
    toF: (_x, y) => (yBot - y) / (yBot - yTop),
  };
}

function vessel(c: Ctx): Variant {
  const cx = c.W / 2;
  const half = Math.min(96, c.W * 0.22);
  const L = cx - half;
  const R = cx + half;
  const yTop = 30;
  const yBot = c.H - 20;
  const { yOf, marks } = dualScale(c, yTop + 10, yBot - 8, L, R);
  const yf = yOf(c.f);
  return {
    svg: (
      <>
        <path d={`M ${L + 3} ${yf} L ${L + 3} ${yBot - 16} Q ${L + 3} ${yBot - 3} ${L + 16} ${yBot - 3} L ${R - 16} ${yBot - 3} Q ${R - 3} ${yBot - 3} ${R - 3} ${yBot - 16} L ${R - 3} ${yf} Z`} style={{ fill: "var(--cv-from-soft)" }} />
        <line x1={L + 3} y1={yf} x2={R - 3} y2={yf} style={{ stroke: "var(--cv-from)" }} strokeWidth={3} strokeLinecap="round" />
        <path d={`M ${L - 6} ${yTop} L ${L} ${yTop + 6} L ${L} ${yBot - 16} Q ${L} ${yBot} ${L + 16} ${yBot} L ${R - 16} ${yBot} Q ${R} ${yBot} ${R} ${yBot - 16} L ${R} ${yTop}`} fill="none" style={LINE} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <Label x={L - 6} y={16} text={c.fromSym} anchor="end" size={12.5} bold style={{ fill: "var(--cv-from)" }} />
        <Label x={R + 6} y={16} text={c.toSym} anchor="start" size={12.5} bold style={{ fill: "var(--cv-to)" }} />
        {marks}
      </>
    ),
    hx: cx,
    hy: yf,
    dir: "vertical",
    toF: (_x, y) => (yBot - 8 - y) / (yBot - 8 - yTop - 10),
  };
}

// ── Area: a disc whose area is the value, with reference rings ────────────────────────
function disc(c: Ctx): Variant {
  const cx = c.W / 2;
  const cy = c.H / 2 + 4;
  const Rmax = Math.max(60, Math.min(c.W / 2 - 40, c.H / 2 - 14));
  const r = Rmax * Math.sqrt(clamp(c.f, 0, 1));
  const conv = (fr: number) => c.toLo + fr * (c.toHi - c.toLo);
  return {
    svg: (
      <>
        <circle cx={cx} cy={cy} r={Math.max(r, 1)} style={{ fill: "var(--cv-from-soft)", stroke: "var(--cv-from)" }} strokeWidth={3} />
        {[0.25, 0.5, 1].map((fr) => {
          const rr = Rmax * Math.sqrt(fr);
          return (
            <g key={fr}>
              <circle cx={cx} cy={cy} r={rr} fill="none" style={LINE} strokeWidth={1.25} strokeDasharray="4 5" />
              <Label x={cx} y={cy - rr - 5} text={`${lbl(c.lo + fr * (c.hi - c.lo))} ${c.fromSym} · ${lbl(conv(fr))} ${c.toSym}`} size={12} />
            </g>
          );
        })}
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} style={{ stroke: "var(--cv-from)" }} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3.5} style={{ fill: "var(--cv-from)" }} />
      </>
    ),
    hx: cx + r,
    hy: cy,
    dir: "horizontal",
    toF: (x) => ((x - cx) / Rmax) ** 2 * Math.sign(x - cx),
  };
}

// ── Speed: a speedometer with the "from" scale outside and the "to" scale inside ──────
const A0 = 210;
const SWEEP = 240;
function gauge(c: Ctx): Variant {
  const cx = c.W / 2;
  const cy = c.H * 0.6;
  const R = Math.max(70, Math.min(c.W / 2 - 74, cy - 30));
  const pt = (f: number, r: number) => {
    const a = ((A0 - SWEEP * f) * Math.PI) / 180;
    return [px2(cx + r * Math.cos(a)), px2(cy - r * Math.sin(a))] as const;
  };
  const arc = (r: number, f0: number, f1: number) => {
    const [x0, y0] = pt(f0, r);
    const [x1, y1] = pt(f1, r);
    return `M ${x0} ${y0} A ${r} ${r} 0 ${SWEEP * (f1 - f0) > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  const ring = (lo: number, hi: number, r: number, out: boolean) =>
    ticks(lo, hi, (r * SWEEP * Math.PI) / 180, out ? 58 : 50).map((v) => {
      const f = (v - lo) / (hi - lo);
      const [a, b] = pt(f, r);
      const [p, q] = pt(f, out ? r + 8 : r - 8);
      const [lx, ly] = pt(f, out ? r + 14 : r - 16);
      const cos = Math.cos(((A0 - SWEEP * f) * Math.PI) / 180);
      const side = Math.abs(cos) < 0.35 ? "middle" : (cos < 0) === out ? "end" : "start";
      return (
        <g key={v}>
          <line x1={a} y1={b} x2={p} y2={q} style={LINE} strokeWidth={1.5} />
          {/* Inner labels at the two ends would sit on the readout under the dial: the outer scale names those ends. */}
          {(out || (f > 0.12 && f < 0.88)) && <Label x={lx} y={ly + 4 + (out && Math.abs(cos) < 0.35 ? -4 : 0)} text={lbl(v)} anchor={side} />}
        </g>
      );
    });
  const f = clamp(c.f, 0, 1);
  const [nx, ny] = pt(f, R - 14);
  // The pointer spans only the band between the two scales, so it never crosses a label.
  const [bx, by] = pt(f, R - 36);
  return {
    svg: (
      <>
        <path d={arc(R, 0, 1)} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={10} strokeLinecap="round" />
        {f > 0.002 && <path d={arc(R, 0, f)} fill="none" style={{ stroke: "var(--cv-from)" }} strokeWidth={10} strokeLinecap="round" />}
        <path d={arc(R - 44, 0, 1)} fill="none" style={{ stroke: "var(--cv-to)" }} strokeWidth={3} strokeLinecap="round" />
        {ring(c.lo, c.hi, R + 6, true)}
        {ring(c.toLo, c.toHi, R - 44, false)}
        <line x1={bx} y1={by} x2={nx} y2={ny} style={{ stroke: "var(--ph-ink)" }} strokeWidth={4} strokeLinecap="round" />
        <Label x={cx} y={cy + 34} text={`${lbl(c.value)} ${c.fromSym}`} size={14} bold style={{ fill: "var(--cv-from)" }} />
        <Label x={cx} y={cy + 54} text={`${lbl(c.toValue)} ${c.toSym}`} size={13} bold style={{ fill: "var(--cv-to)" }} />
      </>
    ),
    hx: nx,
    hy: ny,
    dir: "circular",
    toF: (x, y) => {
      let a = (Math.atan2(cy - y, x - cx) * 180) / Math.PI;
      if (a < -90) a += 360;
      return (A0 - a) / SWEEP;
    },
  };
}

const VARIANTS: Record<UnitCategory, (c: Ctx) => Variant> = { length: rulers, weight: balance, temperature: thermometer, area: disc, volume: vessel, speed: gauge };

export default function UnitScene({
  category,
  value,
  seed,
  conv,
  onSet,
  from,
  fromSym,
  toSym,
  grow = false,
}: {
  /** Fill the parent's spare height (the drawing re-lays out at its real size). */
  grow?: boolean;
  category: UnitCategory;
  value: number;
  seed: number;
  conv: (v: number) => number;
  onSet: (v: number) => void;
  from: string;
  fromSym: string;
  toSym: string;
}) {
  const t = useTranslations("tools.unit-converter.visuals.hero");
  const [base0, base1] = sceneBase(category, from);
  const live: [number, number] = [Math.min(base0, value < base0 ? -niceCeil(-value) : base0), Math.max(base1, niceCeil(value))];
  const [dragging, setDragging] = useState(false);
  const frozen = useRef(live);
  const [lo, hi] = dragging ? frozen.current : live;
  const step = niceCeil((hi - lo) / 200);
  const set = useCallback((v: number) => onSet(snap(v, step, lo, hi)), [onSet, step, lo, hi]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + step),
    dec: () => set(value - step),
    reset: () => set(seed),
    flash: 0,
    atMin: value <= lo,
    atMax: value >= hi,
    isSeed: Math.abs(value - seed) < 1e-9,
    min: lo,
    max: hi,
    step,
  };
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 420, h: 300 });
  const toValue = conv(value);
  const ctx: Ctx = { W, H, f: (value - lo) / (hi - lo), lo, hi, toLo: conv(lo), toHi: conv(hi), value, toValue, fromSym, toSym };
  const v = VARIANTS[category](ctx);
  const svgRef = useRef<SVGSVGElement>(null);
  const base = useSvgDrag(svgRef, W, H, (x, y) => set(lo + clamp(v.toF(x, y), 0, 1) * (hi - lo)));
  const drag = {
    ...base,
    onPointerDown: (e: React.PointerEvent) => {
      frozen.current = [lo, hi];
      setDragging(true);
      base.onPointerDown(e);
    },
    onPointerUp: () => {
      setDragging(false);
      base.onPointerUp();
    },
    onPointerCancel: () => {
      setDragging(false);
      base.onPointerCancel();
    },
  };
  const valueText = `${lbl(value)} ${fromSym} = ${lbl(toValue)} ${toSym}`;
  return (
    <div data-ph-scene-block data-unit-scene={category} className={`flex flex-col gap-3 ${grow ? "flex-1" : ""}`}>
      <div ref={box} dir="ltr" className={`relative w-full ${grow ? "min-h-[200px] flex-1" : "min-h-[300px]"}`} data-testid="unit-scene-drawing">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
          {v.svg}
        </svg>
        <SvgHandle x={v.hx} y={v.hy} viewW={W} viewH={H} direction={v.dir} label={t("handle")} valueText={valueText} s={s} drag={drag} testId="unit-scene-handle" />
      </div>
      <KitControls s={s} valueText={`${lbl(value)} ${fromSym}`} testId="unit-scene" />
    </div>
  );
}
