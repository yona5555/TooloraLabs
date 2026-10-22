"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EAN_FIRST_DIGIT_PARITY, EAN_G_CODE, EAN_L_CODE, EAN_R_CODE } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, MUTED, px2, SvgLabel, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { code128Modules, code128Steps, encode, GS1_X_MM, SAMPLE_VALUES, totalModules, upcCheck, upcSteps, widthHistogram } from "./barcodeMath";

/**
 * The eight 2D Barcode Generator indicator cards. Every number is computed by the tool's real
 * encoder or the real ISO/IEC 15420 / 15417 tables, on the tool's own sample values (never a
 * hypothetical example). Each card keeps its own seeded, independent state.
 */
type Side = "visual-left" | "table-left";
const T = SvgLabel;
const ZONE = {
  guard: "var(--bc-zone-guard)",
  system: "var(--bc-zone-system)",
  maker: "var(--bc-zone-maker)",
  product: "var(--bc-zone-product)",
  check: "var(--bc-zone-check)",
};
const soft = (c: string, pct = 30) => `color-mix(in oklab, ${c} ${pct}%, transparent)`;

function useCardText(key: string) {
  return { t: useTranslations(`tools.barcode-generator.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

/** A run of bars from a binary module string, drawn as connected dark runs (the symbol itself). */
function BitBars({ bits, x, y, w, h, color = "var(--ph-ink)" }: { bits: string; x: number; y: number; w: number; h: number; color?: string }) {
  const mw = w / bits.length;
  const runs: { start: number; len: number }[] = [];
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] !== "1") continue;
    if (i > 0 && bits[i - 1] === "1") runs[runs.length - 1].len++;
    else runs.push({ start: i, len: 1 });
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} />
      {runs.map((r) => (
        <rect key={r.start} x={px2(x + r.start * mw)} y={y} width={px2(r.len * mw)} height={h} style={{ fill: color }} />
      ))}
    </g>
  );
}

// ── 1. Check-digit formula (UPC-A sample): one digit is yours to change ──────────────────
const UPC_BODY = SAMPLE_VALUES["upc-a"];
export function BarcodeCheckDigitCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("checkDigit");
  const s = useStepper(Number(UPC_BODY[10]), { min: 0, max: 9, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const body = UPC_BODY.slice(0, 10) + String(s.value);
  const { terms, sum, check } = upcSteps(body);
  const HMIN = 270;
  const TOP = 34;
  const RIB_H = 38;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - W * 0.58) / (W - 22 - W * 0.58)) * 9);
  const { W, H } = d;
  const X0 = 12;
  const TX0 = W * 0.58;
  const TX1 = W - 22;
  const TY = TOP + RIB_H + 62;
  const tx = TX0 + (s.value / 9) * (TX1 - TX0);
  const segW = (W - 24) / 11;
  const odd = terms.filter((_, i) => i % 2 === 0).reduce((a, x) => a + x.digit, 0);
  const even = terms.filter((_, i) => i % 2 === 1).reduce((a, x) => a + x.digit, 0);
  const rows: KitRow[] = [
    { key: "odd", label: t("rowOdd"), value: `${odd} × 3 = ${odd * 3}` },
    { key: "even", label: t("rowEven"), value: `${even} × 1 = ${even}` },
    { key: "sum", label: t("rowSum"), value: String(sum) },
    { key: "mod", label: t("rowMod"), value: `${sum} mod 10 = ${sum % 10}` },
    { key: "check", label: t("rowCheck"), value: `(10 − ${sum % 10}) mod 10 = ${check}`, isKey: true },
    { key: "code", label: t("rowCode"), value: body + check },
  ];
  const valueText = `digit 11 = ${s.value} → check ${check}`;
  return (
    <IndicatorCard
      idPrefix="bc"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { digit: ltr(String(s.value)), check: ltr(String(check)) })}
      controls={<KitControls s={s} valueText={`d₁₁ = ${s.value}`} testId="bc-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: tx, y: TY, dir: "horizontal" }} s={s} testId="bc-c1">
          <line x1={TX0} y1={TY} x2={TX1} y2={TY} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
          <path d={`M ${X0 + segW * 10.5} ${TOP + RIB_H + 36} L ${tx} ${TY - 22}`} fill="none" style={{ stroke: "var(--ph-focus)" }} strokeWidth={1.5} strokeDasharray="3 3" />
          <T x={TX0} y={TY + 30} text="0" size={10} style={MUTED} />
          <T x={TX1} y={TY + 30} text="9" size={10} style={MUTED} />
          <rect x={X0} y={TOP} width={segW * 11} height={RIB_H} rx={8} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} />
          {terms.map((term, i) => {
            const x = X0 + i * segW;
            const w3 = term.weight === 3;
            const on = (hover === "odd" && w3) || (hover === "even" && !w3) || i === 10;
            return (
              <g key={i}>
                <rect x={px2(x)} y={TOP} width={px2(segW)} height={RIB_H} rx={i === 0 || i === 10 ? 8 : 0} style={{ fill: w3 ? soft("var(--cv-to)", on ? 55 : 30) : soft("var(--cv-from)", on ? 40 : 14) }} />
                {i > 0 && <line x1={px2(x)} y1={TOP} x2={px2(x)} y2={TOP + RIB_H} style={{ stroke: "var(--ph-line)" }} />}
                <T x={x + segW / 2} y={TOP + RIB_H / 2 + 6} text={String(term.digit)} size={16} bold style={i === 10 ? { fill: "var(--ph-focus)" } : INK} />
                <T x={x + segW / 2} y={TOP + RIB_H + 16} text={`×${term.weight}`} size={10.5} style={MUTED} />
                <T x={x + segW / 2} y={TOP + RIB_H + 31} text={String(term.product)} size={11} bold style={INK} />
              </g>
            );
          })}
          <T x={X0} y={TOP - 10} text={t("labelBody")} anchor="start" size={10.5} style={MUTED} />
          <path d={`M ${W / 2} ${TOP + RIB_H + 42} L ${W / 2} ${H - 74}`} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} />
          <polygon points={`${W / 2 - 6},${H - 78} ${W / 2 + 6},${H - 78} ${W / 2},${H - 70}`} style={{ fill: "var(--ph-line)" }} />
          <T x={W / 2} y={H - 50} text={`Σ = ${sum}   →   (10 − ${sum % 10}) mod 10`} size={13} bold style={INK} />
          <rect x={W / 2 - 46} y={H - 38} width={92} height={30} rx={15} style={{ fill: soft("var(--bc-ok)", 30), stroke: "var(--bc-ok)" }} />
          <T x={W / 2} y={H - 18} text={`check = ${check}`} size={13} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 2. Bar widths across the three samples (grouped labelled bars) ───────────────────────
const SYMS = ["upc-a", "ean-13", "code128"] as const;
const SYM_COLOR = ["var(--cv-from)", "var(--cv-to)", "var(--cv-warm)"];
export function BarcodeWidthCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("widths");
  const s = useStepper(1, { min: 1, max: 4, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const hist = useMemo(() => SYMS.map((sy) => widthHistogram(encode(sy, SAMPLE_VALUES[sy])?.segments ?? []).bars), []);
  const max = Math.max(...hist.flat(), 1);
  const HMIN = 260;
  const X0 = 30;
  const BOT = 52;
  const d = useDrawing(HMIN, s, (x, _y, W) => Math.max(1, Math.min(4, Math.floor(((x - X0) / (W - X0 - 10)) * 4) + 1)));
  const { W, H } = d;
  const groupW = (W - X0 - 10) / 4;
  const barW = Math.min(26, (groupW - 18) / 3);
  const plotH = H - BOT - 30;
  const sel = s.value - 1;
  const counts = hist.map((h) => h[sel]);
  const totals = hist.map((h) => h.reduce((a, b) => a + b, 0));
  const top = counts.indexOf(Math.max(...counts));
  const rows: KitRow[] = SYMS.map((sy, i) => ({
    key: sy,
    label: t(`sym.${sy}`),
    value: `${counts[i]} / ${totals[i]} (${((counts[i] / totals[i]) * 100).toFixed(0)}%)`,
    isKey: i === top,
  }));
  const valueText = `${s.value}-module bars: ${counts.join(" / ")}`;
  return (
    <IndicatorCard
      idPrefix="bc"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { w: ltr(String(s.value)), sym: t(`sym.${SYMS[top]}`), n: ltr(String(counts[top])) })}
      controls={<KitControls s={s} valueText={`${s.value} X`} testId="bc-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + groupW * (sel + 0.5), y: H - BOT + 14, dir: "horizontal" }} s={s} testId="bc-c2">
          <line x1={X0} y1={H - BOT} x2={W - 10} y2={H - BOT} style={{ stroke: "var(--ph-line)" }} />
          {[0, 1, 2, 3].map((g) => (
            <g key={g} opacity={g === sel ? 1 : 0.45}>
              {g === sel && <rect x={X0 + g * groupW + 2} y={30} width={groupW - 4} height={H - BOT - 30} rx={8} style={{ fill: "var(--ph-accent-soft)" }} />}
              {SYMS.map((sy, i) => {
                const v = hist[i][g];
                const h = (v / max) * (plotH - 18);
                const x = X0 + g * groupW + groupW / 2 + (i - 1) * (barW + 4) - barW / 2;
                return (
                  <g key={sy} onPointerEnter={() => setHover(sy)} onPointerLeave={() => setHover(null)}>
                    <rect x={px2(x)} y={px2(H - BOT - h)} width={px2(barW)} height={px2(Math.max(1, h))} rx={3} style={{ fill: SYM_COLOR[i], opacity: hover && hover !== sy ? 0.4 : 1 }} />
                    <T x={x + barW / 2} y={H - BOT - h - 5} text={String(v)} size={10.5} bold style={INK} />
                  </g>
                );
              })}
              {g !== sel && <T x={X0 + g * groupW + groupW / 2} y={H - BOT + 16} text={`${g + 1} X`} size={11} bold style={MUTED} />}
            </g>
          ))}
          {SYMS.map((sy, i) => (
            <g key={sy}>
              <rect x={X0 + i * ((W - X0) / 3)} y={H - 16} width={10} height={10} rx={2} style={{ fill: SYM_COLOR[i] }} />
              <T x={X0 + i * ((W - X0) / 3) + 14} y={H - 7} text={t(`sym.${sy}`)} anchor="start" size={10.5} style={MUTED} />
            </g>
          ))}
        </Drawing>
      }
    />
  );
}

// ── 3. Physical size at a print magnification (GS1 X-dimension 0.33 mm at 100 %) ─────────
const UPC_ZONES = [
  { key: "quiet", modules: 10, color: "var(--glass-track)" },
  { key: "guard", modules: 3, color: ZONE.guard },
  { key: "left", modules: 42, color: ZONE.maker },
  { key: "center", modules: 5, color: ZONE.guard },
  { key: "right", modules: 42, color: ZONE.product },
  { key: "guard2", modules: 3, color: ZONE.guard },
  { key: "quiet2", modules: 10, color: "var(--glass-track)" },
];
export function BarcodeSizeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("size");
  const s = useStepper(100, { min: 80, max: 200, step: 5 });
  const [hover, setHover] = useState<string | null>(null);
  const realModules = useMemo(() => totalModules(encode("upc-a", UPC_BODY)?.segments ?? []), []);
  const xMm = (GS1_X_MM * s.value) / 100;
  const totalMods = UPC_ZONES.reduce((a, z) => a + z.modules, 0);
  const totalMm = totalMods * xMm;
  const maxMm = totalMods * GS1_X_MM * 2;
  const HMIN = 230;
  const X0 = 14;
  const d = useDrawing(HMIN, s, (x, _y, W) => ((x - X0) / (W - 2 * X0)) * 200);
  const { W, H } = d;
  const plotW = W - 2 * X0;
  const barLen = (totalMm / maxMm) * plotW;
  const Y = 64;
  const rows: KitRow[] = [
    { key: "x", label: t("rowX"), value: `${xMm.toFixed(3)} mm` },
    { key: "data", label: t("rowData", { n: ltr(String(realModules)) }), value: `${(realModules * xMm).toFixed(1)} mm` },
    { key: "quiet", label: t("rowQuiet"), value: `2 × ${(10 * xMm).toFixed(1)} mm` },
    { key: "total", label: t("rowTotal"), value: `${totalMm.toFixed(1)} mm`, isKey: true },
  ];
  const valueText = `${s.value}% → ${totalMm.toFixed(1)} mm`;
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70].filter((v) => v <= maxMm);
  return (
    <IndicatorCard
      idPrefix="bc"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { pct: ltr(`${s.value}%`), mm: ltr(totalMm.toFixed(1)) })}
      controls={<KitControls s={s} valueText={`${s.value}%`} testId="bc-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + barLen, y: Y + 22, dir: "horizontal" }} s={s} testId="bc-c3">
          {UPC_ZONES.map((z, zi) => {
            const start = UPC_ZONES.slice(0, zi).reduce((a, q) => a + q.modules, 0);
            const x = X0 + (start / totalMods) * barLen;
            const w = (z.modules / totalMods) * barLen;
            const k = z.key.startsWith("quiet") ? "quiet" : z.key.startsWith("guard") || z.key === "center" ? "guard" : "data";
            const on = hover === k || (hover === "data" && (z.key === "left" || z.key === "right"));
            return (
              <rect key={z.key} x={px2(x)} y={Y} width={px2(w)} height={44} style={{ fill: z.color, stroke: on ? "var(--ph-focus)" : "var(--ph-surface)", strokeWidth: on ? 2 : 1 }} />
            );
          })}
          <T x={X0 + (5 / totalMods) * barLen} y={Y - 8} text={t("labelQuiet")} size={10} style={MUTED} />
          <T x={X0 + (34 / totalMods) * barLen} y={Y - 8} text={t("labelLeft")} size={10} style={MUTED} />
          <T x={X0 + (81 / totalMods) * barLen} y={Y - 8} text={t("labelRight")} size={10} style={MUTED} />
          <line x1={X0} y1={Y + 60} x2={X0 + plotW} y2={Y + 60} style={{ stroke: "var(--ph-line)" }} />
          {ticks.map((mm) => {
            const x = X0 + (mm / maxMm) * plotW;
            return (
              <g key={mm}>
                <line x1={x} y1={Y + 56} x2={x} y2={Y + 64} style={{ stroke: "var(--ph-line)" }} />
                <T x={x} y={Y + 78} text={`${mm}`} size={10} style={MUTED} />
              </g>
            );
          })}
          <T x={X0 + plotW} y={Y + 92} text="mm" anchor="end" size={10} style={MUTED} />
          <T x={W / 2} y={H - 14} text={`${totalMods} × ${xMm.toFixed(3)} mm = ${totalMm.toFixed(1)} mm`} size={12.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 4. Code 128 grows with the text, EAN/UPC never do (trend line + reference) ─────────────
const C128_SOURCE = (SAMPLE_VALUES.code128 + " " + SAMPLE_VALUES.code128 + " " + SAMPLE_VALUES.code128).slice(0, 30);
export function BarcodeGrowthCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("growth");
  const s = useStepper(SAMPLE_VALUES.code128.length, { min: 1, max: 30, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const series = useMemo(() => Array.from({ length: 30 }, (_, i) => totalModules(encode("code128", C128_SOURCE.slice(0, i + 1))?.segments ?? [])), []);
  const upc = useMemo(() => totalModules(encode("upc-a", UPC_BODY)?.segments ?? []), []);
  const cross = series.findIndex((m) => m > upc) + 1;
  const HMIN = 250;
  const X0 = 40;
  const BOT = 30;
  const d = useDrawing(HMIN, s, (x, _y, W) => 1 + ((x - X0) / (W - X0 - 14)) * 29);
  const { W, H } = d;
  const maxM = series[29] * 1.05;
  const px = (n: number) => X0 + ((n - 1) / 29) * (W - X0 - 14);
  const py = (m: number) => H - BOT - (m / maxM) * (H - BOT - 18);
  const cur = series[s.value - 1];
  const path = series.map((m, i) => `${i === 0 ? "M" : "L"} ${px2(px(i + 1))} ${px2(py(m))}`).join(" ");
  const rows: KitRow[] = [
    { key: "text", label: t("rowText"), value: C128_SOURCE.slice(0, s.value).replace(/ /g, "·") },
    { key: "c128", label: t("rowC128"), value: `${cur} = 11 × (${s.value} + 2) + 13`, isKey: true },
    { key: "upc", label: t("rowUpc"), value: String(upc) },
    { key: "diff", label: t("rowDiff"), value: `${cur - upc > 0 ? "+" : ""}${cur - upc}` },
    { key: "cross", label: t("rowCross"), value: String(cross) },
  ];
  const valueText = `${s.value} chars → ${cur} modules`;
  const yTicks = [0, 100, 200, 300].filter((v) => v <= maxM);
  return (
    <IndicatorCard
      idPrefix="bc"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(s.value)), m: ltr(String(cur)), formula: ltr(String(code128Modules(s.value))) })}
      controls={<KitControls s={s} valueText={`${s.value}`} testId="bc-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: px(s.value), y: py(cur), dir: "horizontal" }} s={s} testId="bc-c4">
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={X0} y1={py(v)} x2={W - 14} y2={py(v)} style={{ stroke: "var(--ph-grid)" }} />
              <T x={X0 - 6} y={py(v) + 4} text={String(v)} anchor="end" size={10} style={MUTED} />
            </g>
          ))}
          <line x1={X0} y1={py(upc)} x2={W - 14} y2={py(upc)} style={{ stroke: "var(--cv-from)" }} strokeWidth={2.5} strokeDasharray="6 4" onPointerEnter={() => setHover("upc")} onPointerLeave={() => setHover(null)} />
          <T x={W - 16} y={py(upc) - 6} text={`EAN/UPC = ${upc}`} anchor="end" size={10.5} bold style={{ fill: "var(--cv-from)" }} />
          <path d={path} fill="none" style={{ stroke: "var(--cv-warm)" }} strokeWidth={2.5} onPointerEnter={() => setHover("c128")} onPointerLeave={() => setHover(null)} />
          <circle cx={px(cross)} cy={py(series[cross - 1])} r={4} style={{ fill: "var(--ph-surface)", stroke: "var(--cv-from)" }} strokeWidth={2} />
          <T x={px(cross) + 8} y={py(series[cross - 1]) + 16} text={t("crossLabel", { n: String(cross) })} anchor="start" size={10} style={MUTED} />
          <circle cx={px(s.value)} cy={py(cur)} r={6} style={{ fill: "var(--cv-warm)" }} />
          <T x={X0} y={H - 10} text="1" anchor="start" size={10} style={MUTED} />
          <T x={W - 14} y={H - 10} text="30" anchor="end" size={10} style={MUTED} />
          <T x={(X0 + W - 14) / 2} y={H - 10} text={t("axisChars")} size={10} style={MUTED} />
        </Drawing>
      }
    />
  );
}

// ── 5. One digit, three bar patterns (L / G / R side by side) ─────────────────────────────
export function BarcodePatternsCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("patterns");
  const s = useStepper(Number(UPC_BODY[1]), { min: 0, max: 9, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => Math.round(((y - 20) / (H - 40)) * 9));
  const { W, H } = d;
  const L = EAN_L_CODE[s.value];
  const G = EAN_G_CODE[s.value];
  const R = EAN_R_CODE[s.value];
  const ones = (b: string) => b.split("").filter((c) => c === "1").length;
  const list = [
    { key: "L", bits: L, color: "var(--cv-from)" },
    { key: "G", bits: G, color: "var(--cv-third)" },
    { key: "R", bits: R, color: "var(--cv-to)" },
  ];
  const rows: KitRow[] = [
    ...list.map((p) => ({ key: p.key, label: t(`row${p.key}`), value: `${p.bits} · ${ones(p.bits)}×1` })),
    { key: "rule", label: t("rowRule"), value: t("ruleValue"), isKey: true },
  ];
  const X0 = 46;
  const barW = W - X0 - 54;
  const rowH = (H - 70) / 3;
  const valueText = `digit ${s.value}: L ${L}, G ${G}, R ${R}`;
  return (
    <IndicatorCard
      idPrefix="bc"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { d: ltr(String(s.value)), l: ltr(L), r: ltr(R) })}
      controls={<KitControls s={s} valueText={`${s.value}`} testId="bc-c5" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: W - 22, y: 20 + (s.value / 9) * (H - 40), dir: "vertical" }} s={s} testId="bc-c5">
          <line x1={W - 22} y1={20} x2={W - 22} y2={H - 20} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
          {list.map((p, i) => {
            const y = 26 + i * rowH;
            const on = hover === p.key || hover === "rule";
            return (
              <g key={p.key} onPointerEnter={() => setHover(p.key)} onPointerLeave={() => setHover(null)}>
                <T x={X0 - 12} y={y + rowH * 0.42} text={p.key} size={18} bold style={{ fill: p.color }} anchor="end" />
                <BitBars bits={p.bits} x={X0} y={y} w={barW} h={rowH * 0.62} color={on ? p.color : "var(--ph-ink)"} />
                <T x={X0 + barW / 2} y={y + rowH * 0.62 + 14} text={p.bits} size={10.5} style={MUTED} />
              </g>
            );
          })}
          <T x={W / 2 - 16} y={H - 6} text={t("drawNote")} size={10.5} style={MUTED} />
        </Drawing>
      }
    />
  );
}

// ── 6. EAN-13 first digit → parity pattern of the left half (flow arrow) ─────────────────
const EAN_BODY = SAMPLE_VALUES["ean-13"];
export function BarcodeParityCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("parity");
  const s = useStepper(Number(EAN_BODY[0]), { min: 0, max: 9, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 240;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => Math.round(((y - 30) / (H - 70)) * 9));
  const { W, H } = d;
  const parity = EAN_FIRST_DIGIT_PARITY[s.value];
  const left = EAN_BODY.slice(1, 7);
  const gCount = parity.split("").filter((c) => c === "G").length;
  const rows: KitRow[] = [
    { key: "first", label: t("rowFirst"), value: String(s.value) },
    { key: "pattern", label: t("rowPattern"), value: parity, isKey: true },
    { key: "g", label: t("rowG"), value: `${gCount} / 6` },
    { key: "left", label: t("rowLeft"), value: left },
    { key: "upc", label: t("rowUpc"), value: s.value === 0 ? t("yes") : t("no") },
  ];
  const trackX = 16;
  const nodeX = 66;
  const midY = H / 2 - 10;
  const x1 = 112;
  const segW = (W - x1 - 16) / 6;
  const valueText = `first digit ${s.value} → ${parity}`;
  return (
    <IndicatorCard
      idPrefix="bc"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { d: ltr(String(s.value)), p: ltr(parity), g: ltr(String(gCount)) })}
      controls={<KitControls s={s} valueText={`${s.value}`} testId="bc-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: trackX, y: 30 + (s.value / 9) * (H - 70), dir: "vertical" }} s={s} testId="bc-c6">
          <line x1={trackX} y1={30} x2={trackX} y2={H - 40} style={{ stroke: "var(--glass-track)" }} strokeWidth={6} strokeLinecap="round" />
          <circle cx={nodeX} cy={midY} r={22} style={{ fill: soft(ZONE.system, 35), stroke: ZONE.system }} strokeWidth={2} />
          <T x={nodeX} y={midY + 7} text={String(s.value)} size={20} bold style={INK} />
          <path d={`M ${nodeX + 24} ${midY} L ${x1 - 6} ${midY}`} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} />
          <polygon points={`${x1 - 10},${midY - 6} ${x1 - 2},${midY} ${x1 - 10},${midY + 6}`} style={{ fill: "var(--ph-line)" }} />
          <rect x={x1} y={midY - 26} width={segW * 6} height={52} rx={10} style={{ fill: "var(--ph-surface)", stroke: "var(--ph-line)" }} />
          {parity.split("").map((p, i) => {
            const x = x1 + i * segW;
            const g = p === "G";
            const on = hover === "g" ? g : hover === "pattern" || hover === "left";
            return (
              <g key={i}>
                <rect x={px2(x)} y={midY - 26} width={px2(segW)} height={52} rx={i === 0 || i === 5 ? 10 : 0} style={{ fill: g ? soft("var(--cv-third)", on ? 55 : 32) : soft("var(--cv-from)", on ? 40 : 16) }} />
                {i > 0 && <line x1={px2(x)} y1={midY - 26} x2={px2(x)} y2={midY + 26} style={{ stroke: "var(--ph-line)" }} />}
                <T x={x + segW / 2} y={midY - 4} text={p} size={15} bold style={INK} />
                <T x={x + segW / 2} y={midY + 16} text={left[i]} size={12} style={MUTED} />
              </g>
            );
          })}
          <T x={x1 + segW * 3} y={midY - 38} text={t("labelLeft")} size={10.5} style={MUTED} />
          <T x={x1 + segW * 3} y={midY + 46} text={t("labelBars")} size={10.5} style={MUTED} />
          <T x={W / 2} y={H - 14} text={t("summary", { g: String(gCount) })} size={11.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 7. Code 128 checksum, one character at a time (staircase) ──────────────────────────────
const C128_SAMPLE = SAMPLE_VALUES.code128;
export function BarcodeChecksumCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("checksum");
  const all = useMemo(() => code128Steps(C128_SAMPLE), []);
  const n = all.steps.length;
  const s = useStepper(n, { min: 1, max: n, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const HMIN = 250;
  const X0 = 44;
  const BOT = 34;
  const d = useDrawing(HMIN, s, (x, _y, W) => Math.round(((x - X0) / (W - X0 - 14)) * n + 0.5));
  const { W, H } = d;
  const maxSum = all.sum;
  const stepW = (W - X0 - 14) / n;
  const py = (v: number) => H - BOT - (v / maxSum) * (H - BOT - 22);
  const k = s.value;
  const cur = all.steps[k - 1];
  let dPath = `M ${X0} ${py(all.start)}`;
  all.steps.forEach((st, i) => {
    dPath += ` L ${px2(X0 + i * stepW)} ${px2(py(st.running))} L ${px2(X0 + (i + 1) * stepW)} ${px2(py(st.running))}`;
  });
  const rows: KitRow[] = [
    { key: "start", label: t("rowStart"), value: String(all.start) },
    { key: "char", label: t("rowChar", { k: ltr(String(k)) }), value: `"${cur.ch}" → ${cur.value} × ${cur.weight} = ${cur.product}` },
    { key: "running", label: t("rowRunning"), value: String(cur.running) },
    { key: "mod", label: t("rowMod"), value: `${cur.running} mod 103 = ${cur.running % 103}`, isKey: k === n },
    { key: "final", label: t("rowFinal"), value: String(all.checksum), isKey: k !== n },
  ];
  const valueText = `${k} of ${n}: running ${cur.running}`;
  return (
    <IndicatorCard
      idPrefix="bc"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { k: ltr(String(k)), ch: ltr(cur.ch), sum: ltr(String(cur.running)), mod: ltr(String(cur.running % 103)) })}
      controls={<KitControls s={s} valueText={`${k} / ${n}`} testId="bc-c7" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: X0 + (k - 0.5) * stepW, y: py(cur.running) - 2, dir: "horizontal" }} s={s} testId="bc-c7">
          <line x1={X0} y1={H - BOT} x2={W - 14} y2={H - BOT} style={{ stroke: "var(--ph-line)" }} />
          <path d={`${dPath} L ${W - 14} ${H - BOT} L ${X0} ${H - BOT} Z`} style={{ fill: soft("var(--cv-to)", 14) }} />
          <path d={dPath} fill="none" style={{ stroke: "var(--cv-to)" }} strokeWidth={2.5} onPointerEnter={() => setHover("running")} onPointerLeave={() => setHover(null)} />
          <rect x={X0 + (k - 1) * stepW} y={py(cur.running)} width={stepW} height={H - BOT - py(cur.running)} style={{ fill: soft("var(--ph-focus)", 26) }} />
          {all.steps.map((st, i) => (
            <T key={i} x={X0 + (i + 0.5) * stepW} y={H - BOT + 15} text={st.ch === " " ? "·" : st.ch} size={11} bold={i === k - 1} style={i === k - 1 ? INK : MUTED} />
          ))}
          <T x={X0 - 6} y={py(all.start) + 4} text={String(all.start)} anchor="end" size={10} style={MUTED} />
          <T x={X0 - 6} y={py(maxSum) + 4} text={String(maxSum)} anchor="end" size={10} style={MUTED} />
          <T x={W / 2} y={H - 6} text={`${cur.running} mod 103 = ${cur.running % 103}`} size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 8. How many swaps of two neighbouring digits the check digit catches (gauge) ──────────
export function BarcodeTranspositionCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("transposition");
  const s = useStepper(1, { min: 1, max: 10, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  // Brute force over every pair of different digits at every neighbouring position of the sample.
  const rate = useMemo(() => {
    let caught = 0;
    let total = 0;
    for (let p = 0; p < 10; p++)
      for (let a = 0; a < 10; a++)
        for (let b = 0; b < 10; b++) {
          if (a === b) continue;
          const orig = UPC_BODY.slice(0, p) + a + b + UPC_BODY.slice(p + 2);
          const swap = UPC_BODY.slice(0, p) + b + a + UPC_BODY.slice(p + 2);
          total++;
          if (upcCheck(orig) !== upcCheck(swap)) caught++;
        }
    return { caught, total, pct: (caught / total) * 100 };
  }, []);
  const p = s.value - 1;
  const a = UPC_BODY[p];
  const b = UPC_BODY[p + 1];
  const swapped = UPC_BODY.slice(0, p) + b + a + UPC_BODY.slice(p + 2);
  const c0 = upcCheck(UPC_BODY);
  const c1 = upcCheck(swapped);
  const same = a === b;
  const caught = c0 !== c1;
  const HMIN = 250;
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const ang = Math.atan2(H * 0.72 - y, x - W / 2);
    return Math.round(10 - (ang / Math.PI) * 9);
  });
  const { W, H } = d;
  const cx = W / 2;
  const cy = H * 0.72;
  const R = Math.min(W * 0.36, H * 0.6);
  const arc = (from: number, to: number) => {
    const a0 = Math.PI - from * Math.PI;
    const a1 = Math.PI - to * Math.PI;
    return `M ${px2(cx + R * Math.cos(a0))} ${px2(cy - R * Math.sin(a0))} A ${R} ${R} 0 0 1 ${px2(cx + R * Math.cos(a1))} ${px2(cy - R * Math.sin(a1))}`;
  };
  const frac = rate.pct / 100;
  const needleA = Math.PI - frac * Math.PI;
  const posA = Math.PI - ((s.value - 1) / 9) * Math.PI;
  const rows: KitRow[] = [
    { key: "pair", label: t("rowPair", { p: ltr(String(s.value)) }), value: `${a}${b} → ${b}${a}` },
    { key: "swapped", label: t("rowSwapped"), value: swapped },
    { key: "checks", label: t("rowChecks"), value: `${c0} → ${c1}` },
    { key: "verdict", label: t("rowVerdict"), value: same ? t("same") : caught ? t("caught") : t("missed"), isKey: true },
    { key: "rate", label: t("rowRate"), value: `${rate.caught} / ${rate.total} = ${rate.pct.toFixed(1)}%` },
  ];
  const valueText = `pair ${s.value}: ${same ? "same digits" : caught ? "caught" : "missed"}`;
  return (
    <IndicatorCard
      idPrefix="bc"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { p: ltr(String(s.value)), pct: ltr(rate.pct.toFixed(1)) })}
      controls={<KitControls s={s} valueText={`${s.value}`} testId="bc-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: cx + (R + 24) * Math.cos(posA), y: cy - (R + 24) * Math.sin(posA), dir: "circular" }} s={s} testId="bc-c8">
          <path d={arc(0, 1)} fill="none" style={{ stroke: "var(--glass-track)" }} strokeWidth={18} strokeLinecap="round" />
          <path d={arc(0, frac)} fill="none" style={{ stroke: "var(--bc-ok)" }} strokeWidth={18} strokeLinecap="round" onPointerEnter={() => setHover("rate")} onPointerLeave={() => setHover(null)} />
          <path d={arc(frac, 1)} fill="none" style={{ stroke: "var(--bc-bad)" }} strokeWidth={18} />
          <line x1={cx} y1={cy} x2={px2(cx + (R - 26) * Math.cos(needleA))} y2={px2(cy - (R - 26) * Math.sin(needleA))} style={{ stroke: "var(--ph-ink)" }} strokeWidth={3} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={6} style={{ fill: "var(--ph-ink)" }} />
          <T x={cx} y={cy - R * 0.38} text={`${rate.pct.toFixed(1)}%`} size={22} bold style={INK} />
          <T x={cx} y={cy - R * 0.38 + 18} text={t("gaugeLabel")} size={10.5} style={MUTED} />
          <T x={cx - R + 16} y={cy + 4} text="0%" anchor="start" size={10} style={MUTED} />
          <T x={cx + R - 16} y={cy + 4} text="100%" anchor="end" size={10} style={MUTED} />
          <rect x={cx - 80} y={H - 30} width={160} height={24} rx={12} style={{ fill: soft(same ? "var(--ph-line)" : caught ? "var(--bc-ok)" : "var(--bc-bad)", 30) }} />
          <T x={cx} y={H - 13} text={`${a}${b} → ${b}${a}: ${same ? t("same") : caught ? t("caught") : t("missed")}`} size={11.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}
