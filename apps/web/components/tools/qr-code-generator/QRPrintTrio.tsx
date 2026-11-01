"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW, laneRows } from "@/components/tool-ui/labelLayout";

const W = 340;
const H = 200;
const QUIET = 4;
const MODULES_MM = [0.3, 0.5, 1];

/**
 * Type #12 (Sensitivity Trio): the real symbol drawn to scale at three module sizes — 0.3, 0.5 and
 * 1 mm — each with the four-module quiet zone the standard requires, and its printed width.
 */
export default function QRPrintTrio() {
  const t = useTranslations("tools.qr-code-generator.education.lab.print");
  const { a, f } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const span = a.size + QUIET * 2;
  const widths = MODULES_MM.map((m) => span * m);
  const scale = Math.min((W - 24) / widths.reduce((s, w) => s + w, 0), (H - 50) / widths[2]);
  const px = widths.map((w) => w * scale);
  const gap = (W - px.reduce((s, w) => s + w, 0)) / 2;
  const xs = px.map((_, i) => px.slice(0, i).reduce((s, w) => s + w + gap, 0));
  // each square's two-line caption kept inside the drawing, and moved a lane down (the drawing grows by it)
  // when it would touch the caption before it (the 0.3 mm square is narrower than its caption) (§39)
  const caps = MODULES_MM.map((m, k) => {
    const w = Math.max(labelW(t("module", { m })), labelW(`${f(widths[k], 1)} mm`)) * 1.15;
    return { w, x: Math.max(w / 2 + 2, Math.min(W - w / 2 - 2, xs[k] + px[k] / 2)) };
  });
  const lane = laneRows(caps, 6);
  const base = H - 40;
  const HT = H + Math.max(...lane) * 32;

  const svg = (
    <FitSvg direction="ltr" width={W} height={HT} viewBox={`0 0 ${W} ${HT}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {MODULES_MM.map((m, k) => {
        const side = px[k];
        const cell = side / span;
        const x0 = xs[k];
        const y0 = base - side;
        return (
          <g key={m}>
            <rect x={x0} y={y0} width={side} height={side} rx={2} className="fill-white stroke-zinc-300 dark:stroke-zinc-600" />
            {a.dark.map((d, i) =>
              d ? <rect key={i} x={x0 + (QUIET + (i % a.size)) * cell} y={y0 + (QUIET + Math.floor(i / a.size)) * cell} width={cell + 0.05} height={cell + 0.05} className="fill-zinc-900" /> : null,
            )}
            <text style={{ fontSize: svgPx(12) }} x={caps[k].x} y={base + 16 + lane[k] * 32} textAnchor="middle" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
              {t("module", { m })}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={caps[k].x} y={base + 32 + lane[k] * 32} textAnchor="middle" fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {f(widths[k], 1)} mm
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("span"), value: `${a.size} + 2 × ${QUIET} = ${span}` },
        ...MODULES_MM.map((m, k) => ({ label: t("module", { m }), value: `${f(widths[k], 1)} × ${f(widths[k], 1)} mm` })),
        { label: t("perCm"), value: t("perCmValue", { n: f(10 / span, 2) }), emphasize: true },
      ]}
    />
  );
}
