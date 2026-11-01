"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/**
 * Type #8 (Gradient Gauge): how much of the disk space a file of this size actually uses when the file
 * system allocates in 4 KiB clusters (the NTFS, ext4 and APFS default). Tiny files waste most of a cluster.
 */
export default function FsClusterGauge() {
  const t = useTranslations("tools.file-size-converter.education.lab.cluster");
  const { a, f } = useFsModel();
  if (!a || a.bytes === 0) return <FsIndicatorUnavailable title={t("title")} />;

  const used = a.bytes / a.sizeOnDisk;
  const [nx, ny] = pt(used, R - 20);
  const zones = [
    { from: 0, to: 0.5, cls: "stroke-rose-400 dark:stroke-rose-500" },
    { from: 0.5, to: 0.9, cls: "stroke-amber-400 dark:stroke-amber-500" },
    { from: 0.9, to: 1, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
  ];

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      {[0, 25, 50, 75, 100].map((v) => {
        const [x, y] = pt(v / 100, R + 24);
        return (
          <text style={{ fontSize: svgPx(12) }} key={v} x={x} y={Number(y) + 4} textAnchor={Number(x) > W - 40 ? "end" : Number(x) < 40 ? "start" : "middle"} className="fill-zinc-500 dark:fill-zinc-400">
            {v}%
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text style={{ fontSize: svgPx(22) }} x={CX} y={CY - 38} textAnchor="middle" fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {f(used * 100, used > 0.999 ? 4 : 1)}%
      </text>
    </FitSvg>
  );

  return (
    <FsIndicatorCard
      mini={1}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("clusters"), value: `⌈${f(a.bytes, 0)} / 4096⌉ = ${f(a.clusters, 0)}` },
        { label: t("onDisk"), value: `${f(a.sizeOnDisk, 0)} B` },
        { label: t("slack"), value: `${f(a.slack, 0)} B` },
        { label: t("lastCluster"), value: `${f(a.bytes % 4096 || 4096, 0)} / 4096 B` },
        { label: t("efficiency"), value: `${f(used * 100, 3)}%`, emphasize: true },
      ]}
    />
  );
}
