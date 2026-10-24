"use client";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";

const W = 340;
const H = 210;
const TOP = 30;
const BASE = H - 28;

/**
 * Type #1 (Labeled Bar Chart): how many bars and how many spaces are 1, 2, 3 or 4 modules wide —
 * the four widths every UPC/EAN and Code 128 element is built from.
 */
export default function BarcodeWidthHistogram() {
  const t = useTranslations("tools.barcode-generator.education.lab.widths");
  const { a, f, pct } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const peak = Math.max(...a.barWidths, ...a.spaceWidths, 1);
  const group = W / 4;
  const bw = 28;
  const avgBar = a.darkModules / a.bars;
  const avgSpace = (a.modules - a.darkModules) / a.spaces;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <circle cx={8} cy={10} r={6} className="fill-zinc-800 dark:fill-zinc-200" />
      <text x={20} y={14} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
        {t("bars")}
      </text>
      <circle cx={98} cy={10} r={6} className="fill-sky-300 dark:fill-sky-700" />
      <text x={110} y={14} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
        {t("spaces")}
      </text>
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {[0, 1, 2, 3].map((i) => {
        const cx = i * group + group / 2;
        const hb = (a.barWidths[i] / peak) * (BASE - TOP - 16);
        const hs = (a.spaceWidths[i] / peak) * (BASE - TOP - 16);
        return (
          <g key={i}>
            {hb > 0 && <rect x={cx - bw - 2} y={BASE - hb} width={bw} height={hb} rx={4} className="fill-zinc-800 dark:fill-zinc-200" />}
            {hs > 0 && <rect x={cx + 2} y={BASE - hs} width={bw} height={hs} rx={4} className="fill-sky-300 dark:fill-sky-700" />}
            <text x={cx - bw / 2 - 2} y={BASE - hb - 5} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(a.barWidths[i])}
            </text>
            <text x={cx + bw / 2 + 2} y={BASE - hs - 5} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-sky-700 dark:fill-sky-300">
              {f(a.spaceWidths[i])}
            </text>
            <text x={cx} y={BASE + 18} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
              {t("width", { n: i + 1 })}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const narrow = a.barWidths[0] + a.spaceWidths[0];
  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t("intro")}
      mini={1}
      indicator={svg}
      rows={[
        { label: t("barCount"), value: f(a.bars) },
        { label: t("spaceCount"), value: f(a.spaces) },
        { label: t("avgBar"), value: f(avgBar, 2) },
        { label: t("avgSpace"), value: f(avgSpace, 2) },
        { label: t("narrowShare"), value: pct(narrow, a.bars + a.spaces), emphasize: true },
      ]}
    />
  );
}
