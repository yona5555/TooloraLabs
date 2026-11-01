"use client";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

import FitSvg from "@/components/tool-ui/FitSvg";
const W = 340;
const MAX_COLS = 13;

/**
 * Type #18 (Formula Diagram): the check digit worked out on the page — every character with its
 * weight and product, the weighted sum, and the modulo step that yields the final digit.
 */
export default function BarcodeCheckDigitFlow() {
  const t = useTranslations("tools.barcode-generator.education.lab.check");
  const { a, f } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const c = a.check;
  const isCode128 = a.symbology === "code128";
  // Long Code 128 values show their first 12 characters; the sum still covers all of them.
  const steps = c.steps.slice(0, isCode128 ? MAX_COLS - 1 : MAX_COLS);
  const cols = steps.length + (isCode128 ? 1 : 0);
  const cw = (W - 54) / cols;
  const x0 = 54;
  const rowY = [20, 52, 84];
  const H = 170;

  const cell = (x: number, y: number, text: string, cls: string, bold = false) => (
    <text style={{ fontSize: svgPx(Math.min(13, cw * 0.62)) }} x={x} y={y} textAnchor="middle" fontWeight={bold ? 700 : 500} fontFamily="var(--font-mono)" className={cls}>
      {text}
    </text>
  );

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[t("rowChar"), t("rowWeight"), t("rowProduct")].map((label, i) => (
        <text style={{ fontSize: svgPx(12) }} key={label} x={0} y={rowY[i]} className="fill-zinc-500 dark:fill-zinc-400">
          {label}
        </text>
      ))}
      {isCode128 && (
        <g>
          <rect x={x0 + 1} y={rowY[0] - 15} width={cw - 2} height={rowY[2] - rowY[0] + 22} rx={6} className="fill-zinc-100 dark:fill-zinc-800" />
          {cell(x0 + cw / 2, rowY[0], "B", "fill-zinc-500 dark:fill-zinc-400", true)}
          {cell(x0 + cw / 2, rowY[1], "·", "fill-zinc-400")}
          {cell(x0 + cw / 2, rowY[2], String(c.base), "fill-zinc-700 dark:fill-zinc-200", true)}
        </g>
      )}
      {steps.map((s, i) => {
        const x = x0 + (i + (isCode128 ? 1 : 0)) * cw + cw / 2;
        const heavy = s.weight !== 1 && !isCode128;
        return (
          <g key={i}>
            <rect
              x={x - cw / 2 + 1}
              y={rowY[0] - 15}
              width={cw - 2}
              height={rowY[2] - rowY[0] + 22}
              rx={6}
              className={heavy ? "fill-blue-50 dark:fill-blue-500/15" : "fill-zinc-50 dark:fill-zinc-800/50"}
            />
            {cell(x, rowY[0], s.char === " " ? "␣" : s.char, "fill-zinc-800 dark:fill-zinc-100", true)}
            {cell(x, rowY[1], `×${s.weight}`, heavy ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-500 dark:fill-zinc-400")}
            {cell(x, rowY[2], String(s.product), "fill-zinc-700 dark:fill-zinc-200", true)}
          </g>
        );
      })}
      <path d={`M ${x0} ${rowY[2] + 16} H ${W}`} className="stroke-zinc-300 dark:stroke-zinc-600" />
      <text style={{ fontSize: svgPx(14) }} x={(x0 + W) / 2} y={rowY[2] + 40} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
        Σ = {f(c.sum)} → {f(c.sum)} mod {c.modulo} = {c.remainder}
      </text>
      <text style={{ fontSize: svgPx(15) }} x={(x0 + W) / 2} y={rowY[2] + 68} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-amber-600 dark:fill-amber-300">
        {isCode128 ? t("resultCode128", { n: c.check }) : t("resultEan", { r: c.remainder, n: c.check })}
      </text>
    </FitSvg>
  );

  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t(isCode128 ? "introCode128" : "introEan")}
      indicator={svg}
      rows={[
        { label: t("weights"), value: isCode128 ? `1, 2, …, ${c.steps.length}` : a.symbology === "upc-a" ? "3, 1, 3, 1, …" : "1, 3, 1, 3, …" },
        { label: t("sum"), value: f(c.sum) },
        { label: t("modulo"), value: `${f(c.sum)} mod ${c.modulo} = ${c.remainder}` },
        { label: t("formula"), value: isCode128 ? `${c.remainder}` : `(10 − ${c.remainder}) mod 10 = ${c.check}` },
        { label: t("check"), value: String(c.check), emphasize: true },
      ]}
    />
  );
}
