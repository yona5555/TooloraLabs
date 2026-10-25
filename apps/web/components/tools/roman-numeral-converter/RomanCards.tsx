"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, fmtSmart, sci } from "@/components/tool-ui/indicator-kit/format";
import { additive, LENGTHS, ROMAN_MAX, SYMBOL_VALUE, terms, toRoman } from "./romanMath";
import { svgPx } from "@/components/tool-ui/svgPx";

/**
 * The eight 2D Roman-numeral indicator cards. Each card owns its state (seeded once, never linked
 * to the Result card or to another card) and uses the converter's own standard form (1–3999,
 * subtractive pairs IV IX XL XC CD CM only).
 */
type Side = "visual-left" | "table-left";
const n0 = (v: number) => v.toLocaleString("en-US");

function useCardText(key: string) {
  return { t: useTranslations(`tools.roman-numeral-converter.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

/** A horizontal value track at the bottom of a drawing (rounded bar, filled to the value). */
function Track({ x0, x1, y, f }: { x0: number; x1: number; y: number; f: number }) {
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
      <line x1={x0} y1={y} x2={x0 + clamp(f, 0, 1) * (x1 - x0)} y2={y} style={{ stroke: "var(--cv-from)" }} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
}

// ── 1. Reading left to right: a waterfall of signed symbol values ─────────────────────
const WF_MAX = 399;
export function RomanWaterfallCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("waterfall");
  const s = useStepper(7, { min: 1, max: WF_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const X0 = 24;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * (WF_MAX - 1));
  const { W, H } = d;
  const n = s.value;
  const numeral = toRoman(n);
  const tm = terms(numeral);
  const steps = tm.map((x, i) => {
    const from = tm.slice(0, i).reduce((a, q) => a + q.value, 0);
    return { ...x, from, to: from + x.value };
  });
  const peak = Math.max(n, ...steps.map((x) => x.from), ...steps.map((x) => x.to));
  const trackY = H - 22;
  const base = trackY - 56;
  const top = 30;
  const yv = (v: number) => base - (v / peak) * (base - top);
  const cols = steps.length + 1;
  const cw = (W - 2 * X0) / cols;
  const bw = Math.min(30, cw * 0.62);
  const plus = steps.filter((x) => x.value > 0).reduce((a, x) => a + x.value, 0);
  const minus = steps.filter((x) => x.value < 0).reduce((a, x) => a + x.value, 0);
  const valueText = `${n} = ${numeral}`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowNumber"), value: n0(n) },
    { key: "numeral", label: t("rowNumeral"), value: numeral, isKey: true },
    { key: "plus", label: t("rowAdded"), value: `+${n0(plus)}` },
    { key: "minus", label: t("rowSubtracted"), value: minus ? `−${n0(-minus)}` : "0" },
    { key: "count", label: t("rowSymbols"), value: String(numeral.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { numeral: ltr(numeral), n: ltr(n0(n)) })}
      controls={<KitControls s={s} valueText={valueText} testId="roman-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((n - 1) / (WF_MAX - 1)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="roman-c1">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {steps.map((x, i) => {
            const cx = X0 + cw * (i + 0.5);
            const y0 = yv(Math.max(x.from, x.to));
            const h = Math.max(3, Math.abs(yv(x.from) - yv(x.to)));
            const neg = x.value < 0;
            const on = hover === (neg ? "minus" : "plus");
            return (
              <g key={i} onPointerEnter={() => setHover(neg ? "minus" : "plus")} onPointerLeave={() => setHover(null)}>
                {i > 0 && <line x1={cx - cw} y1={yv(x.from)} x2={cx} y2={yv(x.from)} style={{ stroke: "var(--ph-grid)" }} strokeDasharray="3 3" />}
                <rect x={cx - bw / 2} y={y0} width={bw} height={h} rx={Math.min(8, bw / 2, h / 2)} style={{ fill: neg ? "var(--cv-to)" : "var(--cv-from)", ...lit(on) }} />
                <T x={cx} y={y0 - 6} text={x.sym} size={13} bold style={INK} />
                <T x={cx} y={base + 16} text={`${neg ? "−" : "+"}${n0(Math.abs(x.value))}`} size={12} />
              </g>
            );
          })}
          <rect x={X0 + cw * (cols - 0.5) - bw / 2} y={yv(n)} width={bw} height={Math.max(3, base - yv(n))} rx={Math.min(8, bw / 2)} style={{ fill: "var(--ph-ink)" }} />
          <T x={X0 + cw * (cols - 0.5)} y={yv(n) - 6} text="=" size={13} bold style={INK} />
          <T x={X0 + cw * (cols - 0.5)} y={base + 16} text={n0(n)} size={12} bold style={INK} />
          <Track x0={X0} x1={W - X0} y={trackY} f={(n - 1) / (WF_MAX - 1)} />
        </Drawing>
      }
    />
  );
}

// ── 2. The six subtractive pairs on a number line ─────────────────────────────────────
const PAIRS = ["IV", "IX", "XL", "XC", "CD", "CM"];
export function RomanSubtractiveCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("subtractive");
  const s = useStepper(0, { min: 0, max: 5, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 230;
  const X0 = 30;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 5);
  const { W, H } = d;
  const pair = PAIRS[s.value];
  const small = SYMBOL_VALUE[pair[0]];
  const big = SYMBOL_VALUE[pair[1]];
  const v = big - small;
  const long = additive(v);
  const lineY = H - 70;
  const xs = (k: number) => X0 + (k / (big * 1.1)) * (W - 2 * X0);
  const sx = (i: number) => X0 + (i / 5) * (W - 2 * X0);
  const valueText = `${pair} = ${big} − ${small} = ${v}`;
  const rows: KitRow[] = [
    { key: "pair", label: t("rowPair"), value: pair },
    { key: "big", label: t("rowLarger"), value: `${pair[1]} = ${n0(big)}` },
    { key: "small", label: t("rowSmaller"), value: `${pair[0]} = ${n0(small)}` },
    { key: "v", label: `${pair[1]} − ${pair[0]}`, value: n0(v), isKey: true },
    { key: "long", label: t("rowAdditive"), value: long },
    { key: "saved", label: t("rowSaved"), value: String(long.length - 2) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { eq: ltr(`${pair} = ${n0(v)}`), long: ltr(long) })}
      controls={<KitControls s={s} valueText={pair} testId="roman-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: sx(s.value), y: 28, dir: "horizontal" }} s={s} testId="roman-c2">
          <line x1={X0} y1={28} x2={W - X0} y2={28} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          {PAIRS.map((p, i) => (
            <T key={p} x={sx(i)} y={60} text={p} size={12.5} bold style={i === s.value ? INK : MUTED} />
          ))}
          <line x1={X0} y1={lineY} x2={W - X0} y2={lineY} style={LINE} strokeWidth={2} strokeLinecap="round" />
          {[0, small, v, big].map((k, i) => (
            <g key={i}>
              <line x1={xs(k)} y1={lineY - 6} x2={xs(k)} y2={lineY + 6} style={LINE} strokeWidth={1.5} />
              {k !== small && <T x={xs(k)} y={lineY + 22} text={n0(k)} size={12} anchor={k === 0 ? "start" : "middle"} style={k === v ? INK : MUTED} />}
            </g>
          ))}
          <g onPointerEnter={() => setHover("big")} onPointerLeave={() => setHover(null)}>
            <path d={`M ${xs(0)} ${lineY - 18} L ${xs(big) - 6} ${lineY - 18}`} style={{ stroke: "var(--cv-from)" }} strokeWidth={hover === "big" ? 5 : 4} strokeLinecap="round" />
            <path d={`M ${xs(big) - 12} ${lineY - 24} L ${xs(big) - 4} ${lineY - 18} L ${xs(big) - 12} ${lineY - 12}`} fill="none" style={{ stroke: "var(--cv-from)" }} strokeWidth={3} strokeLinecap="round" />
            <T x={(xs(0) + xs(big)) / 2} y={lineY - 26} text={`+${pair[1]} (${n0(big)})`} size={12} bold style={{ fill: "var(--cv-from)" }} />
          </g>
          <g onPointerEnter={() => setHover("small")} onPointerLeave={() => setHover(null)}>
            <path d={`M ${xs(big)} ${lineY + 34} L ${xs(v) + 6} ${lineY + 34}`} style={{ stroke: "var(--cv-to)" }} strokeWidth={hover === "small" ? 5 : 4} strokeLinecap="round" />
            <path d={`M ${xs(v) + 12} ${lineY + 28} L ${xs(v) + 4} ${lineY + 34} L ${xs(v) + 12} ${lineY + 40}`} fill="none" style={{ stroke: "var(--cv-to)" }} strokeWidth={3} strokeLinecap="round" />
            <T x={xs(v) - 8} y={lineY + 39} text={`−${pair[0]} (${n0(small)})`} size={12} bold anchor="end" style={{ fill: "var(--cv-to)" }} />
          </g>
          <circle cx={xs(v)} cy={lineY} r={6} style={{ fill: "var(--ph-ink)" }} />
        </Drawing>
      }
    />
  );
}

// ── 3. Clock dial: Roman hours, with the watchmaker's IIII ────────────────────────────
export function RomanClockCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("clock");
  const s = useStepper(4, { min: 1, max: 12, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 290;
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    let a = (Math.atan2(x - W / 2, -(y - H / 2)) * 180) / Math.PI;
    if (a < 15) a += 360;
    return a / 30;
  });
  const { W, H } = d;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W / 2 - 14, H / 2 - 12);
  const h = s.value;
  const pt = (hour: number, r: number) => [px2(cx + r * Math.sin((hour * Math.PI) / 6)), px2(cy - r * Math.cos((hour * Math.PI) / 6))] as const;
  const dial = (hour: number) => (hour === 4 ? "IIII" : toRoman(hour));
  const [hx, hy] = pt(h, R * 0.42);
  const valueText = `${h} = ${toRoman(h)}`;
  const rows: KitRow[] = [
    { key: "h", label: t("rowHour"), value: String(h) },
    { key: "std", label: t("rowStandard"), value: toRoman(h), isKey: true },
    { key: "dial", label: t("rowDial"), value: dial(h) },
    { key: "pm", label: t("rowAfternoon"), value: `${h === 12 ? 12 : h + 12} = ${toRoman(h === 12 ? 12 : h + 12)}` },
    { key: "len", label: t("rowLetters"), value: String(dial(h).length) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t(h === 4 ? "captionFour" : "caption", { h: ltr(String(h)), numeral: ltr(toRoman(h)) })}
      controls={<KitControls s={s} valueText={valueText} testId="roman-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: hx, y: hy, dir: "circular" }} s={s} testId="roman-c3">
          <circle cx={cx} cy={cy} r={R} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} strokeWidth={2} />
          {Array.from({ length: 60 }, (_, i) => {
            const [a, b] = pt(i / 5, R - 4);
            const [p, q] = pt(i / 5, R - (i % 5 === 0 ? 12 : 8));
            return <line key={i} x1={a} y1={b} x2={p} y2={q} style={LINE} strokeWidth={i % 5 === 0 ? 2 : 1} />;
          })}
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i + 1;
            const [x, y] = pt(hour, R - 30);
            const on = hour === h;
            return (
              <g key={hour} onPointerEnter={() => setHover("dial")} onPointerLeave={() => setHover(null)}>
                {on && <circle cx={x} cy={y} r={17} style={{ fill: "var(--cv-from-soft)", stroke: "var(--cv-from)" }} strokeWidth={1.5} />}
                <T x={x} y={y + 4.5} text={dial(hour)} size={R > 120 ? 13 : 12} bold style={on ? INK : MUTED} />
              </g>
            );
          })}
          <line x1={cx} y1={cy} x2={hx} y2={hy} style={{ stroke: "var(--ph-ink)" }} strokeWidth={5} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={6} style={{ fill: "var(--ph-ink)" }} />
        </Drawing>
      }
    />
  );
}

// ── 4. How long is each numeral? Lengths of all 3,999 as a band ───────────────────────
export function RomanLengthCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("length");
  const s = useStepper(1888, { min: 1, max: ROMAN_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 34;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 14 - X0)) * (ROMAN_MAX - 1));
  const { W, H } = d;
  const Y0 = H - 30;
  const Y1 = 40;
  const xn = (k: number) => X0 + ((k - 1) / (ROMAN_MAX - 1)) * (W - 14 - X0);
  const yl = (l: number) => Y0 - (l / 15) * (Y0 - Y1);
  const n = s.value;
  const len = LENGTHS[n];
  // Per-pixel min/max envelope of the 3,999 lengths (an exact band, no sampling gaps).
  const cols = Math.max(2, Math.round(W - 14 - X0));
  const top: string[] = [];
  const bot: string[] = [];
  for (let c = 0; c <= cols; c++) {
    const a = Math.max(1, Math.floor(1 + (c / cols) * (ROMAN_MAX - 1)));
    const b = Math.min(ROMAN_MAX, Math.floor(1 + ((c + 1) / cols) * (ROMAN_MAX - 1)));
    let lo = 99;
    let hi = 0;
    for (let k = a; k <= Math.max(a, b); k++) {
      lo = Math.min(lo, LENGTHS[k]);
      hi = Math.max(hi, LENGTHS[k]);
    }
    const x = (X0 + c).toFixed(1);
    top.push(`${x},${yl(hi).toFixed(1)}`);
    bot.unshift(`${x},${yl(lo).toFixed(1)}`);
  }
  const valueText = `${n0(n)} = ${toRoman(n)} (${len})`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowNumber"), value: n0(n) },
    { key: "numeral", label: t("rowNumeral"), value: toRoman(n) },
    { key: "len", label: t("rowLength"), value: String(len), isKey: true },
    { key: "digits", label: t("rowDigits"), value: String(String(n).length) },
    { key: "ratio", label: t("rowRatio"), value: `${fmtSmart(len / String(n).length, 3)}×` },
    { key: "max", label: t("rowLongest"), value: "3,888 = MMMDCCCLXXXVIII (15)" },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(n0(n)), len: ltr(String(len)), digits: ltr(String(String(n).length)) })}
      controls={<KitControls s={s} valueText={n0(n)} testId="roman-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xn(n), y: yl(len), dir: "horizontal" }} s={s} testId="roman-c4">
          {[0, 5, 10, 15].map((l) => (
            <g key={l}>
              <line x1={X0} y1={yl(l)} x2={W - 14} y2={yl(l)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={X0 - 6} y={yl(l) + 4} text={String(l)} anchor="end" size={12} />
            </g>
          ))}
          {[1, 1000, 2000, 3000, 3999].map((k) => (
            <T key={k} x={xn(k)} y={Y0 + 18} text={n0(k)} size={12} anchor={k === 1 ? "start" : k === 3999 ? "end" : "middle"} />
          ))}
          <polygon points={[...top, ...bot].join(" ")} style={{ fill: "var(--cv-from-soft)", stroke: "var(--cv-from)" }} strokeWidth={hover === "len" ? 1.5 : 0.75} />
          <line x1={xn(n)} y1={Y0} x2={xn(n)} y2={yl(len)} style={{ stroke: "var(--ph-focus)" }} strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={xn(3888)} cy={yl(15)} r={4} style={{ fill: "var(--cv-to)" }} onPointerEnter={() => setHover("max")} onPointerLeave={() => setHover(null)} />
          <T x={xn(n) > W * 0.55 ? xn(n) - 26 : xn(n) + 26} y={18} text={`${toRoman(n)} · ${len}`} anchor={xn(n) > W * 0.55 ? "end" : "start"} size={12.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 5. Copyright years on a timeline ──────────────────────────────────────────────────
const Y_MIN = 1900;
const Y_MAX = 2030;
export function RomanYearsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("years");
  const s = useStepper(2026, { min: Y_MIN, max: Y_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 210;
  const X0 = 34;
  const d = useDrawing(HMIN, s, (x, _y, W) => Y_MIN + ((x - X0) / (W - 2 * X0)) * (Y_MAX - Y_MIN));
  const { W, H } = d;
  const xy = (y: number) => X0 + ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (W - 2 * X0);
  const lineY = H / 2 + 14;
  const y = s.value;
  const r = toRoman(y);
  const stations = [1900, 1920, 1940, 1960, 1980, 2000, 2020];
  const valueText = `${y} = ${r}`;
  const rows: KitRow[] = [
    { key: "year", label: t("rowYear"), value: String(y) },
    { key: "numeral", label: t("rowNumeral"), value: r, isKey: true },
    { key: "thousands", label: t("rowThousands"), value: toRoman(Math.floor(y / 1000) * 1000) },
    { key: "rest", label: t("rowRest"), value: y % 1000 ? `${toRoman(y % 1000)} = ${y % 1000}` : "—" },
    { key: "len", label: t("rowLetters"), value: String(r.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { y: ltr(String(y)), numeral: ltr(r) })}
      controls={<KitControls s={s} valueText={String(y)} testId="roman-c5" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xy(y), y: lineY, dir: "horizontal" }} s={s} testId="roman-c5">
          <line x1={X0} y1={lineY} x2={W - X0} y2={lineY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={lineY} x2={xy(y)} y2={lineY} style={{ stroke: "var(--cv-from)" }} strokeWidth={8} strokeLinecap="round" />
          {stations.map((st, i) => {
            const up = i % 2 === 0;
            return (
              <g key={st} onPointerEnter={() => setHover("numeral")} onPointerLeave={() => setHover(null)}>
                <circle cx={xy(st)} cy={lineY} r={5} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} strokeWidth={1.5} />
                <T x={xy(st)} y={up ? lineY - 34 : lineY + 30} text={toRoman(st)} size={12} bold style={INK} anchor={i === 0 ? "start" : "middle"} />
                <T x={xy(st)} y={up ? lineY - 20 : lineY + 44} text={String(st)} size={12} anchor={i === 0 ? "start" : "middle"} />
              </g>
            );
          })}
          <T x={W / 2} y={22} text={valueText} size={15} bold style={{ fill: "var(--cv-from)" }} />
        </Drawing>
      }
    />
  );
}

// ── 6. Past 3,999: the vinculum (×1,000 bar) on a log scale ───────────────────────────
const LOG_MAX = Math.log10(4e6);
export function RomanVinculumCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("vinculum");
  const s = useStepper(4, { min: 1, max: ROMAN_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 230;
  const X0 = 26;
  const d = useDrawing(HMIN, s, (x, _y, W) => 10 ** (((x - X0) / (W - 2 * X0)) * LOG_MAX) / 1000);
  const { W, H } = d;
  const xl = (v: number) => X0 + (Math.log10(Math.max(1, v)) / LOG_MAX) * (W - 2 * X0);
  const barY = H / 2 + 6;
  const k = s.value;
  const N = k * 1000;
  const bar = toRoman(k);
  const valueText = `${n0(N)} = ${bar} × 1,000`;
  const rows: KitRow[] = [
    { key: "N", label: t("rowNumber"), value: n0(N) },
    { key: "k", label: "N ÷ 1,000", value: `${n0(k)} = ${bar}` },
    { key: "bar", label: t("rowBarred"), value: `${bar} × 1,000`, isKey: true },
    { key: "std", label: t("rowStandard"), value: N <= ROMAN_MAX ? toRoman(N) : t("beyond") },
    { key: "mag", label: t("rowMagnitude"), value: sci(N, 2) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { N: ltr(n0(N)), bar: ltr(bar) })}
      controls={<KitControls s={s} valueText={n0(N)} testId="roman-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xl(N), y: barY, dir: "horizontal" }} s={s} testId="roman-c6">
          <rect x={xl(1)} y={barY - 12} width={xl(ROMAN_MAX) - xl(1)} height={24} rx={12} style={{ fill: "var(--cv-from-soft)", ...lit(hover === "std") }} />
          <rect x={xl(4000)} y={barY - 12} width={xl(4e6) - xl(4000)} height={24} rx={12} style={{ fill: "var(--cv-to-soft)", ...lit(hover === "bar") }} />
          <T x={(xl(1) + xl(ROMAN_MAX)) / 2} y={barY - 20} text={t("standardBand")} size={12} bold style={{ fill: "var(--cv-from)" }} />
          <T x={(xl(4000) + xl(4e6)) / 2} y={barY - 20} text={t("barBand")} size={12} bold style={{ fill: "var(--cv-to)" }} />
          {[1, 10, 100, 1000, 1e4, 1e5, 1e6].map((v) => (
            <g key={v}>
              <line x1={xl(v)} y1={barY + 14} x2={xl(v)} y2={barY + 20} style={LINE} />
              <T x={xl(v)} y={barY + 33} text={v < 1e4 ? n0(v) : `10${["⁴", "⁵", "⁶"][Math.log10(v) - 4]}`} size={12} anchor={v === 1 ? "start" : "middle"} />
            </g>
          ))}
          <text x={W / 2} y={30} fontWeight={800} textAnchor="middle" textDecoration="overline" style={{ fontSize: svgPx(22), fill: "var(--ph-ink)" }}>
            {bar}
          </text>
          <T x={W / 2} y={H - 12} text={`${bar} × 1,000 = ${n0(N)}`} size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 7. From tally marks to letters ────────────────────────────────────────────────────
const TALLY_MAX = 40;
export function RomanTallyCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("tally");
  const s = useStepper(8, { min: 1, max: TALLY_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 236;
  const X0 = 24;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * TALLY_MAX);
  const { W, H } = d;
  const gw = (W - 2 * X0) / (TALLY_MAX / 5);
  const sw = gw / 6.5;
  const n = s.value;
  const r = toRoman(n);
  const sh = Math.min(30, H * 0.11);
  const tallyY = Math.max(34 + sh, H * 0.36);
  const letterY = Math.max(tallyY + sh + 76, H * 0.76);
  const xOfMark = (i: number) => X0 + Math.floor(i / 5) * gw + (i % 5) * sw + sw / 2;
  const endX = X0 + (n / TALLY_MAX) * (W - 2 * X0);
  const pill = Math.min(36, (W - 2 * X0) / Math.max(r.length, 1) - 4);
  const valueText = `${n}: ${n} | → ${r}`;
  const rows: KitRow[] = [
    { key: "n", label: t("rowNumber"), value: String(n) },
    { key: "marks", label: t("rowMarks"), value: String(n) },
    { key: "numeral", label: t("rowNumeral"), value: r, isKey: true },
    { key: "letters", label: t("rowLetters"), value: String(r.length) },
    { key: "saved", label: t("rowSaved"), value: String(n - r.length) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(n)), numeral: ltr(r), len: ltr(String(r.length)) })}
      controls={<KitControls s={s} valueText={String(n)} testId="roman-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: endX, y: tallyY + sh + 18, dir: "horizontal" }} s={s} testId="roman-c7">
          <T x={X0} y={tallyY - sh - 12} text={t("tallyRow")} anchor="start" size={12} />
          <g onPointerEnter={() => setHover("marks")} onPointerLeave={() => setHover(null)}>
            {Array.from({ length: n }, (_, i) => {
              const fifth = i % 5 === 4;
              const x = xOfMark(i);
              if (fifth) {
                const gx = X0 + Math.floor(i / 5) * gw;
                return <line key={i} x1={gx - 1} y1={tallyY + sh * 0.7} x2={gx + 4 * sw} y2={tallyY - sh * 0.8} style={{ stroke: "var(--cv-to)" }} strokeWidth={hover === "marks" ? 3.5 : 2.5} strokeLinecap="round" />;
              }
              return <line key={i} x1={x} y1={tallyY - sh} x2={x} y2={tallyY + sh} style={{ stroke: "var(--ph-ink)" }} strokeWidth={hover === "marks" ? 3.5 : 2.5} strokeLinecap="round" />;
            })}
          </g>
          <line x1={X0} y1={tallyY + sh + 18} x2={W - X0} y2={tallyY + sh + 18} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
          <line x1={X0} y1={tallyY + sh + 18} x2={endX} y2={tallyY + sh + 18} style={{ stroke: "var(--cv-from)" }} strokeWidth={6} strokeLinecap="round" />
          <T x={X0} y={letterY - 24} text={t("letterRow")} anchor="start" size={12} />
          <g onPointerEnter={() => setHover("numeral")} onPointerLeave={() => setHover(null)}>
            {[...r].map((c, i) => (
              <g key={i}>
                <rect x={X0 + i * (pill + 4)} y={letterY - 17} width={pill} height={34} rx={17} style={{ fill: "var(--cv-from-soft)", ...lit(hover === "numeral") }} />
                <T x={X0 + i * (pill + 4) + pill / 2} y={letterY + 5} text={c} size={14} bold style={INK} />
              </g>
            ))}
          </g>
        </Drawing>
      }
    />
  );
}

// ── 8. Adding in Roman: pool the letters, then regroup ────────────────────────────────
const ADD_A = 27;
export function RomanAdditionCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("addition");
  const s = useStepper(16, { min: 1, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const X0 = 24;
  const LBL = 70;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - 2 * X0)) * 99);
  const { W, H } = d;
  const b = s.value;
  const sum = ADD_A + b;
  const order = "MDCLXVI";
  const pooled = [...(additive(ADD_A) + additive(b))].sort((p, q) => order.indexOf(p) - order.indexOf(q)).join("");
  const lines = [
    { key: "a", label: "a", text: toRoman(ADD_A) },
    { key: "b", label: "b", text: toRoman(b) },
    { key: "pooled", label: t("pooled"), text: pooled },
    { key: "sum", label: "a + b", text: toRoman(sum) },
  ];
  const trackY = H - 18;
  const rowH = (trackY - 30) / 4;
  const pill = Math.min(26, (W - X0 - LBL - 10) / Math.max(...lines.map((l) => l.text.length)) - 3);
  const valueText = `${toRoman(ADD_A)} + ${toRoman(b)} = ${toRoman(sum)}`;
  const rows: KitRow[] = [
    { key: "a", label: "a", value: `${toRoman(ADD_A)} = ${ADD_A}` },
    { key: "b", label: "b", value: `${toRoman(b)} = ${b}` },
    { key: "pooled", label: t("rowPooled"), value: `${pooled} (${pooled.length})` },
    { key: "sum", label: "a + b", value: `${toRoman(sum)} = ${sum}`, isKey: true },
    { key: "len", label: t("rowLetters"), value: String(toRoman(sum).length) },
  ];
  return (
    <IndicatorCard
      idPrefix="roman"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { ab: ltr(`${toRoman(ADD_A)} + ${toRoman(b)}`), sum: ltr(`${toRoman(sum)} = ${sum}`) })}
      controls={<KitControls s={s} valueText={`b = ${b}`} testId="roman-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((b - 1) / 99) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="roman-c8">
          {lines.map((l, i) => {
            const y = 22 + rowH * i + rowH / 2;
            const on = hover === l.key;
            return (
              <g key={l.key} onPointerEnter={() => setHover(l.key)} onPointerLeave={() => setHover(null)}>
                <T x={X0} y={y + 4} text={l.label} anchor="start" size={12} bold style={l.key === "sum" ? INK : MUTED} />
                {[...l.text].map((c, j) => (
                  <g key={j}>
                    <rect x={X0 + LBL + j * (pill + 3)} y={y - 12} width={pill} height={24} rx={12} style={{ fill: l.key === "sum" ? "var(--cv-to-soft)" : l.key === "pooled" ? "var(--glass-track)" : "var(--cv-from-soft)", ...lit(on) }} />
                    <T x={X0 + LBL + j * (pill + 3) + pill / 2} y={y + 4.5} text={c} size={pill < 18 ? 12 : 12.5} bold style={INK} />
                  </g>
                ))}
              </g>
            );
          })}
          <Track x0={X0} x1={W - X0} y={trackY} f={(b - 1) / 99} />
        </Drawing>
      }
    />
  );
}
