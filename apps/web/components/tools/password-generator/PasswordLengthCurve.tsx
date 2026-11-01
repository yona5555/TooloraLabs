"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { charEntropy, passphraseEntropy } from "@tooloralabs/tools";
import PasswordIndicatorCard, { PasswordIndicatorUnavailable } from "./PasswordIndicatorCard";
import { usePasswordLive, usePasswordModel } from "./PasswordLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const L = 36;
const R = 12;
const T = 16;
const B = 32;
const TIERS = [28, 36, 60, 100];

/**
 * Type #7 (Trend Line with Highlighted Reference Point), interactive: entropy against length for the
 * current character pool (or words for a passphrase). Drag the point along the curve to change the
 * length — the password, the result card and every indicator follow.
 */
export default function PasswordLengthCurve() {
  const t = useTranslations("tools.password-generator.education.lab.curve");
  const { setDim } = usePasswordLive();
  const { draft, s, f } = usePasswordModel();
  const svgRef = useRef<SVGSVGElement>(null);
  if (!s.valid) return <PasswordIndicatorUnavailable title={t("title")} />;

  const words = draft.mode === "passphrase";
  const [lo, hi] = words ? [3, 10] : [4, 64];
  const entropyAt = (n: number) => (words ? passphraseEntropy(n, draft.appendNumber) : charEntropy(n, s.poolSize));
  const maxY = Math.max(130, entropyAt(hi));
  const x = (n: number) => L + ((n - lo) / (hi - lo)) * (W - L - R);
  const y = (bits: number) => Math.round((H - B - (bits / maxY) * (H - B - T)) * 100) / 100;
  const n = words ? s.symbols : draft.length;
  const curve = Array.from({ length: hi - lo + 1 }, (_, i) => `${i ? "L" : "M"} ${x(lo + i)} ${y(entropyAt(lo + i))}`).join(" ");

  function pick(e: React.PointerEvent<SVGSVGElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * W;
    const next = Math.round(lo + ((px - L) / (W - L - R)) * (hi - lo));
    const clamped = Math.max(lo, Math.min(hi, next));
    setDim(words ? "wordCount" : "length", clamped);
  }

  // tier numbers on the y axis: a tier line closer than a label line to the one already labelled keeps
  // its line but not its number (§39: fewer ticks, never smaller text)
  const tierLabel = new Set<number>();
  let lastY = -Infinity;
  for (const b of TIERS.filter((v) => v < maxY).sort((p, q) => p - q)) {
    if (Math.abs(lastY - y(b)) >= 15) {
      tierLabel.add(b);
      lastY = y(b);
    }
  }

  const svg = (
    <FitSvg
      ref={svgRef}
      direction="ltr"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="slider"
      aria-label={t("aria")}
      aria-valuemin={lo}
      aria-valuemax={hi}
      aria-valuenow={n}
      tabIndex={0}
      onKeyDown={(e) => {
        const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
        if (d) setDim(words ? "wordCount" : "length", Math.max(lo, Math.min(hi, n + d)));
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => e.buttons === 1 && pick(e)}
      className="mx-auto block max-w-full cursor-ew-resize touch-none"
    >
      {TIERS.filter((b) => b < maxY).map((b) => (
        <g key={b}>
          <line x1={L} y1={y(b)} x2={W - R} y2={y(b)} strokeDasharray="3 4" className="stroke-zinc-300 dark:stroke-zinc-600" />
          {tierLabel.has(b) && (
            <text style={{ fontSize: svgPx(12) }} x={L - 5} y={y(b) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
              {b}
            </text>
          )}
        </g>
      ))}
      {[lo, Math.round((lo + hi) / 2), hi].map((k) => (
        <text style={{ fontSize: svgPx(12) }} key={k} x={x(k)} y={H - B + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {k}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {words ? t("axisWords") : t("axisChars")}
      </text>
      <path d={curve} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      <line x1={x(n)} y1={y(entropyAt(n))} x2={x(n)} y2={H - B} strokeDasharray="3 3" className="stroke-amber-500" />
      <circle cx={x(n)} cy={y(entropyAt(n))} r={9} strokeWidth={3} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" />
      <text style={{ fontSize: svgPx(12) }} x={Math.min(x(n) + 12, W - 80)} y={Math.max(y(entropyAt(n)) - 10, 14)} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
        {f(entropyAt(n), 1)} {t("bits")}
      </text>
    </FitSvg>
  );

  const per = words ? s.bitsPerSymbol : Math.log2(s.poolSize);
  return (
    <PasswordIndicatorCard
      title={t("title")}
      intro={t(words ? "introWords" : "introChars")}
      indicator={svg}
      rows={[
        { label: words ? t("words") : t("length"), value: f(n) },
        { label: t("perSymbol"), value: `log₂ ${f(s.poolSize)} = ${f(per, 2)}` },
        { label: t("plusOne"), value: `+${f(per, 2)} ${t("bits")}` },
        { label: t("toStrong"), value: f(Math.max(0, Math.ceil((100 - s.extraBits) / per))) },
        { label: t("entropy"), value: `${f(s.entropyBits, 1)} ${t("bits")}`, emphasize: true },
      ]}
    />
  );
}
