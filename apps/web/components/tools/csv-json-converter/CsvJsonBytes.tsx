"use client";
import { useTranslations } from "next-intl";
import CsvIndicatorCard, { CsvIndicatorUnavailable } from "./CsvIndicatorCard";
import { useCsvModel } from "./CsvLiveContext";

const W = 340;
const BAR_Y = 26;
const BAR_H = 32;

/** Type #15 (Stacked Segmented Bar): the minified JSON's bytes split into repeated key names, cell values and punctuation. */
export default function CsvJsonBytes() {
  const t = useTranslations("tools.csv-json-converter.education.lab.jsonBytes");
  const { a, f, pct } = useCsvModel();
  if (!a) return <CsvIndicatorUnavailable title={t("title")} />;

  const total = a.sizes.jsonMin;
  const parts = [
    { key: "values", v: a.jsonBytes.values, cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "keys", v: a.jsonBytes.keys, cls: "fill-amber-500 dark:fill-amber-400" },
    { key: "punctuation", v: a.jsonBytes.punctuation, cls: "fill-zinc-400 dark:fill-zinc-500" },
  ];
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((s, p) => s + p.v, 0));
  const H = BAR_Y + BAR_H + 18 + parts.length * 24;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={0} y={14} fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { n: f(total) })}
      </text>
      {parts.map((p, i) => {
        const x = (starts[i] / total) * W;
        const w = (p.v / total) * W;
        return (
          <g key={p.key}>
            <rect x={x} y={BAR_Y} width={Math.max(1, w - 1.5)} height={BAR_H} rx={4} className={p.cls} />
            {w > 36 && (
              <text x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-white">
                {pct(p.v, total)}
              </text>
            )}
          </g>
        );
      })}
      {parts.map((p, i) => {
        const y = BAR_Y + BAR_H + 30 + i * 24;
        return (
          <g key={p.key}>
            <circle cx={6} cy={y - 4} r={6} className={p.cls} />
            <text x={20} y={y} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text x={W} y={y} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(p.v)} B
            </text>
          </g>
        );
      })}
    </svg>
  );

  const keyBytesPerRow = a.jsonBytes.keys / Math.max(1, a.rows.length);
  return (
    <CsvIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("keysPerRow"), value: `${f(keyBytesPerRow)} B × ${f(a.rows.length)}` },
        { label: t("keysOnce"), value: `${f(keyBytesPerRow)} B` },
        { label: t("repeatCost"), value: `${f(a.jsonBytes.keys - keyBytesPerRow)} B` },
        { label: t("sum"), value: `${f(a.jsonBytes.values)} + ${f(a.jsonBytes.keys)} + ${f(a.jsonBytes.punctuation)}` },
        { label: t("keysShare"), value: pct(a.jsonBytes.keys, total), emphasize: true },
      ]}
    />
  );
}
