"use client";
import { useTranslations } from "next-intl";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const BAR_Y = 26;
const BAR_H = 34;

/**
 * Type #15 (Stacked Segmented Bar): the symbol's codewords (bytes) split into the ones carrying your
 * content (headers included), the padding that fills the rest of the data area, and the Reed–Solomon
 * error-correction codewords.
 */
export default function QRCodewordBar() {
  const t = useTranslations("tools.qr-code-generator.education.lab.codewords");
  const { a, f, pct } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const used = Math.ceil(a.usedBits / 8);
  const parts = [
    { key: "content", value: used, fill: "fill-blue-600 dark:fill-blue-400" },
    { key: "padding", value: a.dataCodewords - used, fill: "fill-sky-300 dark:fill-sky-700" },
    { key: "ec", value: a.ecCodewords, fill: "fill-amber-500 dark:fill-amber-400" },
  ];
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((s, p) => s + p.value, 0));
  const H = BAR_Y + BAR_H + 18 + parts.length * 24;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text style={{ fontSize: svgPx(12) }} x={0} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { n: a.totalCodewords, v: a.version })}
      </text>
      {parts.map((p, i) => {
        const x = (starts[i] / a.totalCodewords) * W;
        const w = (p.value / a.totalCodewords) * W;
        return (
          <g key={p.key}>
            <rect x={x} y={BAR_Y} width={Math.max(0, w - 1.5)} height={BAR_H} rx={4} className={p.fill} />
            {w > 36 && (
              <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontWeight={700} className={p.key === "padding" ? "fill-sky-900 dark:fill-sky-100" : "fill-white"}>
                {pct(p.value, a.totalCodewords)}
              </text>
            )}
          </g>
        );
      })}
      {parts.map((p, i) => {
        const y = BAR_Y + BAR_H + 30 + i * 24;
        return (
          <g key={p.key}>
            <circle cx={6} cy={y - 4} r={6} className={p.fill} />
            <text style={{ fontSize: svgPx(12) }} x={20} y={y} className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W} y={y} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(p.value)}
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
        { label: t("bits"), value: `${f(a.usedBits)} / ${f(a.dataCodewords * 8)}` },
        { label: t("blocks"), value: f(a.blocks) },
        { label: t("ecPerBlock"), value: f(a.ecCodewords / a.blocks) },
        { label: t("repairable"), value: t("repairableValue", { n: a.blocks * Math.floor(a.ecCodewords / a.blocks / 2) }) },
        { label: t("fill"), value: pct(used, a.dataCodewords), emphasize: true },
      ]}
    />
  );
}
