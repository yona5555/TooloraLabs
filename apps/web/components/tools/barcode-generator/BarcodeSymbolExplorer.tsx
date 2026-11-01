"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { ROLE_FILL, useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const STRIP_Y = 10;
const STRIP_H = 34;
const ZOOM_Y = 74;
const ZOOM_H = 120;

/**
 * Interactive piece: drag the slider (or click a symbol in the strip) to pick one symbol; it is
 * blown up module by module with the width of every bar and space, its parity and its bit pattern.
 */
export default function BarcodeSymbolExplorer() {
  const t = useTranslations("tools.barcode-generator.education.lab.explorer");
  const tr = useTranslations("tools.barcode-generator.result.role");
  const { a, f } = useBarcodeModel();
  const [pick, setPick] = useState(1);
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const idx = Math.min(pick, a.symbols.length - 1);
  const s = a.symbols[idx];
  const scale = W / a.modules;
  const zoom = Math.min(24, (W - 20) / s.bits.length);
  const zx = (W - zoom * s.bits.length) / 2;
  const bits = a.symbols.map((x) => x.bits).join("");

  const svg = (
    <div className="w-[340px] max-w-full">
      <svg direction="ltr" width={W} height={ZOOM_Y + ZOOM_H + 24} viewBox={`0 0 ${W} ${ZOOM_Y + ZOOM_H + 24}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {[...bits].map((b, i) => (b === "1" ? <rect key={i} x={i * scale} y={STRIP_Y} width={scale + 0.2} height={STRIP_H} className="fill-zinc-900 dark:fill-zinc-100" /> : null))}
        {a.symbols.map((x, i) => (
          <rect
            key={i}
            x={x.start * scale}
            y={STRIP_Y - 4}
            width={x.bits.length * scale}
            height={STRIP_H + 8}
            rx={3}
            onClick={() => setPick(i)}
            className={`cursor-pointer ${i === idx ? "fill-blue-500/25 stroke-blue-600 dark:stroke-blue-400" : "fill-transparent hover:fill-blue-500/10"}`}
            strokeWidth={1.5}
          />
        ))}
        <path
          d={`M ${s.start * scale} ${STRIP_Y + STRIP_H + 6} L ${zx} ${ZOOM_Y - 4} M ${(s.start + s.bits.length) * scale} ${STRIP_Y + STRIP_H + 6} L ${zx + zoom * s.bits.length} ${ZOOM_Y - 4}`}
          strokeDasharray="3 3"
          className="stroke-blue-500 dark:stroke-blue-400"
          fill="none"
        />
        {[...s.bits].map((b, i) => (
          <rect key={i} x={zx + i * zoom} y={ZOOM_Y} width={zoom} height={ZOOM_H} className={b === "1" ? ROLE_FILL[s.role] : "fill-zinc-100 dark:fill-zinc-800"} />
        ))}
        {s.widths.map((w, i) => {
          const at = s.widths.slice(0, i).reduce((sum, v) => sum + v, 0);
          return (
            <text style={{ fontSize: svgPx(12) }} key={i} x={zx + (at + w / 2) * zoom} y={ZOOM_Y + ZOOM_H + 16} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-600 dark:fill-zinc-300">
              {w}
            </text>
          );
        })}
      </svg>
      <input type="range" min={0} max={a.symbols.length - 1} value={idx} onChange={(e) => setPick(Number(e.target.value))} aria-label={t("slider")} className="mt-2 w-full accent-blue-600" />
    </div>
  );

  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("symbol"), value: `${idx + 1} / ${a.symbols.length}` },
        { label: t("role"), value: tr(s.role) },
        { label: t("carries"), value: s.label || "—" },
        { label: t("parity"), value: s.parity ?? "—" },
        { label: t("pattern"), value: s.bits },
        { label: t("widths"), value: s.widths.join("-") },
        { label: t("span"), value: `${f(s.start + 1)}–${f(s.start + s.bits.length)} (${s.bits.length})`, emphasize: true },
      ]}
    />
  );
}
