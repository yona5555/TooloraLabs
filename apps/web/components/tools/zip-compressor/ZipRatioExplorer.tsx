"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ZipIndicatorCard, { ZipIndicatorUnavailable } from "./ZipIndicatorCard";
import { FILE_FILL, formatBytes, useZipModel } from "./ZipLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const BASE = H - 40;
const TOP = 20;

/**
 * Interactive piece: each file's original size (grey) beside its compressed size (colour). Click a
 * pair, or drag the slider, to read that entry's record from the archive: method, CRC-32, ratio, bytes saved.
 */
export default function ZipRatioExplorer() {
  const t = useTranslations("tools.zip-compressor.education.lab.explorer");
  const { ready, rows, f } = useZipModel();
  const [pick, setPick] = useState(0);
  if (!ready) return <ZipIndicatorUnavailable title={t("title")} />;

  const k = Math.min(pick, rows.length - 1);
  const r = rows[k];
  const shown = rows.slice(0, 8);
  const peak = Math.max(...shown.map((x) => x.size), 1);
  const slot = W / shown.length;
  const bw = Math.min(26, slot / 2 - 6);
  const y = (v: number) => BASE - (v / peak) * (BASE - TOP);

  const svg = (
    <div className="w-[340px] max-w-full">
      <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {shown.map((x, i) => {
          const cx = i * slot + slot / 2;
          const on = i === k;
          return (
            <g key={x.name} onClick={() => setPick(i)} className="cursor-pointer">
              <rect x={cx - bw - 2} y={y(x.size)} width={bw} height={BASE - y(x.size)} rx={4} className="fill-zinc-300 dark:fill-zinc-600" />
              <rect x={cx + 2} y={y(x.compressed)} width={bw} height={Math.max(2, BASE - y(x.compressed))} rx={4} className={FILE_FILL[i % FILE_FILL.length]} opacity={on ? 1 : 0.55} />
              <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 16} textAnchor="middle" fontWeight={on ? 700 : 500} fontFamily="var(--font-mono)" className="fill-zinc-700 dark:fill-zinc-200">
                {x.name.length > 10 ? `${x.name.slice(0, 9)}…` : x.name}
              </text>
              <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 31} textAnchor="middle" fontWeight={700} className={on ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-500 dark:fill-zinc-400"}>
                −{f((1 - x.ratio) * 100, 0)}%
              </text>
            </g>
          );
        })}
      </FitSvg>
      <input type="range" min={0} max={shown.length - 1} value={k} onChange={(e) => setPick(Number(e.target.value))} aria-label={t("slider")} className="mt-1 w-full accent-blue-600" />
    </div>
  );

  return (
    <ZipIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("file"), value: r.name },
        { label: t("method"), value: r.method === 8 ? "8 · DEFLATE" : r.method === 0 ? `0 · ${t("stored")}` : String(r.method) },
        { label: "CRC-32", value: r.crc32.toString(16).padStart(8, "0").toUpperCase() },
        { label: t("sizes"), value: `${formatBytes(r.size)} → ${formatBytes(r.compressed)}` },
        { label: t("saved"), value: `${formatBytes(r.saved)} (${f((1 - r.ratio) * 100, 1)}%)`, emphasize: true },
      ]}
    />
  );
}
