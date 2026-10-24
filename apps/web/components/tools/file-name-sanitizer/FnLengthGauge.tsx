"use client";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { useFnModel } from "./FnLiveContext";

const W = 300;
const H = 176;
const CX = W / 2;
const CY = 150;
const R = 112;
const LIMIT = 255;

const pt = (frac: number, r: number) => {
  const a = Math.PI * (1 - frac);
  return [(CX + r * Math.cos(a)).toFixed(2), (CY - r * Math.sin(a)).toFixed(2)];
};

/**
 * Type #8 (Gradient Gauge): the sanitized name's length in UTF-8 bytes against the 255-byte limit of
 * ext4 and APFS names (NTFS counts 255 UTF-16 units). Non-Latin letters take 2–3 bytes each.
 */
export default function FnLengthGauge() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.length");
  const { a, f } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const used = a.lengths.result.utf8;
  const [nx, ny] = pt(Math.min(1, used / LIMIT), R - 20);
  const zones = [
    { from: 0, to: 0.6, cls: "stroke-emerald-400 dark:stroke-emerald-600" },
    { from: 0.6, to: 0.9, cls: "stroke-amber-400 dark:stroke-amber-500" },
    { from: 0.9, to: 1, cls: "stroke-rose-400 dark:stroke-rose-500" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zones.map((z) => {
        const [x0, y0] = pt(z.from + 0.004, R);
        const [x1, y1] = pt(z.to - 0.004, R);
        return <path key={z.from} d={`M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`} fill="none" strokeWidth={20} className={z.cls} />;
      })}
      {[0, 64, 128, 192, 255].map((v) => {
        const [x, y] = pt(v / LIMIT, R + 24);
        return (
          <text key={v} x={x} y={Number(y) + 4} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
            {v}
          </text>
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} strokeWidth={4} strokeLinecap="round" className="stroke-zinc-800 dark:stroke-zinc-100" />
      <circle cx={CX} cy={CY} r={7} className="fill-zinc-800 dark:fill-zinc-100" />
      <text x={CX} y={CY - 38} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
        {f(used, 0)} B
      </text>
    </svg>
  );

  return (
    <FnIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("chars"), value: f(a.lengths.result.chars, 0) },
        { label: t("utf8"), value: `${f(used, 0)} / ${LIMIT}` },
        { label: t("utf16"), value: `${f(a.lengths.result.utf16, 0)} / ${LIMIT}` },
        { label: t("bytesPerChar"), value: f(used / Math.max(1, a.lengths.result.chars), 2) },
        { label: t("room"), value: `${f(LIMIT - used, 0)} B`, emphasize: true },
      ]}
    />
  );
}
