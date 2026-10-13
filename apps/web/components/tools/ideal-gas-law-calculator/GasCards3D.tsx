"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { PhCard, PhControls, PhTable, PhTrack, useMeasuredSize, usePhStepper, type PhRow } from "../ph-calculator/PhCardKit";
import { PhScene } from "../ph-calculator/PhScene";
import { ballPoints } from "../ph-calculator/phMath";
import { ALT_MAX_KM, AVOGADRO, g4, isa, K_B, R_LATM, sciText, speeds, tempCss, ZERO_C } from "./gasMath";

const SpheresScene3D = dynamic(() => import("./GasScenes3D").then((m) => m.SpheresScene3D), { ssr: false, loading: () => null });
const SpeedScene3D = dynamic(() => import("./GasScenes3D").then((m) => m.SpeedScene3D), { ssr: false, loading: () => null });
const AltitudeScene3D = dynamic(() => import("./GasScenes3D").then((m) => m.AltitudeScene3D), { ssr: false, loading: () => null });

type Side = "visual-left" | "table-left";
const N2 = 28.014;
const rd = (v: number) => Math.round(v * 100) / 100;

// ── 1. Molar volume spheres ───────────────────────────────────────────────────────────
function Spheres2D({ v0, v25 }: { v0: number; v25: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 250 });
  const k = Math.min((H - 50) / 2 / Math.cbrt(4 * 24.465), W / 5.2 / Math.cbrt(4 * 24.465));
  // Rounded: cbrt/pow/trig can differ in the last bit between server and browser (hydration).
  const r = (v: number) => rd(k * Math.cbrt(v));
  const base = H - 14;
  const items = [
    { v: 1, fill: "var(--ph-water)", label: "1 L" },
    { v: v0, fill: "var(--chem-cold)", label: `${g4(v0)} L` },
    { v: v25, fill: "var(--chem-hot)", label: `${g4(v25)} L` },
  ];
  const total = items.reduce((a, it) => a + 2 * r(it.v), 0) + 2 * 24;
  let x = (W - total) / 2;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g4(v0)} L`}>
        {items.map((it, i) => {
          const rr = r(it.v);
          const cx = x + rr;
          x += 2 * rr + 24;
          return (
            <g key={i}>
              <circle cx={cx} cy={base - rr} r={rr} style={{ fill: it.fill, fillOpacity: 0.55, stroke: "var(--ph-line)" }} strokeWidth={1.5} />
              <text x={cx} y={Math.max(14, base - 2 * rr - 8)} fontSize={12} fontWeight={700} textAnchor="middle" style={{ fill: "var(--ph-ink)" }}>
                {it.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function GasSpheresCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.spheres");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = usePhStepper(1, { min: 0.25, max: 4, step: 0.25 });
  const [hover, setHover] = useState<string | null>(null);
  const v0 = s.value * R_LATM * ZERO_C;
  const v25 = s.value * R_LATM * (ZERO_C + 25);
  const valueText = `n = ${g4(s.value)} mol`;
  const rows: PhRow[] = [
    { key: "n", label: t("rowN"), value: `${g4(s.value)} mol` },
    { key: "v0", label: t("rowV0"), value: `${g4(v0)} L`, isKey: true },
    { key: "v25", label: t("rowV25"), value: `${g4(v25)} L` },
    { key: "ref", label: t("rowRatio"), value: `× ${g4(v0)}` },
    { key: "molecules", label: t("rowMolecules"), value: sciText(s.value * AVOGADRO) },
    { key: "gain", label: t("rowGain"), value: `${g4(v25 - v0)} L` },
  ];
  return (
    <PhCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(g4(s.value)), v0: ltr(g4(v0)), v25: ltr(g4(v25)) })}
      controls={
        <>
          <PhTrack s={s} label={t("handle")} valueText={valueText} testId="gas-spheres-handle" ticks={[0.25, 2, 4].map((v) => ({ at: v, text: `${v} mol` }))} />
          <PhControls s={s} valueText={valueText} testId="gas-spheres" />
        </>
      }
      table={<PhTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<PhScene testId="gas-spheres" className="min-h-[250px] flex-1" fallback={<Spheres2D v0={v0} v25={v25} />} render3d={() => <SpheresScene3D v0={v0} v25={v25} hover={hover} />} />}
    />
  );
}

// ── 4. Molecular speeds ───────────────────────────────────────────────────────────────
const SPEED_DOTS = ballPoints(36, 59);
function Speed2D({ tK, rms }: { tK: number; rms: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 250 });
  const r = Math.min(H / 2 - 10, W * 0.3);
  const cx = r + 12;
  const cy = H / 2;
  const len = (rms / 1400) * r * 0.45;
  const lx = cx + r + 22;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${g4(rms)} m/s`}>
        <circle cx={cx} cy={cy} r={r} style={{ fill: "var(--ph-glass)", fillOpacity: 0.15, stroke: "var(--ph-line)" }} strokeWidth={1.5} />
        {SPEED_DOTS.map(([x, y, z], i) => {
          const px = cx + x * r * 0.8;
          const py = cy + y * r * 0.8;
          const f = 0.45 + Math.abs(x + y + z) * 0.6;
          const a = Math.atan2(z, x) + i;
          return (
            <g key={i}>
              <line x1={px} y1={py} x2={rd(px + Math.cos(a) * len * f)} y2={rd(py + Math.sin(a) * len * f)} style={{ stroke: tempCss(tK) }} strokeWidth={1.5} strokeLinecap="round" />
              <circle cx={px} cy={py} r={4} style={{ fill: tempCss(tK) }} />
            </g>
          );
        })}
        <text x={W - 12} y={cy - 6} fontSize={13} fontWeight={800} textAnchor="end" style={{ fill: "var(--ph-ink)" }}>
          {`${g4(rms)} m/s`}
        </text>
        <rect x={lx} y={cy + 6} width={Math.max(30, W - lx - 12)} height={12} rx={6} style={{ fill: "var(--glass-track)", stroke: "var(--ph-line)" }} strokeWidth={1} />
        <rect x={lx} y={cy + 6} width={Math.max(12, (Math.max(30, W - lx - 12) * rms) / 1600)} height={12} rx={6} style={{ fill: tempCss(tK) }} />
      </svg>
    </div>
  );
}

