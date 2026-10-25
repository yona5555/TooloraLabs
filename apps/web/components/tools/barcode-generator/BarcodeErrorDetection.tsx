"use client";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 110;
const BAR_X = LABEL + 8;
const BAR_W = 170;

/**
 * Type #11 (Side-by-Side Equivalence): every possible single-character typo and every swap of two
 * neighbours was tried against this exact code; the bars show how many the check character catches.
 */
export default function BarcodeErrorDetection() {
  const t = useTranslations("tools.barcode-generator.education.lab.errors");
  const { a, f, pct } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const groups = [
    { key: "substitutions", ...a.errors.substitutions },
    { key: "transpositions", ...a.errors.transpositions },
  ];
  const H = 40 + groups.length * 62;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <circle cx={BAR_X + 4} cy={10} r={5} className="fill-emerald-500 dark:fill-emerald-400" />
      <text style={{ fontSize: svgPx(12) }} x={BAR_X + 14} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("caught")}
      </text>
      <circle cx={BAR_X + 94} cy={10} r={5} className="fill-rose-500 dark:fill-rose-400" />
      <text style={{ fontSize: svgPx(12) }} x={BAR_X + 104} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("missed")}
      </text>
      {groups.map((g, i) => {
        const y = 34 + i * 62;
        const share = g.total ? g.detected / g.total : 1;
        const caught = share * BAR_W;
        return (
          <g key={g.key}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 18} textAnchor="end" fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(g.key)}
            </text>
            <rect x={BAR_X} y={y + 4} width={Math.max(2, caught)} height={22} rx={4} className="fill-emerald-500 dark:fill-emerald-400" />
            {BAR_W - caught > 0.5 && <rect x={BAR_X + caught} y={y + 4} width={BAR_W - caught} height={22} rx={4} className="fill-rose-500 dark:fill-rose-400" />}
            <text style={{ fontSize: svgPx(12) }} x={BAR_X} y={y + 44} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {f(g.detected)} / {f(g.total)} · {pct(g.detected, g.total || 1)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const missed = a.errors.transpositions.total - a.errors.transpositions.detected;
  return (
    <BarcodeIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("subTried"), value: f(a.errors.substitutions.total) },
        { label: t("subCaught"), value: pct(a.errors.substitutions.detected, a.errors.substitutions.total || 1) },
        { label: t("swapTried"), value: f(a.errors.transpositions.total) },
        { label: t("swapMissed"), value: missed ? t("swapMissedWhy", { n: f(missed) }) : "0" },
        { label: t("swapCaught"), value: pct(a.errors.transpositions.detected, a.errors.transpositions.total || 1), emphasize: true },
      ]}
    />
  );
}
