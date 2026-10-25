"use client";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 200;

/**
 * Type #12 (Sensitivity Trio): the same symbol drawn to scale at three print sizes — GS1's 80 %,
 * 100 % and 200 % magnifications for UPC/EAN, or three X-dimensions for Code 128 — with real millimetres.
 */
export default function BarcodePrintSizes() {
  const t = useTranslations("tools.barcode-generator.education.lab.sizes");
  const { a, f } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const big = a.sizes[2];
  const sumW = a.sizes.reduce((x, s) => x + s.widthMm, 0);
  const scale = Math.min((W - 16) / sumW, (H - 56) / big.heightMm);
  const bits = a.symbols.map((s) => s.bits).join("");
  const totalModules = a.modules + a.quietZone.left + a.quietZone.right;
  const widths = a.sizes.map((s) => s.widthMm * scale);
  const gap = (W - widths.reduce((x, y) => x + y, 0)) / 2;
  const placements = a.sizes.map((s, i) => ({ s, x: widths.slice(0, i).reduce((x, y) => x + y + gap, 0), w: widths[i], h: s.heightMm * scale }));

  const draw = (x: number, base: number, w: number, h: number) => {
    const m = w / totalModules;
    const q = a.quietZone.left * m;
    return [...bits].map((b, i) => (b === "1" ? <rect key={i} x={x + q + i * m} y={base - h} width={m + 0.15} height={h} className="fill-zinc-900" /> : null));
  };

  const base = H - 34;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {placements.map(({ s, x, w, h }) => (
        <g key={s.key}>
          <rect x={x} y={base - h - 4} width={w} height={h + 8} rx={3} className="fill-white stroke-zinc-300 dark:fill-zinc-50 dark:stroke-zinc-600" />
          {draw(x, base, w, h)}
          <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={base + 18} textAnchor="middle" fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
            {t(s.key)}
          </text>
          <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={base + 32} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
            {f(s.widthMm, 1)} mm
          </text>
        </g>
      ))}
    </svg>
  );

  const isCode128 = a.symbology === "code128";
  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t(isCode128 ? "introCode128" : "introEan")}
      indicator={svg}
      rows={[
        ...a.sizes.map((s) => ({ label: isCode128 ? `X ${f(s.x, 2)} mm` : `${t(s.key)} (X ${f(s.x, 3)} mm)`, value: `${f(s.widthMm, 1)} × ${f(s.heightMm, 1)} mm` })),
        { label: t("modules"), value: `${f(totalModules)} × X` },
        { label: t("nominal"), value: `${f(a.sizes[1].widthMm, 2)} mm`, emphasize: true },
      ]}
    />
  );
}
