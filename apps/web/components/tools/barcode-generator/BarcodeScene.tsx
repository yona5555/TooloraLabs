"use client";
import { useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import type { BarcodeOutput, BarcodeSymbology } from "@tooloralabs/tools";
import { KitControls, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { GlassHandle, usePrefersReducedMotion } from "@/components/tool-ui/glass/GlassPrimitives";
import { ltr } from "@/components/tool-ui/MixedText";
import BarcodeSVG, { BAR_HEIGHT, barcodeGeometry } from "./BarcodeSVG";
import { roleOfModule, totalModules } from "./barcodeMath";

/**
 * Result-card main visual (§44, 2D): a checkout scene. The shop front and basket are CC0
 * illustrations (apps/web/public/samples/CREDITS.md); the counter, scanner window and laser are
 * plain geometry. The label carries the visitor's real barcode, and the laser's read-spot (drag it,
 * or −/+/reset) reports exactly which module, digit and 7-module pattern the scanner is reading.
 */
const LASER_Y = BAR_HEIGHT * 0.55;

function seedFor(symbology: BarcodeSymbology) {
  return symbology === "code128" ? 11 : 3;
}

export default function BarcodeScene({
  symbology,
  value,
  output,
  logoDataUrl,
  logoPlacement,
  labelRef,
}: {
  symbology: BarcodeSymbology;
  value: string;
  output: BarcodeOutput | null;
  logoDataUrl: string | null;
  logoPlacement: "beside" | "none";
  labelRef: RefObject<HTMLDivElement | null>;
}) {
  const t = useTranslations("tools.barcode-generator.aboveFold.scene");
  const reduced = usePrefersReducedMotion();
  const valid = !!output;
  const n = output ? totalModules(output.segments) : 1;
  const seed = Math.min(seedFor(symbology), n - 1);
  const [mod, setMod] = useState(seed);
  const [touched, setTouched] = useState(false);
  // Reset on symbology change comes from the parent's `key`; a shorter value just clamps here.
  const m = Math.max(0, Math.min(n - 1, mod));

  const s: Stepper = {
    value: m,
    set: (v) => setMod(Math.round(v)),
    inc: () => setMod((v) => Math.min(n - 1, v + 1)),
    dec: () => setMod((v) => Math.max(0, v - 1)),
    reset: () => setMod(seed),
    flash: 0,
    atMin: !valid || m <= 0,
    atMax: !valid || m >= n - 1,
    isSeed: m === seed,
    min: 0,
    max: n - 1,
    step: 1,
  };

  const showLogo = logoPlacement === "beside" && !!logoDataUrl;
  const geo = output ? barcodeGeometry(output.segments, output.quietZoneModules, showLogo) : null;
  const role = valid ? roleOfModule(symbology, value.trim(), m) : null;
  const dark = output ? (() => {
    let acc = 0;
    for (const seg of output.segments) {
      if (m < acc + seg.width) return seg.filled;
      acc += seg.width;
    }
    return false;
  })() : false;

  // Highlighted group: the 7-module digit pattern (EAN/UPC) or 11-module symbol (Code 128) under the spot.
  let groupStart = m;
  let groupLen = 1;
  if (role && role.digitPos !== null && symbology !== "code128") {
    groupStart = m < 45 ? 3 + Math.floor((m - 3) / 7) * 7 : 50 + Math.floor((m - 50) / 7) * 7;
    groupLen = 7;
  } else if (symbology === "code128" && valid) {
    groupStart = Math.floor(m / 11) * 11;
    groupLen = Math.min(11, n - groupStart);
  }

  const zoneText = role ? t(`zone.${role.zone}`) : "";
  const readout =
    role && role.digit !== null
      ? t("readDigit", { pos: ltr(String(role.digitPos ?? "")), digit: ltr(role.digit), pattern: ltr(role.pattern ?? "") })
      : t("readZone", { zone: zoneText });
  const valueText = ltr(`${m + 1} / ${n}`);

  function moduleAt(clientX: number) {
    const svg = labelRef.current?.querySelector("svg");
    if (!svg || !geo || !output) return;
    const r = svg.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * geo.totalWidth;
    setMod(Math.max(0, Math.min(n - 1, Math.floor(x / geo.moduleWidth) - output.quietZoneModules)));
  }
  const dragging = useRef(false);

  const spotX = geo ? geo.moduleX(m) + geo.moduleWidth / 2 : 0;
  const transition = reduced ? "none" : "opacity 300ms ease";

  return (
    <div data-ph-scene-block data-ph-hero className="flex flex-col gap-2">
      <div role="group" aria-label={t("aria")} className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "4 / 3", background: "linear-gradient(to bottom, var(--bc-wall), var(--bc-wall-2))" }} data-testid="bc-scene">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/samples/barcode-shop-front.svg" alt="" aria-hidden="true" className="absolute select-none" style={{ left: "2%", top: "5%", width: "33%" }} draggable={false} />
        <div className="absolute inset-x-0" style={{ top: "66%", bottom: 0, background: "var(--bc-counter)" }} />
        <div className="absolute inset-x-0" style={{ top: "64%", height: "4%", background: "var(--bc-counter-top)" }} />
        <div
          className="absolute rounded-md"
          style={{ left: "43%", width: "52%", top: "71%", height: "8%", background: "var(--bc-window)", boxShadow: valid ? "0 0 14px 2px var(--bc-laser-glow)" : "none", transition }}
        >
          <div className="absolute inset-x-[6%] top-1/2 h-[2px] -translate-y-1/2 rounded-full" style={{ background: "var(--bc-laser)", opacity: valid ? 0.9 : 0.35 }} />
        </div>
        <div
          dir="ltr"
          data-testid="bc-led"
          className="absolute flex items-center justify-center rounded-md px-2 text-center font-mono text-[11px] font-bold leading-tight"
          style={{ left: "43%", width: "52%", top: "83%", height: "12%", background: "var(--bc-led-bg)", color: valid ? "var(--bc-led-ink)" : "var(--bc-bad)" }}
        >
          {valid ? `✓ ${t("beep")} · ${role?.digit !== null && role?.digit !== undefined ? `${role.digit}` : zoneText}` : `✕ ${t("noRead")}`}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/samples/barcode-shopping-basket.svg" alt="" aria-hidden="true" className="absolute select-none" style={{ left: "4%", top: "56%", width: "30%" }} draggable={false} />

        <div
          ref={labelRef}
          className="absolute touch-none select-none rounded-lg p-[2.5%] shadow-md"
          style={{ left: "39%", top: "13%", width: "58%", background: "var(--bc-paper)", border: `1.5px solid ${valid ? "var(--bc-paper-edge)" : "var(--bc-bad)"}`, cursor: valid ? "grab" : "default" }}
          onPointerDown={(e) => {
            if (!valid || e.button !== 0) return;
            dragging.current = true;
            setTouched(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            moduleAt(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && moduleAt(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          data-testid="bc-label"
        >
          {output && geo ? (
            <div className="relative">
              <BarcodeSVG
                segments={output.segments}
                displayText={output.displayText}
                quietZoneModules={output.quietZoneModules}
                logoDataUrl={logoDataUrl}
                logoPlacement={logoPlacement}
                overlay={
                  <>
                    <rect x={geo.moduleX(groupStart)} y={0} width={groupLen * geo.moduleWidth} height={BAR_HEIGHT} style={{ fill: "var(--bc-group)" }} />
                    <line x1={geo.moduleX(0)} y1={LASER_Y} x2={geo.moduleX(n)} y2={LASER_Y} style={{ stroke: "var(--bc-laser)" }} strokeWidth={1.4} opacity={0.6} />
                    <line x1={spotX} y1={4} x2={spotX} y2={BAR_HEIGHT - 4} style={{ stroke: "var(--bc-laser)" }} strokeWidth={1.6} />
                    <circle cx={spotX} cy={LASER_Y} r={6} style={{ fill: "var(--bc-laser-glow)" }} />
                    <circle cx={spotX} cy={LASER_Y} r={2.6} style={{ fill: dark ? "var(--bc-paper)" : "var(--bc-laser)", stroke: "var(--bc-laser)" }} strokeWidth={1} />
                  </>
                }
              />
              <GlassHandle
                direction="horizontal"
                ariaLabel={t("handle")}
                onStep={(d) => {
                  setTouched(true);
                  return d > 0 ? s.inc() : s.dec();
                }}
                valueNow={m}
                valueMin={0}
                valueMax={n - 1}
                style={{ left: `${(spotX / geo.totalWidth) * 100}%`, top: 0, transform: "translate(-50%, -78%)", opacity: touched ? 1 : undefined }}
              />
            </div>
          ) : (
            <div className="flex aspect-[2/1] flex-col items-center justify-center gap-1 text-center" style={{ color: "var(--bc-bad)" }}>
              <span className="text-3xl font-black leading-none">✕</span>
              <span className="text-xs font-bold uppercase tracking-wide">{t("noRead")}</span>
              <span className="text-[11px]" style={{ color: "var(--bc-ink)" }}>{t("noReadHint")}</span>
            </div>
          )}
        </div>
      </div>

      {valid && (
        <>
          <KitControls s={s} valueText={valueText} testId="bc-scan" />
          <p dir="auto" className="text-center text-xs font-semibold leading-5" style={{ color: "var(--ph-accent-strong)" }} data-testid="bc-readout">
            {readout}
          </p>
        </>
      )}
    </div>
  );
}
