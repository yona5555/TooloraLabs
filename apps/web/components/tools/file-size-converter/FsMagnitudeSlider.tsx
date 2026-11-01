"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useRef, useId } from "react";
import { useTranslations } from "next-intl";
import { STORAGE_MEDIA } from "@tooloralabs/tools";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsLive, useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 150;
const L = 12;
const R = 12;
const AXIS_Y = 70;
const LO = 0;
const HI = 15;
const UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/**
 * Interactive piece (type #10, Log-Scale Magnitude Bar): one logarithmic axis from 1 byte to 1 PB with
 * a floppy, a CD, a DVD and a Blu-ray marked. Drag along it to set the size — the inputs, the result and
 * every card follow.
 */
export default function FsMagnitudeSlider() {
  const svgId = useId();
  const t = useTranslations("tools.file-size-converter.education.lab.magnitude");
  const tm = useTranslations("tools.file-size-converter.education.lab.media");
  const { setDim } = useFsLive();
  const { a, f } = useFsModel();
  const svgRef = useRef<SVGSVGElement>(null);
  if (!a) return <FsIndicatorUnavailable title={t("title")} />;

  const x = (log10: number) => Math.round((L + ((Math.max(LO, Math.min(HI, log10)) - LO) / (HI - LO)) * (W - L - R)) * 100) / 100;
  const cur = a.bytes > 0 ? Math.log10(a.bytes) : 0;

  function pick(e: React.PointerEvent<SVGSVGElement>) {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * W;
    const log10 = LO + ((px - L) / (W - L - R)) * (HI - LO);
    const bytes = Math.pow(10, Math.max(LO, Math.min(HI, log10)));
    const level = Math.min(5, Math.floor(Math.log10(Math.max(1, bytes)) / 3));
    const v = bytes / Math.pow(1000, level);
    setDim("value", String(Number(v.toPrecision(3))));
    setDim("unit", UNITS[level]);
    setDim("standard", "decimal");
  }

  const svg = (
    <FitSvg
      ref={svgRef}
      direction="ltr"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="slider"
      aria-label={t("aria")}
      aria-valuemin={0}
      aria-valuemax={15}
      aria-valuenow={Math.round(cur)}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => e.buttons === 1 && pick(e)}
      className="mx-auto block max-w-full cursor-ew-resize touch-none"
    >
      <defs>
        <linearGradient id={`${svgId}fs-mag`} x1="0" x2="1">
          <stop offset="0" stopColor="#93c5fd" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect x={L} y={AXIS_Y - 9} width={W - L - R} height={18} rx={9} fill={`url(#${svgId}fs-mag)`} opacity={0.85} />
      {UNITS.map((u, k) => (
        <g key={u}>
          <line x1={x(k * 3)} y1={AXIS_Y + 10} x2={x(k * 3)} y2={AXIS_Y + 16} className="stroke-zinc-400" />
          <text style={{ fontSize: svgPx(12) }} x={x(k * 3)} y={AXIS_Y + 30} textAnchor="middle" fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
            {u}
          </text>
        </g>
      ))}
      {STORAGE_MEDIA.map((m, i) => {
        const mx = x(Math.log10(m.bytes));
        return (
          <g key={m.key}>
            <line x1={mx} y1={AXIS_Y - 14} x2={mx} y2={i % 2 ? 22 : 34} strokeDasharray="2 3" className="stroke-zinc-400 dark:stroke-zinc-500" />
            <text style={{ fontSize: svgPx(12) }} x={mx} y={i % 2 ? 16 : 28} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
              {tm(m.key)}
            </text>
          </g>
        );
      })}
      <circle cx={x(cur)} cy={AXIS_Y} r={12} strokeWidth={3} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" />
      <text style={{ fontSize: svgPx(13) }} x={Math.min(Math.max(x(cur), 40), W - 40)} y={AXIS_Y + 50} textAnchor="middle" fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
        {t("you")}
      </text>
    </FitSvg>
  );

  const nearest = STORAGE_MEDIA.reduce((b, m) => (Math.abs(Math.log10(m.bytes) - cur) < Math.abs(Math.log10(b.bytes) - cur) ? m : b), STORAGE_MEDIA[0]);
  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("log"), value: `10^${f(cur, 2)} B` },
        { label: t("digits"), value: f(Math.floor(cur) + 1, 0) },
        { label: t("nearest"), value: tm(nearest.key) },
        { label: t("vsNearest"), value: `× ${f(a.bytes / nearest.bytes, 3)}` },
        { label: t("bytes"), value: f(a.bytes, 0), emphasize: true },
      ]}
    />
  );
}