export function GasSpeedCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.speed");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = usePhStepper(0, { min: -150, max: 700, step: 25 });
  const [hover, setHover] = useState<string | null>(null);
  const tK = s.value + ZERO_C;
  const v = speeds(tK, N2);
  const valueText = `${s.value} °C`;
  const rows: PhRow[] = [
    { key: "t", label: t("rowT"), value: `${s.value} °C · ${g4(tK)} K` },
    { key: "mp", label: t("rowMp"), value: `${g4(v.mp)} m/s` },
    { key: "avg", label: t("rowAvg"), value: `${g4(v.avg)} m/s` },
    { key: "rms", label: t("rowRms"), value: `${g4(v.rms)} m/s`, isKey: true },
    { key: "kmh", label: t("rowKmh"), value: `${g4(v.rms * 3.6)} km/h` },
    { key: "ke", label: t("rowKe"), value: `${sciText(1.5 * K_B * tK)} J` },
  ];
  return (
    <PhCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { t: ltr(String(s.value)), rms: ltr(g4(v.rms)) })}
      controls={
        <>
          <PhTrack s={s} label={t("handle")} valueText={valueText} testId="gas-speed-handle" ticks={[-150, 300, 700].map((x) => ({ at: x, text: `${x} °C` }))} />
          <PhControls s={s} valueText={valueText} testId="gas-speed" />
        </>
      }
      table={<PhTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<PhScene testId="gas-speed" className="min-h-[250px] flex-1" fallback={<Speed2D tK={tK} rms={v.rms} />} render3d={() => <SpeedScene3D tK={tK} rms={v.rms} hover={hover} />} />}
    />
  );
}

