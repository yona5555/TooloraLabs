"use client";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const ROW = 46;

/**
 * Type #4 (Icon Comparison Rows): the same byte count as different software labels it — Windows File
 * Explorer (×1024 but "KB/MB/GB" labels), macOS Finder since 10.6 (×1000), GNU `ls -lh` (×1024 with
 * K/M/G) and a drive's packaging (×1000).
 */
export default function FsOsLabels() {
  const t = useTranslations("tools.file-size-converter.education.lab.os");
  const { out, a, f } = useFsModel();
  if (!out || !a || a.bytes === 0) return <FsIndicatorUnavailable title={t("title")} />;

  const dec = `${f(a.decimalValue, 1)} ${out.decimal[a.decimalLevel].unit}`;
  const binNum = f(a.binaryValue, 1);
  const rows = [
    { key: "windows", label: `${binNum} ${["bytes", "KB", "MB", "GB", "TB", "PB"][a.binaryLevel]}`, base: "×1024", cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "mac", label: dec, base: "×1000", cls: "fill-zinc-600 dark:fill-zinc-300" },
    { key: "ls", label: `${f(a.binaryValue, a.binaryValue < 10 ? 1 : 0)}${["", "K", "M", "G", "T", "P"][a.binaryLevel]}`, base: "×1024", cls: "fill-emerald-600 dark:fill-emerald-400" },
    { key: "box", label: dec, base: "×1000", cls: "fill-amber-500 dark:fill-amber-400" },
  ];
  const H = rows.length * ROW + 4;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * ROW + ROW / 2 + 2;
        return (
          <g key={r.key}>
            <circle cx={16} cy={y} r={12} className={r.cls} />
            <text style={{ fontSize: svgPx(12) }} x={16} y={y + 4} textAnchor="middle" fontWeight={700} className="fill-white">
              {t(`${r.key}Short`)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={38} y={y - 3} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(r.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={38} y={y + 13} fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {r.base}
            </text>
            <text style={{ fontSize: svgPx(15) }} x={W - 2} y={y + 5} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("windows"), value: rows[0].label },
        { label: t("mac"), value: rows[1].label },
        { label: t("ls"), value: rows[2].label },
        { label: t("why"), value: t("whyValue") },
        { label: t("gap"), value: `${f(a.decimalLevel ? (1 - 1 / Math.pow(1.024, a.decimalLevel)) * 100 : 0, 2)}%`, emphasize: true },
      ]}
    />
  );
}
