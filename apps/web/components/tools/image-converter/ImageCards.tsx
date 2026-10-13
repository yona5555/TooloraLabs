"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { axisTicks, Drawing, INK, LINE, lit, MUTED, px2, SvgLabel as T, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { clamp, fmtSmart, sup } from "@/components/tool-ui/indicator-kit/format";
import { formatBytes } from "./formatBytes";

/**
 * The eight 2D image-converter indicator cards. Each card owns its state (seeded once, never linked
 * to the Result card or to another card) and computes only exact quantities: raw pixel memory,
 * colour counts, the JPEG DCT basis, the IJG quality scaling, chroma subsampling, resize scaling,
 * transfer time at a stated link speed, and the dates from Behind the Tool.
 */
type Side = "visual-left" | "table-left";
const n0 = (v: number) => Math.round(v).toLocaleString("en-US");
const g = (v: number, sig = 3) => fmtSmart(v, sig);

function useCardText(key: string) {
  return { t: useTranslations(`tools.image-converter.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

/** A horizontal value track at the bottom of a drawing (rounded bar, filled to the value). */
function Track({ x0, x1, y, f }: { x0: number; x1: number; y: number; f: number }) {
  return (
    <g>
      <line x1={x0} y1={y} x2={x1} y2={y} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
      <line x1={x0} y1={y} x2={x0 + clamp(f, 0, 1) * (x1 - x0)} y2={y} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
}

// ── 1. Raw pixel memory: labeled bars for RGBA, RGB and grayscale ─────────────────────
const W_MIN = 320;
const W_MAX = 8000;
export function ImageRawMemoryCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("raw");
  const s = useStepper(4000, { min: W_MIN, max: W_MAX, step: 80 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 26;
  const d = useDrawing(HMIN, s, (x, _y, W) => W_MIN + ((x - X0) / (W - 2 * X0)) * (W_MAX - W_MIN));
  const { W, H } = d;
  const w = s.value;
  const h = Math.round((w * 3) / 4);
  const px = w * h;
  const bars = [
    { key: "rgba", label: "RGBA × 4", bytes: px * 4, color: "var(--cv-from)" },
    { key: "rgb", label: "RGB × 3", bytes: px * 3, color: "var(--cv-to)" },
    { key: "gray", label: t("gray"), bytes: px, color: "var(--cv-third)" },
  ];
  const trackY = H - 22;
  const base = trackY - 44;
  const top = 34;
  const maxB = W_MAX * Math.round((W_MAX * 3) / 4) * 4;
  const cw = (W - 2 * X0) / 3;
  const bw = Math.min(70, cw * 0.55);
  const valueText = `${n0(w)} × ${n0(h)} px = ${formatBytes(px * 4)} RGBA`;
  const rows: KitRow[] = [
    { key: "dims", label: t("rowDims"), value: `${n0(w)} × ${n0(h)}` },
    { key: "px", label: t("rowPixels"), value: `${g(px / 1e6)} MP` },
    { key: "rgba", label: "w × h × 4", value: formatBytes(px * 4), isKey: true },
    { key: "rgb", label: "w × h × 3", value: formatBytes(px * 3) },
    { key: "gray", label: "w × h × 1", value: formatBytes(px) },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { dims: ltr(`${n0(w)} × ${n0(h)} px`), size: ltr(formatBytes(px * 4)) })}
      controls={<KitControls s={s} valueText={`${n0(w)} px`} testId="image-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + ((w - W_MIN) / (W_MAX - W_MIN)) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="image-c1">
          <line x1={X0} y1={base} x2={W - X0} y2={base} style={LINE} strokeWidth={1.5} />
          {bars.map((b, i) => {
            const cx = X0 + cw * (i + 0.5);
            const bh = Math.max(3, (Math.sqrt(b.bytes / maxB)) * (base - top));
            return (
              <g key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)}>
                <rect x={px2(cx - bw / 2)} y={px2(base - bh)} width={px2(bw)} height={px2(bh)} rx={Math.min(8, bh / 2)} style={{ fill: b.color, ...lit(hover === b.key) }} />
                <T x={cx} y={base - bh - 7} text={formatBytes(b.bytes)} size={11.5} bold style={INK} />
                <T x={cx} y={base + 16} text={b.label} size={10.5} />
              </g>
            );
          })}
          <Track x0={X0} x1={W - X0} y={trackY} f={(w - W_MIN) / (W_MAX - W_MIN)} />
        </Drawing>
      }
    />
  );
}

// ── 2. Bit depth: colour count on a logarithmic magnitude bar ─────────────────────────
export function ImageBitDepthCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("bitDepth");
  const s = useStepper(8, { min: 1, max: 24, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 220;
  const X0 = 30;
  const E_MAX = 8; // 10⁸ > 2²⁴
  const d = useDrawing(HMIN, s, (x, _y, W) => {
    const e = ((x - X0) / (W - 2 * X0)) * E_MAX;
    return e / Math.log10(2);
  });
  const { W, H } = d;
  const bits = s.value;
  const colors = 2 ** bits;
  const xe = (e: number) => px2(X0 + (e / E_MAX) * (W - 2 * X0));
  const xb = (b: number) => xe(b * Math.log10(2));
  const barY = H / 2 - 4;
  const marks = [
    { b: 1, label: "1-bit" },
    { b: 8, label: "PNG-8" },
    { b: 24, label: "24-bit" },
  ];
  const frame = 1920 * 1080;
  const valueText = `${bits}-bit = ${n0(colors)} colors`;
  const rows: KitRow[] = [
    { key: "bits", label: t("rowBits"), value: String(bits) },
    { key: "colors", label: `2^${bits}`, value: n0(colors), isKey: true },
    { key: "bpp", label: t("rowBytesPerPixel"), value: g(bits / 8) },
    { key: "frame", label: t("rowFrame"), value: formatBytes(Math.ceil((frame * bits) / 8)) },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { bits: ltr(`${bits}-bit`), colors: ltr(n0(colors)) })}
      controls={<KitControls s={s} valueText={`${bits}-bit`} testId="image-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xb(bits), y: barY, dir: "horizontal" }} s={s} testId="image-c2">
          <rect x={X0} y={barY - 12} width={W - 2 * X0} height={24} rx={12} style={{ fill: "var(--glass-track)" }} />
          <rect x={X0} y={barY - 12} width={Math.max(24, xb(bits) - X0)} height={24} rx={12} style={{ fill: "var(--cv-from)", ...lit(hover === "colors") }} onPointerEnter={() => setHover("colors")} onPointerLeave={() => setHover(null)} />
          {Array.from({ length: E_MAX + 1 }, (_, e) => (
            <g key={e}>
              <line x1={xe(e)} y1={barY + 16} x2={xe(e)} y2={barY + 24} style={LINE} strokeWidth={1.25} />
              <T x={xe(e)} y={barY + 38} text={`10${sup(e)}`} size={10.5} anchor={e === 0 ? "start" : e === E_MAX ? "end" : "middle"} />
            </g>
          ))}
          {marks.map((m) => (
            <g key={m.b}>
              <line x1={xb(m.b)} y1={barY - 30} x2={xb(m.b)} y2={barY - 14} style={{ stroke: "var(--cv-to)" }} strokeWidth={2} />
              <T x={xb(m.b)} y={barY - 36} text={m.label} size={10.5} bold anchor={m.b === 1 ? "start" : "middle"} style={{ fill: "var(--cv-to)" }} />
            </g>
          ))}
          <T x={W / 2} y={H - 14} text={`${n0(colors)} ${t("colorsUnit")}`} size={14} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 3. The JPEG DCT basis: one 8-sample cosine per frequency ─────────────────────────
export function ImageDctCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("dct");
  const s = useStepper(2, { min: 0, max: 7, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 30;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 7);
  const { W, H } = d;
  const k = s.value;
  const c = (x: number) => Math.cos(((2 * x + 1) * k * Math.PI) / 16);
  const samples = Array.from({ length: 8 }, (_, x) => c(x));
  const trackY = H - 20;
  const mid = (trackY - 40) / 2 + 12;
  const amp = mid - 24;
  const xs = (x: number) => X0 + 14 + ((x + 0.5) / 8) * (W - 2 * X0 - 28);
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = i / 10 - 0.5;
    return `${i ? "L" : "M"} ${px2(xs(x))} ${px2(mid - Math.cos(((2 * x + 1) * k * Math.PI) / 16) * amp)}`;
  }).join(" ");
  const energy = samples.reduce((a, v) => a + v * v, 0);
  const valueText = `k = ${k}`;
  const rows: KitRow[] = [
    { key: "k", label: t("rowFrequency"), value: `k = ${k}` },
    { key: "cycles", label: t("rowCycles"), value: g(k / 2) },
    { key: "x0", label: "cos(kπ/16)", value: samples[0].toFixed(3), isKey: true },
    { key: "x7", label: "cos(15kπ/16)", value: samples[7].toFixed(3) },
    { key: "energy", label: "Σ c(x)²", value: energy.toFixed(1) },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(`k = ${k}`), cycles: ltr(g(k / 2)), count: k / 2 })}
      controls={<KitControls s={s} valueText={valueText} testId="image-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (k / 7) * (W - 2 * X0), y: trackY, dir: "horizontal" }} s={s} testId="image-c3">
          <line x1={X0} y1={mid} x2={W - X0} y2={mid} style={LINE} strokeWidth={1.25} />
          <path d={curve} fill="none" style={{ stroke: "var(--cv-from-soft)" }} strokeWidth={3} />
          {samples.map((v, x) => {
            const on = (x === 0 && hover === "x0") || (x === 7 && hover === "x7");
            return (
              <g key={x}>
                <line x1={xs(x)} y1={mid} x2={xs(x)} y2={px2(mid - v * amp)} style={{ stroke: "var(--cv-from)" }} strokeWidth={on ? 4 : 2.5} />
                <circle cx={xs(x)} cy={px2(mid - v * amp)} r={on ? 6.5 : 5} style={{ fill: v >= 0 ? "var(--cv-from)" : "var(--cv-to)" }} />
                <T x={xs(x)} y={trackY - 18} text={`x${x}`} size={10} />
              </g>
            );
          })}
          <Track x0={X0} x1={W - X0} y={trackY} f={k / 7} />
        </Drawing>
      }
    />
  );
}

// ── 4. The quality setting: the IJG quantization scale curve ─────────────────────────
const ijgScale = (q: number) => (q < 50 ? 5000 / q : 200 - 2 * q);
const qStep = (base: number, q: number) => clamp(Math.floor((base * ijgScale(q) + 50) / 100), 1, 255);
export function ImageQualityCurveCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("quality");
  const s = useStepper(85, { min: 1, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 260;
  const X0 = 44;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - X0 - 18)) * 99);
  const { W, H } = d;
  const q = s.value;
  const Y0 = H - 34;
  const Y1 = 20;
  // Log scale on the step axis: 1 … 255.
  const yq = (v: number) => px2(Y0 - (Math.log10(v) / Math.log10(255)) * (Y0 - Y1));
  const xq = (v: number) => px2(X0 + ((v - 1) / 99) * (W - X0 - 18));
  const path = (base: number) => Array.from({ length: 100 }, (_, i) => `${i ? "L" : "M"} ${xq(i + 1)} ${yq(qStep(base, i + 1))}`).join(" ");
  const dc = qStep(16, q);
  const hi = qStep(121, q);
  const valueText = `Q ${q}: ${dc} / ${hi}`;
  const rows: KitRow[] = [
    { key: "q", label: t("rowQuality"), value: `${q}` },
    { key: "scale", label: t("rowScale"), value: `${g(ijgScale(q))} %` },
    { key: "dc", label: t("rowDc"), value: String(dc), isKey: true },
    { key: "hi", label: t("rowHigh"), value: String(hi) },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { q: ltr(String(q)), dc: ltr(String(dc)), hi: ltr(String(hi)) })}
      controls={<KitControls s={s} valueText={`Q ${q}`} testId="image-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xq(q), y: yq(hi), dir: "horizontal" }} s={s} testId="image-c4">
          {[1, 10, 100, 255].map((v) => (
            <g key={v}>
              <line x1={X0} y1={yq(v)} x2={W - 18} y2={yq(v)} style={{ stroke: "var(--ph-grid)" }} strokeWidth={1} />
              <T x={X0 - 6} y={yq(v) + 4} text={String(v)} anchor="end" size={10.5} />
            </g>
          ))}
          {axisTicks(0, 100, W - X0 - 18, 52).map((v) => (
            <T key={v} x={xq(Math.max(1, v))} y={Y0 + 18} text={String(v)} size={10.5} anchor={v === 0 ? "start" : v === 100 ? "end" : "middle"} />
          ))}
          <g onPointerEnter={() => setHover("hi")} onPointerLeave={() => setHover(null)}>
            <path d={path(121)} fill="none" style={{ stroke: "var(--cv-to)" }} strokeWidth={hover === "hi" ? 4 : 2.5} />
          </g>
          <g onPointerEnter={() => setHover("dc")} onPointerLeave={() => setHover(null)}>
            <path d={path(16)} fill="none" style={{ stroke: "var(--cv-from)" }} strokeWidth={hover === "dc" ? 4 : 2.5} />
          </g>
          <line x1={xq(q)} y1={Y1} x2={xq(q)} y2={Y0} style={{ stroke: "var(--ph-ink-muted)" }} strokeDasharray="4 4" />
          <circle cx={xq(q)} cy={yq(dc)} r={6} style={{ fill: "var(--cv-from)", stroke: "var(--ph-surface)" }} strokeWidth={2} />
          <T x={xq(q) + (q > 70 ? -10 : 10)} y={yq(dc) - 8} text={`${dc}`} anchor={q > 70 ? "end" : "start"} bold style={{ fill: "var(--cv-from)" }} />
          <T x={xq(q) + (q > 70 ? -16 : 16)} y={yq(hi) + 4} text={`${hi}`} anchor={q > 70 ? "end" : "start"} bold style={{ fill: "var(--cv-to)" }} />
        </Drawing>
      }
    />
  );
}

// ── 5. Chroma subsampling: Y, Cb and Cr samples as stacked segments ──────────────────
const MODES = [
  { name: "4:4:4", c: 8 },
  { name: "4:2:2", c: 4 },
  { name: "4:2:0", c: 2 },
  { name: "4:1:1", c: 2 },
];
export function ImageChromaCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("chroma");
  const s = useStepper(2, { min: 0, max: 3, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 92;
  const TX = 24; // the handle track, clear of the mode labels
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => ((y - 26) / (H - 60)) * 3);
  const { W, H } = d;
  const m = MODES[s.value];
  const total = (c: number) => 8 + 2 * c;
  const xs = (v: number) => X0 + (v / 24) * (W - X0 - 54);
  const rowY = (i: number) => px2(26 + (i / 3) * (H - 60));
  const frame = 1920 * 1080;
  const valueText = `${m.name}: ${total(m.c)} / 24`;
  const rows: KitRow[] = [
    { key: "mode", label: t("rowMode"), value: m.name },
    { key: "y", label: "Y", value: "8" },
    { key: "c", label: "Cb + Cr", value: `${m.c} + ${m.c}` },
    { key: "total", label: t("rowTotal"), value: `${total(m.c)} / 24`, isKey: true },
    { key: "frame", label: t("rowFrame"), value: n0((frame * total(m.c)) / 8) },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { mode: ltr(m.name), pct: ltr(`${Math.round((total(m.c) / 24) * 100)} %`) })}
      controls={<KitControls s={s} valueText={m.name} testId="image-c5" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: TX, y: rowY(s.value), dir: "vertical" }} s={s} testId="image-c5">
          {MODES.map((md, i) => {
            const y = rowY(i);
            const on = i === s.value;
            const seg = [
              { k: "y", v: 8, from: 0, color: "var(--cv-from)" },
              { k: "c", v: md.c, from: 8, color: "var(--cv-to)" },
              { k: "c", v: md.c, from: 8 + md.c, color: "var(--cv-third)" },
            ];
            return (
              <g key={md.name} opacity={on ? 1 : 0.45}>
                <T x={X0 - 8} y={y + 4} text={md.name} anchor="end" bold={on} style={on ? INK : MUTED} />
                {seg.map((sg, j) => (
                  <rect
                    key={j}
                    x={px2(xs(sg.from) + 1)}
                    y={y - 11}
                    width={px2(Math.max(2, xs(sg.v) - X0 - 2))}
                    height={22}
                    rx={6}
                    style={{ fill: sg.color, ...lit(on && hover === sg.k) }}
                    onPointerEnter={() => setHover(sg.k)}
                    onPointerLeave={() => setHover(null)}
                  />
                ))}
                <T x={xs(total(md.c)) + 8} y={y + 4} text={`${total(md.c)}`} anchor="start" bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <line x1={TX} y1={rowY(0)} x2={TX} y2={rowY(3)} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <T x={X0} y={H - 8} text="Y" anchor="start" bold style={{ fill: "var(--cv-from)" }} />
          <T x={X0 + 18} y={H - 8} text="Cb" anchor="start" bold style={{ fill: "var(--cv-to)" }} />
          <T x={X0 + 44} y={H - 8} text="Cr" anchor="start" bold style={{ fill: "var(--cv-third)" }} />
        </Drawing>
      }
    />
  );
}

// ── 6. Resizing: the resized frame inside the original, to scale ─────────────────────
const OW = 4000;
const OH = 3000;
export function ImageResizeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("resize");
  const s = useStepper(1920, { min: 400, max: OW, step: 40 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 270;
  const X0 = 24;
  const d = useDrawing(HMIN, s, (x, _y, W, H) => {
    const sc = Math.min((W - 2 * X0) / OW, (H - 56) / OH);
    return (x - X0) / sc;
  });
  const { W, H } = d;
  const sc = Math.min((W - 2 * X0) / OW, (H - 56) / OH);
  const k = Math.min(1, s.value / OW);
  const nw = Math.round(OW * k);
  const nh = Math.round(OH * k);
  const ratio = (nw * nh) / (OW * OH);
  const Y0 = 18;
  const valueText = `${n0(nw)} × ${n0(nh)} px`;
  const rows: KitRow[] = [
    { key: "orig", label: t("rowOriginal"), value: `${n0(OW)} × ${n0(OH)}` },
    { key: "new", label: t("rowNew"), value: `${n0(nw)} × ${n0(nh)}`, isKey: true },
    { key: "scale", label: t("rowScale"), value: `${g(k * 100)} %` },
    { key: "pixels", label: t("rowPixels"), value: `${g(ratio * 100)} %` },
    { key: "fewer", label: t("rowFewer"), value: `${g(1 / ratio)} ×` },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { dims: ltr(`${n0(nw)} × ${n0(nh)}`), pct: ltr(`${g(ratio * 100)} %`) })}
      controls={<KitControls s={s} valueText={`${n0(s.value)} px`} testId="image-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: px2(X0 + nw * sc), y: px2(Y0 + (nh * sc) / 2), dir: "horizontal" }} s={s} testId="image-c6">
          <g onPointerEnter={() => setHover("orig")} onPointerLeave={() => setHover(null)}>
            <rect x={X0} y={Y0} width={px2(OW * sc)} height={px2(OH * sc)} rx={10} style={{ fill: "var(--cv-to-soft)", ...lit(hover === "orig") }} strokeDasharray="6 4" />
          </g>
          <g onPointerEnter={() => setHover("new")} onPointerLeave={() => setHover(null)}>
            <rect x={X0} y={Y0} width={px2(nw * sc)} height={px2(nh * sc)} rx={8} style={{ fill: "var(--cv-from-soft)", stroke: "var(--cv-from)", strokeWidth: hover === "new" ? 3 : 2 }} />
          </g>
          <T x={X0 + OW * sc - 8} y={Y0 + OH * sc - 10} text={`${n0(OW)} × ${n0(OH)}`} anchor="end" style={{ fill: "var(--cv-to)" }} bold />
          {nh * sc > 40 && <T x={X0 + 10} y={Y0 + 20} text={`${n0(nw)} × ${n0(nh)}`} anchor="start" bold style={{ fill: "var(--cv-from)" }} />}
          <T x={W / 2} y={H - 12} text={`${g(ratio * 100)} % ${t("ofPixels")}`} size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 7. Transfer time: the same file over four link speeds ────────────────────────────
const LINKS = [1.5, 10, 50, 300]; // Mbit/s
export function ImageTransferCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("transfer");
  const s = useStepper(500, { min: 10, max: 5000, step: 10 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 84;
  const d = useDrawing(HMIN, s, (x, _y, W) => 10 + ((x - 24) / (W - 48)) * 4990);
  const { W, H } = d;
  const kb = s.value;
  const bits = kb * 1024 * 8;
  const secs = LINKS.map((mbps) => bits / (mbps * 1e6));
  const tMax = (5000 * 1024 * 8) / (LINKS[0] * 1e6);
  const trackY = H - 20;
  const rowY = (i: number) => 22 + i * ((trackY - 60) / 3);
  // Square-root scale: the fast links stay readable next to the slow one.
  const xt = (sec: number) => X0 + Math.sqrt(sec / tMax) * (W - X0 - 70);
  const fmtT = (sec: number) => (sec < 1 ? `${n0(sec * 1000)} ms` : `${g(sec)} s`);
  const valueText = `${formatBytes(kb * 1024)}: ${fmtT(secs[0])} … ${fmtT(secs[3])}`;
  const rows: KitRow[] = [
    { key: "size", label: t("rowSize"), value: formatBytes(kb * 1024) },
    ...LINKS.map((mbps, i) => ({ key: `l${i}`, label: `${mbps} Mbit/s`, value: fmtT(secs[i]), isKey: i === 1 })),
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { size: ltr(formatBytes(kb * 1024)), time: ltr(fmtT(secs[1])) })}
      controls={<KitControls s={s} valueText={formatBytes(kb * 1024)} testId="image-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: 24 + ((kb - 10) / 4990) * (W - 48), y: trackY, dir: "horizontal" }} s={s} testId="image-c7">
          {LINKS.map((mbps, i) => {
            const y = rowY(i);
            const on = hover === `l${i}`;
            return (
              <g key={mbps} onPointerEnter={() => setHover(`l${i}`)} onPointerLeave={() => setHover(null)}>
                <T x={X0 - 8} y={y + 4} text={`${mbps} Mbit/s`} anchor="end" size={10.5} bold={on} style={on ? INK : MUTED} />
                <rect x={X0} y={y - 9} width={W - X0 - 70} height={18} rx={9} style={{ fill: "var(--glass-track)" }} />
                <rect x={X0} y={y - 9} width={px2(Math.max(18, xt(secs[i]) - X0))} height={18} rx={9} style={{ fill: i === 0 ? "var(--cv-to)" : "var(--cv-from)", ...lit(on) }} />
                <T x={px2(Math.max(X0 + 18, xt(secs[i])) + 6)} y={y + 4} text={fmtT(secs[i])} anchor="start" size={11} bold style={INK} />
              </g>
            );
          })}
          <Track x0={24} x1={W - 24} y={trackY} f={(kb - 10) / 4990} />
        </Drawing>
      }
    />
  );
}

// ── 8. From DCT to WebP: the dates in Behind the Tool on one timeline ─────────────────
const EVENTS = [
  { y: 1972, k: "dct" },
  { y: 1986, k: "group" },
  { y: 1992, k: "jpeg" },
  { y: 1994, k: "lzw" },
  { y: 1996, k: "png" },
  { y: 2010, k: "webp" },
];
const Y_MIN = 1970;
const Y_MAX = 2012;
export function ImageTimelineCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("timeline");
  const s = useStepper(1992, { min: Y_MIN, max: Y_MAX, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const X0 = 28;
  const d = useDrawing(HMIN, s, (x, _y, W) => Y_MIN + ((x - X0) / (W - 2 * X0)) * (Y_MAX - Y_MIN));
  const { W, H } = d;
  const yr = s.value;
  const xy = (v: number) => px2(X0 + ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (W - 2 * X0));
  const lineY = H / 2 + 6;
  const reached = EVENTS.filter((e) => e.y <= yr);
  const last = reached[reached.length - 1];
  const next = EVENTS.find((e) => e.y > yr);
  // Three label tiers (two above, one below) so the close 1992 / 1994 / 1996 years never collide.
  const tier = [-1, -1, -2, 1, -1, -1];
  const valueText = `${yr}: ${last ? t(`events.${last.k}`) : "—"}`;
  const rows: KitRow[] = [
    { key: "year", label: t("rowYear"), value: String(yr) },
    { key: "last", label: last ? t(`events.${last.k}`) : t("rowLast"), value: last ? `${last.y}` : "—", isKey: true },
    { key: "next", label: t("rowNext"), value: next ? `${next.y} (+${next.y - yr})` : "—" },
    { key: "count", label: t("rowCount"), value: `${reached.length} / ${EVENTS.length}` },
  ];
  return (
    <IndicatorCard
      idPrefix="image"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { year: ltr(String(yr)), n: ltr(String(reached.length)) })}
      controls={<KitControls s={s} valueText={String(yr)} testId="image-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: xy(yr), y: lineY, dir: "horizontal" }} s={s} testId="image-c8">
          <line x1={X0} y1={lineY} x2={W - X0} y2={lineY} style={{ stroke: "var(--glass-track)" }} strokeWidth={8} strokeLinecap="round" />
          <line x1={X0} y1={lineY} x2={xy(yr)} y2={lineY} style={{ stroke: "var(--ph-accent-strong)" }} strokeWidth={8} strokeLinecap="round" />
          {EVENTS.map((e, i) => {
            const on = e.y <= yr;
            const ty = lineY + tier[i] * 30;
            const lit2 = last?.k === e.k && hover === "last";
            return (
              <g key={e.k}>
                <line x1={xy(e.y)} y1={lineY} x2={xy(e.y)} y2={ty + (tier[i] < 0 ? 6 : -14)} style={{ stroke: on ? "var(--cv-from)" : "var(--ph-line)" }} strokeWidth={1.5} />
                <circle cx={xy(e.y)} cy={lineY} r={lit2 ? 9 : 7} style={{ fill: on ? "var(--cv-from)" : "var(--ph-surface)", stroke: "var(--ph-line)" }} strokeWidth={1.25} />
                <T x={xy(e.y)} y={ty} text={String(e.y)} size={11} bold={on} style={on ? INK : MUTED} />
              </g>
            );
          })}
          <T x={X0} y={H - 10} text={String(Y_MIN)} anchor="start" size={10.5} />
          <T x={W - X0} y={H - 10} text={String(Y_MAX)} anchor="end" size={10.5} />
        </Drawing>
      }
    />
  );
}
