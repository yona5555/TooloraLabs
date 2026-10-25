"use client";
import { useTranslations } from "next-intl";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

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
  const base = H - 40;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
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
            <text style={{ fontSize: svgPx(12) }} x={x0 + side / 2} y={base + 16} textAnchor="middle" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
              {t("module", { m })}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x0 + side / 2} y={base + 32} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {f(widths[k], 1)} mm
            </text>
          </g>
        );
      })}
    </svg>
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
