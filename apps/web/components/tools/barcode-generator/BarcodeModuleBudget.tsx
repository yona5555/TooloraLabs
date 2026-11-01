"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const BAR_Y = 26;
const BAR_H = 32;

/**
 * Type #15 (Stacked Segmented Bar): the symbol's full width in modules, split into the standard
 * quiet zones, the fixed guard/start/stop patterns, the data and the check character.
 */
export default function BarcodeModuleBudget() {
  const t = useTranslations("tools.barcode-generator.education.lab.budget");
  const { a, f, pct } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const sumOf = (roles: string[]) => a.symbols.filter((s) => roles.includes(s.role)).reduce((n, s) => n + s.bits.length, 0);
  const parts = [
    { key: "quiet", value: a.quietZone.left + a.quietZone.right, fill: "fill-zinc-200 dark:fill-zinc-700" },
    { key: "fixed", value: sumOf(["guard", "center", "start", "stop"]), fill: "fill-zinc-500 dark:fill-zinc-400" },
    { key: "data", value: sumOf(["left", "right", "data"]), fill: "fill-blue-600 dark:fill-blue-400" },
    { key: "check", value: sumOf(["check", "checksum"]), fill: "fill-amber-500 dark:fill-amber-400" },
  ];
  const total = parts.reduce((s, p) => s + p.value, 0);
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((s, p) => s + p.value, 0));
  const H = BAR_Y + BAR_H + 18 + parts.length * 24;
  const order = [parts[0], parts[1], parts[2], parts[3]];

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text style={{ fontSize: svgPx(12) }} x={0} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { n: f(total) })}
      </text>
      {parts.map((p, i) => {
        const x = (starts[i] / total) * W;
        const w = (p.value / total) * W;
        return (
          <g key={p.key}>
            <rect x={x} y={BAR_Y} width={Math.max(0, w - 1.5)} height={BAR_H} rx={4} className={p.fill} />
            {w > 36 && (
              <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontWeight={700} className={p.key === "quiet" ? "fill-zinc-600 dark:fill-zinc-200" : "fill-white"}>
                {pct(p.value, total)}
              </text>
            )}
          </g>
        );
      })}
      {order.map((p, i) => {
        const y = BAR_Y + BAR_H + 30 + i * 24;
        return (
          <g key={p.key}>
            <circle cx={6} cy={y - 4} r={6} className={p.fill} />
            <text style={{ fontSize: svgPx(12) }} x={20} y={y} className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W} y={y} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(p.value)} · {pct(p.value, total)}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("quietLR"), value: `${a.quietZone.left} + ${a.quietZone.right}` },
        { label: t("perChar"), value: a.symbology === "code128" ? "11" : "7" },
        { label: t("efficiency"), value: pct(parts[2].value, total) },
        { label: t("symbolOnly"), value: f(a.modules) },
        { label: t("total"), value: f(total), emphasize: true },
      ]}
    />
  );
}
