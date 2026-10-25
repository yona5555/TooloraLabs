"use client";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { durationParts, useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const BASE = H - 44;
const TOP = 24;

/**
 * Type #1 (Labeled Bar Chart): time to move this size over four connections, bits = bytes × 8, on a log
 * scale (a dial-up line and fibre differ by a factor of almost 18,000).
 */
export default function FsTransferBars() {
  const t = useTranslations("tools.file-size-converter.education.lab.transfer");
  const tp = useTranslations("tools.file-size-converter.aboveFold.transferTime.presets");
  const tu = useTranslations("tools.file-size-converter.aboveFold.transferTime");
  const { a, f } = useFsModel();
  if (!a || a.bytes === 0) return <FsIndicatorUnavailable title={t("title")} />;

  const logs = a.transfers.map((x) => Math.log10(Math.max(x.seconds, 1e-3)));
  const lo = Math.min(...logs) - 0.5;
  const hi = Math.max(...logs) + 0.2;
  const slot = W / a.transfers.length;
  const y = (l: number) => Math.round((BASE - ((l - lo) / (hi - lo)) * (BASE - TOP)) * 100) / 100;
  const label = (s: number) => {
    const d = durationParts(s);
    return `${f(d.v, d.v < 10 ? 1 : 0)} ${tu(d.unit)}`;
  };

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {a.transfers.map((x, i) => {
        const cx = i * slot + slot / 2;
        const top = y(logs[i]);
        return (
          <g key={x.key}>
            <rect
              x={cx - 24}
              y={top}
              width={48}
              height={BASE - top}
              rx={5}
              className={["fill-rose-500 dark:fill-rose-400", "fill-amber-500 dark:fill-amber-400", "fill-blue-600 dark:fill-blue-400", "fill-emerald-500 dark:fill-emerald-400"][i]}
            />
            <text style={{ fontSize: svgPx(12) }} x={cx} y={top - 6} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
              {label(x.seconds)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 16} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
              {tp(x.key).split(" (")[0]}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={BASE + 30} textAnchor="middle" fontFamily="ui-monospace, monospace" className="fill-zinc-400 dark:fill-zinc-500">
              {f(x.mbps, 3)} Mb/s
            </text>
          </g>
        );
      })}
    </svg>
  );

  const fiber = a.transfers[3];
  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("bits"), value: `${f(a.bytes, 0)} × 8 = ${f(a.bits, 0)}` },
        { label: t("formula"), value: t("formulaValue") },
        { label: t("fiber"), value: label(fiber.seconds) },
        { label: t("ratio"), value: `× ${f(a.transfers[0].seconds / fiber.seconds, 0)}` },
        { label: t("wifi"), value: label(a.transfers[2].seconds), emphasize: true },
      ]}
    />
  );
}
