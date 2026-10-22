"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl, type HarmonyType } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, MUTED, px2, SvgLabel, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { BLACK, contrast, HARMONY_OFFSETS, hexOfHsl, HUE_NAMES, hueName, luminance, MONOCHROMATIC_LIGHTNESS, SAMPLE_HEX, WHITE, wrap360 } from "./paletteMath";

/**
 * The eight 2D Color Palette Generator indicator cards. Every number is the tool's own conversion
 * (hex ↔ RGB ↔ HSL, harmony offsets, monochromatic steps) or the WCAG 2.x luminance/contrast formula,
 * on the tool's own sample #3B82F6. Each card keeps its own seeded, independent state.
 */
type Side = "visual-left" | "table-left";
const T = SvgLabel;
const SAMPLE_RGB = hexToRgb(SAMPLE_HEX) ?? { r: 59, g: 130, b: 246 };
const SAMPLE_HSL = rgbToHsl(SAMPLE_RGB);
const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");
const soft = (c: string, pct = 30) => `color-mix(in oklab, ${c} ${pct}%, transparent)`;
const fill = (hex: string) => ({ fill: hex, stroke: "var(--ph-line)" });

function useCardText(key: string) {
  return { t: useTranslations(`tools.color-palette-generator.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit"), tN: useTranslations("tools.color-palette-generator.hueNames") };
}

// ── 1. RGB channels as labelled bars — the blue channel is yours to change ────────────────
export function PaletteRgbCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("rgb");
  const s = useStepper(SAMPLE_RGB.b, { min: 0, max: 255, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const rgb = { r: SAMPLE_RGB.r, g: SAMPLE_RGB.g, b: s.value };
  const hex = rgbToHex(rgb).toUpperCase();
  const h = rgbToHsl(rgb);
  const HMIN = 250;
  const TOP = 24;
  const BOT = 40;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => ((H - BOT - y) / (H - BOT - TOP)) * 255);
  const { W, H } = d;
  const plotH = H - BOT - TOP;
  const barW = Math.min(56, (W * 0.55) / 4);
  const chans = [
    { key: "r", label: "R", v: rgb.r, color: `rgb(${rgb.r}, 0, 0)` },
    { key: "g", label: "G", v: rgb.g, color: `rgb(0, ${rgb.g}, 0)` },
    { key: "b", label: "B", v: rgb.b, color: `rgb(0, 0, ${rgb.b})` },
  ];
  const x0 = 26;
  const gap = (W * 0.62 - x0) / 3;
  const rows: KitRow[] = [
    ...chans.map((c) => ({ key: c.key, label: t(`row${c.label}`), value: `${c.v} = 0x${hex2(c.v)}` })),
    { key: "hex", label: t("rowHex"), value: hex, isKey: true },
    { key: "hue", label: t("rowHue"), value: `${Math.round(h.h)}°` },
  ];
  const bx = (i: number) => x0 + i * gap + (gap - barW) / 2;
  const by = (v: number) => H - BOT - (v / 255) * plotH;
  const valueText = `B = ${s.value} → ${hex}`;
  return (
    <IndicatorCard
      idPrefix="cp"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { b: ltr(String(s.value)), hex: ltr(hex) })}
      controls={<KitControls s={s} valueText={`B ${s.value}`} testId="cp-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: bx(2) + barW / 2, y: by(s.value), dir: "vertical" }} s={s} testId="cp-c1">
          <line x1={x0} y1={H - BOT} x2={W * 0.62} y2={H - BOT} style={{ stroke: "var(--ph-line)" }} />
          <line x1={x0} y1={TOP} x2={W * 0.62} y2={TOP} style={{ stroke: "var(--ph-grid)" }} strokeDasharray="3 3" />
          <T x={x0 - 4} y={TOP + 4} text="255" anchor="end" size={9.5} style={MUTED} />
          {chans.map((c, i) => (
            <g key={c.key} onPointerEnter={() => setHover(c.key)} onPointerLeave={() => setHover(null)}>
              <rect x={px2(bx(i))} y={px2(by(c.v))} width={barW} height={px2(Math.max(1, (c.v / 255) * plotH))} rx={6} style={{ fill: c.color, stroke: hover === c.key ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: hover === c.key ? 2 : 1 }} />
              {i !== 2 && <T x={bx(i) + barW / 2} y={by(c.v) - 6} text={String(c.v)} size={11} bold style={INK} />}
              <T x={bx(i) + barW / 2} y={H - BOT + 16} text={c.label} size={12} bold style={INK} />
            </g>
          ))}
          <rect x={W * 0.68} y={TOP + 10} width={W * 0.28} height={plotH - 40} rx={14} style={fill(hex)} />
          <T x={W * 0.82} y={TOP + plotH - 10} text={hex} size={13} bold style={INK} />
          <T x={W * 0.82} y={H - BOT + 16} text={`${Math.round(h.h)}°`} size={11} style={MUTED} />
        </Drawing>
      }
    />
  );
}

// ── 2. Hex pairs → decimal (flow arrows), the blue pair's first digit is yours ───────────
export function PaletteHexCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("hex");
  const s = useStepper(Math.floor(SAMPLE_RGB.b / 16), { min: 0, max: 15, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const b = s.value * 16 + (SAMPLE_RGB.b % 16);
  const rgb = { r: SAMPLE_RGB.r, g: SAMPLE_RGB.g, b };
  const hex = rgbToHex(rgb).toUpperCase();
  const HMIN = 240;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - 44) / (W - 88)) * 15);
  const { W, H } = d;
  const pairs = [
    { key: "r", label: "R", v: rgb.r },
    { key: "g", label: "G", v: rgb.g },
    { key: "b", label: "B", v: rgb.b },
  ];
  const colW = (W - 20) / 3;
  const rows: KitRow[] = [
    ...pairs.map((p) => ({ key: p.key, label: `${p.label}: ${hex2(p.v)}`, value: `${Math.floor(p.v / 16)} × 16 + ${p.v % 16} = ${p.v}` })),
    { key: "hex", label: t("rowHex"), value: hex, isKey: true },
  ];
  const trackY = H - 26;
  const valueText = `B pair ${hex2(b)} = ${b}`;
  return (
    <IndicatorCard
      idPrefix="cp"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { pair: ltr(hex2(b)), b: ltr(String(b)), hex: ltr(hex) })}
      controls={<KitControls s={s} valueText={`${s.value.toString(16).toUpperCase()}…`} testId="cp-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: 44 + (s.value / 15) * (W - 88), y: trackY, dir: "horizontal" }} s={s} testId="cp-c2">
          <rect x={10} y={10} width={W - 20} height={34} rx={10} style={fill(hex)} />
          <T x={W / 2} y={33} text={hex} size={15} bold style={luminance(rgb) > 0.35 ? { fill: "var(--color-black)" } : { fill: "var(--color-white)" }} />
          {pairs.map((p, i) => {
            const cx = 10 + colW * (i + 0.5);
            const on = hover === p.key || (p.key === "b" && !hover);
            return (
              <g key={p.key} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)}>
                <rect x={cx - 30} y={58} width={60} height={30} rx={8} style={{ fill: on ? "var(--ph-accent-soft)" : "var(--ph-surface)", stroke: "var(--ph-line)" }} />
                <T x={cx} y={78} text={hex2(p.v)} size={14} bold style={INK} />
                <path d={`M ${cx} 92 L ${cx} 112`} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} />
                <polygon points={`${cx - 5},110 ${cx + 5},110 ${cx},117`} style={{ fill: "var(--ph-line)" }} />
                <T x={cx} y={132} text={`${Math.floor(p.v / 16)}×16 + ${p.v % 16}`} size={10.5} style={MUTED} />
                <rect x={cx - 30} y={140} width={60} height={30} rx={15} style={{ fill: soft(p.key === "r" ? "var(--cv-warm)" : p.key === "g" ? "var(--cv-third)" : "var(--cv-from)", on ? 45 : 25) }} />
                <T x={cx} y={160} text={String(p.v)} size={14} bold style={INK} />
              </g>
            );
          })}
          <line x1={44} y1={trackY} x2={W - 44} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
          <T x={14} y={trackY + 4} text="0" anchor="start" size={10} style={MUTED} />
          <T x={W - 14} y={trackY + 4} text="F" anchor="end" size={10} style={MUTED} />
        </Drawing>
      }
    />
  );
}

// ── 3. RGB → HSL, step by step (formula diagram), the green channel is yours ─────────────
export function PaletteHslFormulaCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("hslFormula");
  const s = useStepper(SAMPLE_RGB.g, { min: 0, max: 255, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const rgb = { r: SAMPLE_RGB.r, g: s.value, b: SAMPLE_RGB.b };
  const r1 = rgb.r / 255;
  const g1 = rgb.g / 255;
  const b1 = rgb.b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const L = (max + min) / 2;
  const delta = max - min;
  const S = delta === 0 ? 0 : delta / (1 - Math.abs(2 * L - 1));
  const out = rgbToHsl(rgb);
  const f = (v: number) => v.toFixed(3);
  const rows: KitRow[] = [
    { key: "norm", label: t("rowNorm"), value: `${f(r1)}, ${f(g1)}, ${f(b1)}` },
    { key: "maxmin", label: t("rowMaxMin"), value: `${f(max)} / ${f(min)}` },
    { key: "l", label: "L = (max + min) / 2", value: `${(L * 100).toFixed(1)}%` },
    { key: "s", label: "S = Δ / (1 − |2L − 1|)", value: `${(S * 100).toFixed(1)}%` },
    { key: "h", label: t("rowH"), value: `${out.h.toFixed(1)}°`, isKey: true },
  ];
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - 30) / (W - 60)) * 255);
  const { W, H } = d;
  const boxes = [
    { key: "norm", text: `${f(r1)} ${f(g1)} ${f(b1)}`, sub: "÷ 255" },
    { key: "maxmin", text: `max ${f(max)} · min ${f(min)}`, sub: `Δ = ${f(delta)}` },
    { key: "l", text: `L ${(L * 100).toFixed(1)}%`, sub: "(max+min)/2" },
    { key: "s", text: `S ${(S * 100).toFixed(1)}%`, sub: "Δ/(1−|2L−1|)" },
    { key: "h", text: `H ${out.h.toFixed(1)}°`, sub: t("hSub") },
  ];
  const bh = (H - 70) / boxes.length;
  const trackY = H - 22;
  return (
    <IndicatorCard
      idPrefix="cp"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { g: ltr(String(s.value)), hsl: ltr(`${Math.round(out.h)}° ${Math.round(out.s)}% ${Math.round(out.l)}%`) })}
      controls={<KitControls s={s} valueText={`G ${s.value}`} testId="cp-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`G = ${s.value}`} handle={{ x: 30 + (s.value / 255) * (W - 60), y: trackY, dir: "horizontal" }} s={s} testId="cp-c3">
          {boxes.map((bx, i) => {
            const y = 8 + i * bh;
            const on = hover === bx.key;
            return (
              <g key={bx.key} onPointerEnter={() => setHover(bx.key)} onPointerLeave={() => setHover(null)}>
                <rect x={8} y={y} width={W * 0.6} height={bh - 10} rx={8} style={{ fill: on || bx.key === "h" ? "var(--ph-accent-soft)" : "var(--ph-surface)", stroke: "var(--ph-line)" }} />
                <T x={8 + W * 0.3} y={y + (bh - 10) / 2 + 4} text={bx.text} size={11.5} bold style={INK} />
                <T x={W - 34} y={y + (bh - 10) / 2 + 4} text={bx.sub} anchor="end" size={9.5} style={MUTED} />
                {i < boxes.length - 1 && <path d={`M ${8 + W * 0.3} ${y + bh - 10} L ${8 + W * 0.3} ${y + bh}`} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} />}
              </g>
            );
          })}
          <rect x={W - 26} y={8} width={18} height={H - 70} rx={9} style={fill(rgbToHex(rgb))} />
          <line x1={30} y1={trackY} x2={W - 30} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 4. Every harmony at once (multi-ring donut), the base hue is yours ─────────────────────
const RING_HARMONIES: Exclude<HarmonyType, "monochromatic">[] = ["complementary", "analogous", "triadic", "splitComplementary", "tetradic"];
export function PaletteRingsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("rings");
  const tH = useTranslations("tools.color-palette-generator.form.harmony");
  const s = useStepper(Math.round(SAMPLE_HSL.h), { min: 0, max: 359, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 280;
  const d = useDrawing(HMIN, s, (x, y, W, H) => wrap360((Math.atan2(y - H / 2, x - W / 2) * 180) / Math.PI + 90));
  const { W, H } = d;
  const cx = W / 2;
  const cy = H / 2;
  const R0 = 30;
  const RW = Math.min(18, (Math.min(W, H) / 2 - R0 - 16) / 5);
  const at = (deg: number, r: number) => ({ x: px2(cx + r * Math.cos(((deg - 90) * Math.PI) / 180)), y: px2(cy + r * Math.sin(((deg - 90) * Math.PI) / 180)) });
  const color = (h: number) => hexOfHsl({ h, s: SAMPLE_HSL.s, l: SAMPLE_HSL.l });
  const rows: KitRow[] = RING_HARMONIES.map((h) => ({ key: h, label: tH(h), value: HARMONY_OFFSETS[h].map((o) => `${wrap360(s.value + o)}°`).join(" · "), isKey: h === "complementary" }));
  const outerR = R0 + RW * 5 + 4;
  const hp = at(s.value, outerR + 18);
  return (
    <IndicatorCard
      idPrefix="cp"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { h: ltr(`${s.value}°`), c: ltr(`${wrap360(s.value + 180)}°`) })}
      controls={<KitControls s={s} valueText={`${s.value}°`} testId="cp-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`${s.value}°`} handle={{ x: hp.x, y: hp.y, dir: "circular" }} s={s} testId="cp-c4">
          {RING_HARMONIES.map((h, ri) => {
            const r = R0 + RW * ri + RW / 2;
            const on = hover === h;
            return (
              <g key={h} onPointerEnter={() => setHover(h)} onPointerLeave={() => setHover(null)} opacity={hover && !on ? 0.4 : 1}>
                <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={RW - 3} />
                {HARMONY_OFFSETS[h].map((o, k) => {
                  const p = at(wrap360(s.value + o), r);
                  return <circle key={k} cx={p.x} cy={p.y} r={(RW - 3) / 2 + 1} style={{ fill: color(wrap360(s.value + o)), stroke: o === 0 ? "var(--ph-ink)" : "var(--ph-surface)" }} strokeWidth={o === 0 ? 1.5 : 1} />;
                })}
              </g>
            );
          })}
          <line x1={cx} y1={cy} x2={at(s.value, outerR).x} y2={at(s.value, outerR).y} style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.2} strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={R0 - 6} style={fill(color(s.value))} />
          <T x={cx} y={cy + 4} text={`${s.value}°`} size={11} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 5. The monochromatic ladder (stepped), saturation is yours ─────────────────────────────
export function PaletteLadderCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("ladder");
  const s = useStepper(Math.round(SAMPLE_HSL.s), { min: 0, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const shades = MONOCHROMATIC_LIGHTNESS.map((l) => ({ l, hex: hexOfHsl({ h: SAMPLE_HSL.h, s: s.value, l }).toUpperCase() }));
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - 30) / (W - 60)) * 100);
  const { W, H } = d;
  const BOT = 52;
  const stepW = (W - 40) / 5;
  const plotH = H - BOT - 20;
  const rows: KitRow[] = shades.map((sh, i) => ({ key: String(sh.l), label: `L ${sh.l}%`, value: sh.hex, isKey: i === 2 }));
  const trackY = H - 18;
  return (
    <IndicatorCard
      idPrefix="cp"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { s: ltr(`${s.value}%`), mid: ltr(shades[2].hex) })}
      controls={<KitControls s={s} valueText={`S ${s.value}%`} testId="cp-c5" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`S ${s.value}%`} handle={{ x: 30 + (s.value / 100) * (W - 60), y: trackY, dir: "horizontal" }} s={s} testId="cp-c5">
          {shades.map((sh, i) => {
            const h = (sh.l / 100) * plotH;
            const x = 20 + i * stepW;
            const on = hover === String(sh.l);
            return (
              <g key={sh.l} onPointerEnter={() => setHover(String(sh.l))} onPointerLeave={() => setHover(null)}>
                <rect x={px2(x)} y={px2(H - BOT - h)} width={px2(stepW)} height={px2(h)} style={{ fill: sh.hex, stroke: on ? "var(--ph-focus)" : "var(--ph-surface)", strokeWidth: on ? 2.5 : 1 }} />
                <T x={x + stepW / 2} y={H - BOT - h - 6} text={`${sh.l}%`} size={10.5} bold style={INK} />
                <T x={x + stepW / 2} y={H - BOT + 14} text={sh.hex} size={9.5} style={MUTED} />
              </g>
            );
          })}
          <line x1={20} y1={H - BOT} x2={W - 20} y2={H - BOT} style={{ stroke: "var(--ph-line)" }} />
          <line x1={30} y1={trackY} x2={W - 30} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 6. WCAG contrast on white and black (gauge), lightness is yours ───────────────────────
export function PaletteContrastCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("contrast");
  const s = useStepper(Math.round(SAMPLE_HSL.l), { min: 0, max: 100, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const rgb = hslToRgb({ h: SAMPLE_HSL.h, s: SAMPLE_HSL.s, l: s.value });
  const hex = rgbToHex(rgb).toUpperCase();
  const lum = luminance(rgb);
  const onW = contrast(rgb, WHITE);
  const onB = contrast(rgb, BLACK);
  const pass = (r: number, need: number) => (r >= need ? t("pass") : t("fail"));
  const rows: KitRow[] = [
    { key: "lum", label: t("rowLum"), value: lum.toFixed(4) },
    { key: "white", label: t("rowWhite"), value: `${onW.toFixed(2)}:1` },
    { key: "black", label: t("rowBlack"), value: `${onB.toFixed(2)}:1` },
    { key: "aa", label: t("rowAA"), value: `${pass(onW, 4.5)} · ${pass(onB, 4.5)}`, isKey: true },
    { key: "aaa", label: t("rowAAA"), value: `${pass(onW, 7)} · ${pass(onB, 7)}` },
  ];
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const ang = Math.atan2(H * 0.7 - y, x - W / 2);
    return 100 - (ang / Math.PI) * 100;
  });
  const { W, H } = d;
  const cx = W / 2;
  const cy = H * 0.7;
  const R = Math.min(W * 0.36, H * 0.58);
  const toA = (ratio: number) => Math.PI - ((ratio - 1) / 20) * Math.PI;
  const pt = (a: number, r: number) => ({ x: px2(cx + r * Math.cos(a)), y: px2(cy - r * Math.sin(a)) });
  const arc = (r0: number, r1: number) => {
    const a = pt(toA(r0), R);
    const b = pt(toA(r1), R);
    return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
  };
  const needle = pt(toA(onW), R - 26);
  const posA = Math.PI - (1 - s.value / 100) * Math.PI;
  const hp = pt(posA, R + 24);
  return (
    <IndicatorCard
      idPrefix="cp"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { l: ltr(`${s.value}%`), w: ltr(onW.toFixed(2)), b: ltr(onB.toFixed(2)) })}
      controls={<KitControls s={s} valueText={`L ${s.value}%`} testId="cp-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`L ${s.value}% → ${onW.toFixed(2)}:1`} handle={{ x: hp.x, y: hp.y, dir: "circular" }} s={s} testId="cp-c6">
          <path d={arc(1, 3)} fill="none" style={{ stroke: "var(--glass-danger-strong)" }} strokeWidth={16} />
          <path d={arc(3, 4.5)} fill="none" style={{ stroke: "var(--cv-warm)" }} strokeWidth={16} />
          <path d={arc(4.5, 7)} fill="none" style={{ stroke: "var(--cv-third)" }} strokeWidth={16} />
          <path d={arc(7, 21)} fill="none" style={{ stroke: "var(--glass-success-strong)" }} strokeWidth={16} />
          {[3, 4.5, 7].map((r) => {
            const p = pt(toA(r), R - 20);
            return <T key={r} x={p.x} y={p.y + 4} text={`${r}`} size={10} bold style={MUTED} />;
          })}
          <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} strokeLinecap="round" onPointerEnter={() => setHover("white")} onPointerLeave={() => setHover(null)} />
          <circle cx={cx} cy={cy} r={6} style={{ fill: "var(--ph-ink)" }} />
          <rect x={cx - 52} y={cy + 12} width={104} height={32} rx={8} style={fill(hex)} />
          <text x={cx} y={cy + 33} textAnchor="middle" fontSize={11.5} fontWeight={800} style={{ fill: onW >= onB ? "var(--color-white)" : "var(--color-black)" }}>
            Aa {Math.max(onW, onB).toFixed(1)}
          </text>
          <T x={cx} y={cy - R * 0.42} text={`${onW.toFixed(2)}:1`} size={18} bold style={INK} />
          <T x={cx} y={cy - R * 0.42 + 16} text={t("onWhite")} size={10} style={MUTED} />
        </Drawing>
      }
    />
  );
}

// ── 7. Same lightness, different brightness: 12 hues ranked by real luminance ──────────────
export function PaletteLuminanceCard({ side }: { side: Side }) {
  const { t, tc, tN } = useCardText("luminance");
  const s = useStepper(50, { min: 10, max: 90, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const ranked = useMemo(
    () =>
      HUE_NAMES.map((name, i) => {
        const rgb = hslToRgb({ h: i * 30, s: 100, l: s.value });
        return { name, h: i * 30, hex: rgbToHex(rgb).toUpperCase(), lum: luminance(rgb) };
      }).sort((a, b) => b.lum - a.lum),
    [s.value],
  );
  const maxL = ranked[0].lum || 1;
  const HMIN = 300;
  const LABEL_W = 78;
  const d = useDrawing(HMIN, s, (x, _y, W) => 10 + ((x - LABEL_W) / (W - LABEL_W - 16)) * 80);
  const { W, H } = d;
  const rowH = (H - 40) / 12;
  const rows: KitRow[] = [
    { key: ranked[0].name, label: `1. ${tN(ranked[0].name)}`, value: ranked[0].lum.toFixed(3), isKey: true },
    { key: ranked[1].name, label: `2. ${tN(ranked[1].name)}`, value: ranked[1].lum.toFixed(3) },
    { key: ranked[10].name, label: `11. ${tN(ranked[10].name)}`, value: ranked[10].lum.toFixed(3) },
    { key: ranked[11].name, label: `12. ${tN(ranked[11].name)}`, value: ranked[11].lum.toFixed(3) },
    { key: "ratio", label: t("rowRatio"), value: `${(ranked[0].lum / Math.max(ranked[11].lum, 1e-6)).toFixed(1)}×` },
  ];
  const trackY = H - 14;
  return (
    <IndicatorCard
      idPrefix="cp"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { l: ltr(`${s.value}%`), top: tN(ranked[0].name), bottom: tN(ranked[11].name) })}
      controls={<KitControls s={s} valueText={`L ${s.value}%`} testId="cp-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`L ${s.value}%`} handle={{ x: LABEL_W + ((s.value - 10) / 80) * (W - LABEL_W - 16), y: trackY, dir: "horizontal" }} s={s} testId="cp-c7">
          {ranked.map((r, i) => {
            const y = 8 + i * rowH;
            const w = (r.lum / maxL) * (W - LABEL_W - 60);
            const on = hover === r.name;
            return (
              <g key={r.name} onPointerEnter={() => setHover(r.name)} onPointerLeave={() => setHover(null)}>
                <text x={LABEL_W - 8} y={y + rowH * 0.62} fontSize={10.5} textAnchor="end" style={on ? INK : MUTED}>
                  {tN(r.name)}
                </text>
                <rect x={LABEL_W} y={px2(y + 2)} width={px2(Math.max(2, w))} height={px2(rowH - 5)} rx={4} style={{ fill: r.hex, stroke: on ? "var(--ph-focus)" : "var(--ph-line)", strokeWidth: on ? 2 : 0.8 }} />
                <T x={LABEL_W + w + 6} y={y + rowH * 0.62} text={r.lum.toFixed(3)} anchor="start" size={9.5} style={MUTED} />
              </g>
            );
          })}
          <line x1={LABEL_W} y1={trackY} x2={W - 16} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
        </Drawing>
      }
    />
  );
}

// ── 8. Where a hue sits among the 12 named hues (zone strip), the hue is yours ─────────────
export function PaletteHueZoneCard({ side }: { side: Side }) {
  const { t, tc, tN } = useCardText("hueZone");
  const s = useStepper(Math.round(SAMPLE_HSL.h), { min: 0, max: 359, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const name = hueName(s.value);
  const named = HUE_NAMES.indexOf(name) * 30;
  const dist = Math.min(Math.abs(s.value - named), 360 - Math.abs(s.value - named));
  const comp = wrap360(s.value + 180);
  const here = hexOfHsl({ h: s.value, s: 100, l: 50 }).toUpperCase();
  const compHex = hexOfHsl({ h: comp, s: 100, l: 50 }).toUpperCase();
  const rows: KitRow[] = [
    { key: "hue", label: t("rowHue"), value: `${s.value}° = ${here}` },
    { key: "name", label: t("rowName"), value: `${tN(name)} (${named}°)`, isKey: true },
    { key: "dist", label: t("rowDist"), value: `${dist}°` },
    { key: "comp", label: t("rowComp"), value: `${comp}° · ${tN(hueName(comp))}` },
    { key: "compHex", label: t("rowCompHex"), value: compHex },
  ];
  const HMIN = 220;
  const X0 = 16;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 359);
  const { W, H } = d;
  const SW = W - 2 * X0;
  const Y = 56;
  const SH = 46;
  const xOf = (h: number) => X0 + (h / 360) * SW;
  const segs = 72;
  return (
    <IndicatorCard
      idPrefix="cp"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { h: ltr(`${s.value}°`), name: tN(name), comp: tN(hueName(comp)) })}
      controls={<KitControls s={s} valueText={`${s.value}°`} testId="cp-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={`${s.value}° ${name}`} handle={{ x: xOf(s.value), y: Y + SH + 30, dir: "horizontal" }} s={s} testId="cp-c8">
          {Array.from({ length: segs }, (_, i) => (
            <rect key={i} x={px2(X0 + (i / segs) * SW)} y={Y} width={px2(SW / segs + 0.6)} height={SH} fill={`hsl(${(i * 360) / segs + 2.5} 100% 50%)`} />
          ))}
          <rect x={X0} y={Y} width={SW} height={SH} rx={6} fill="none" style={{ stroke: "var(--ph-line)" }} />
          {HUE_NAMES.map((n, i) => {
            const x = xOf(i * 30);
            const on = n === name;
            return (
              <g key={n} onPointerEnter={() => setHover("name")} onPointerLeave={() => setHover(null)}>
                <line x1={x} y1={Y - 6} x2={x} y2={Y} style={{ stroke: "var(--ph-line)" }} />
                {i % 2 === 0 && <T x={x} y={Y - 10} text={`${i * 30}°`} size={9} style={MUTED} />}
                {on && <rect x={x - 3} y={Y - 2} width={6} height={SH + 4} rx={3} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-ink)" }} />}
              </g>
            );
          })}
          <line x1={xOf(s.value)} y1={Y - 4} x2={xOf(s.value)} y2={Y + SH + 8} style={{ stroke: "var(--ph-ink)" }} strokeWidth={2.5} />
          <line x1={xOf(comp)} y1={Y} x2={xOf(comp)} y2={Y + SH} style={{ stroke: "var(--ph-ink)" }} strokeWidth={1.5} strokeDasharray="4 3" />
          <T x={xOf(comp)} y={Y + SH + 16} text={tN(hueName(comp))} size={10} style={MUTED} />
          <T x={W / 2} y={H - 10} text={`${s.value}° · ${tN(name)} · ${here}`} size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}
