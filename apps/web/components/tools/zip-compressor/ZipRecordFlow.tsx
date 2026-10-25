"use client";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const STEP = 44;
const PILL_W = 230;

/**
 * Type #3 (Hierarchical Flow): the order of records inside this archive, as the ZIP specification
 * lays them out — for the first file its local header and data, then the central directory with one
 * record per file, then the end record that points back to it.
 */
export default function ZipRecordFlow() {
  const t = useTranslations("tools.zip-compressor.education.lab.flow");
  const { draft, ready, f } = useZipModel();
  const L = draft.layout;
  if (!ready || !L) return <ZipIndicatorUnavailable title={t("title")} />;

  const first = L.entries[0];
  const steps = [
    { label: t("local", { name: first.name }), value: `${f(first.localHeader)} B`, cls: "fill-amber-500 dark:fill-amber-400" },
    { label: t("data"), value: `${f(first.compressedSize)} B`, cls: "fill-blue-600 dark:fill-blue-400" },
    { label: t("others", { n: L.entries.length - 1 }), value: `${f(L.dataBytes + L.localHeaderBytes - first.localHeader - first.compressedSize)} B`, cls: "fill-sky-500 dark:fill-sky-400" },
    { label: t("central", { n: L.entries.length }), value: `${f(L.centralDirectoryBytes)} B`, cls: "fill-violet-500 dark:fill-violet-400" },
    { label: t("end"), value: `${f(L.endRecordBytes)} B`, cls: "fill-rose-500 dark:fill-rose-400" },
  ];
  const H = steps.length * STEP;
  const x0 = (W - PILL_W) / 2;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {steps.map((s, i) => {
        const y = i * STEP + 4;
        return (
          <g key={i}>
            {i < steps.length - 1 && <path d={`M ${W / 2} ${y + 30} V ${y + STEP} m -5 -7 l 5 7 l 5 -7`} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />}
            <rect x={x0} y={y} width={PILL_W} height={30} rx={15} className={s.cls} />
            <text style={{ fontSize: svgPx(12) }} x={x0 + 14} y={y + 20} fontWeight={600} className="fill-white">
              {s.label.length > 24 ? `${s.label.slice(0, 23)}…` : s.label}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x0 + PILL_W - 14} y={y + 20} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-white">
              {s.value}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("localFormula"), value: `30 + ${f(first.localHeader - 30)} = ${f(first.localHeader)} B` },
        { label: t("centralFormula"), value: `46 + ${f(first.centralRecord - 46)} = ${f(first.centralRecord)} B` },
        { label: t("endSize"), value: `${f(L.endRecordBytes)} B` },
        { label: t("signature"), value: "PK\\x03\\x04 · PK\\x01\\x02 · PK\\x05\\x06" },
        { label: t("total"), value: `${f(L.archiveBytes)} B`, emphasize: true },
      ]}
    />
  );
}