// ── 6. Balloon in the standard atmosphere ─────────────────────────────────────────────
function Altitude2D({ hKm, ratio }: { hKm: number; ratio: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 270 });
  const top = 18;
  const bottom = H - 16;
  const y = (h: number) => bottom - 34 - (h / ALT_MAX_KM) * (bottom - top - 60);
  const mast = W - 70;
  const r = rd(18 * Math.cbrt(ratio));
  const bx = W * 0.38;
  return (
    <div ref={box} className="relative w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={`${hKm} km`}>
        <line x1={14} y1={bottom} x2={W - 14} y2={bottom} style={{ stroke: "var(--ph-line)" }} strokeWidth={2} strokeLinecap="round" />
        <line x1={mast} y1={y(0)} x2={mast} y2={y(ALT_MAX_KM)} style={{ stroke: "var(--ph-line)" }} strokeWidth={3} strokeLinecap="round" />
        {[0, 2, 4, 6, 8, 10].map((k) => (
          <text key={k} x={mast + 14} y={y(k) + 4} fontSize={11} style={{ fill: "var(--ph-ink-muted)" }}>
            {`${k} km`}
          </text>
        ))}
        <line x1={bx} y1={y(hKm) + r} x2={bx} y2={bottom} style={{ stroke: "var(--ph-ink-muted)" }} strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={bx} cy={y(hKm)} r={r} style={{ fill: "var(--chem-gas)", fillOpacity: 0.55, stroke: "var(--ph-line)" }} strokeWidth={1.5} />
        <circle cx={mast} cy={y(hKm)} r={6} style={{ fill: "var(--ph-focus)" }} />
      </svg>
    </div>
  );
}

export function GasAltitudeCard({ side, n: cardN }: { side: Side; n: number }) {
  const t = useTranslations("tools.ideal-gas-law-calculator.visuals.altitude");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const s = usePhStepper(0, { min: 0, max: ALT_MAX_KM, step: 0.5 });
  const [hover, setHover] = useState<string | null>(null);
  const a = isa(s.value);
  const ground = isa(0);
  const vol = (R_LATM * a.T) / a.P;
  const vGround = (R_LATM * ground.T) / ground.P;
  const rho = (a.P * 28.96) / (R_LATM * a.T);
  const valueText = `${g4(s.value)} km`;
  const rows: PhRow[] = [
    { key: "h", label: t("rowH"), value: `${g4(s.value)} km` },
    { key: "t", label: t("rowT"), value: `${g4(a.T)} K · ${g4(a.T - ZERO_C)} °C` },
    { key: "p", label: t("rowP"), value: `${g4(a.P)} atm` },
    { key: "v", label: t("rowV"), value: `${g4(vol)} L`, isKey: true },
    { key: "ratio", label: t("rowRatio"), value: `× ${g4(vol / vGround)}` },
    { key: "rho", label: t("rowRho"), value: `${g4(rho)} g/L` },
  ];
  return (
    <PhCard
      idPrefix="gas"
      n={cardN}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={
        s.value === 0
          ? t("captionGround", { v: ltr(g4(vol)) })
          : t("caption", { h: ltr(g4(s.value)), v: ltr(g4(vol)), ratio: ltr(g4(vol / vGround)) })
      }
      controls={
        <>
          <PhTrack s={s} label={t("handle")} valueText={valueText} testId="gas-alt-handle" ticks={[0, 5, 11].map((x) => ({ at: x, text: `${x} km` }))} />
          <PhControls s={s} valueText={valueText} testId="gas-alt" />
        </>
      }
      table={<PhTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <PhScene
          testId="gas-alt"
          className="min-h-[270px] flex-1"
          fallback={<Altitude2D hKm={s.value} ratio={vol / vGround} />}
          render3d={() => <AltitudeScene3D hKm={s.value} volume={vol} groundVolume={vGround} tK={a.T} hover={hover} />}
        />
      }
    />
  );
}
