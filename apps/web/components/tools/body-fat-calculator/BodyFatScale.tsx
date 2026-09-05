"use client";
import { useTranslations } from "next-intl";
import type { BodyFatCategory, Gender } from "./types";

const WIDTH = 320;
const HEIGHT = 28;

const RANGES: Record<Gender, { category: BodyFatCategory; from: number; to: number; color: string }[]> = {
  male: [
    { category: "essential", from: 0, to: 5, color: "#3b82f6" },
    { category: "athletes", from: 5, to: 13, color: "#22c55e" },
    { category: "fitness", from: 13, to: 17, color: "#84cc16" },
    { category: "average", from: 17, to: 24, color: "#f59e0b" },
    { category: "obese", from: 24, to: 35, color: "#ef4444" },
  ],
  female: [
    { category: "essential", from: 0, to: 13, color: "#3b82f6" },
    { category: "athletes", from: 13, to: 20, color: "#22c55e" },
    { category: "fitness", from: 20, to: 24, color: "#84cc16" },
    { category: "average", from: 24, to: 31, color: "#f59e0b" },
    { category: "obese", from: 31, to: 42, color: "#ef4444" },
  ],
};

type Props = {
  gender: Gender;
  bodyFatPercent: number;
};

/** A horizontal scale of ACE body-fat categories for the given gender, with a marker at the calculated percentage. */
export default function BodyFatScale({ gender, bodyFatPercent }: Props) {
  const t = useTranslations("tools.body-fat-calculator.categories");
  const ranges = RANGES[gender];
  const domainMax = ranges[ranges.length - 1].to;
  const scaleX = (v: number) => (Math.min(v, domainMax) / domainMax) * WIDTH;
  const markerX = scaleX(bodyFatPercent);

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 -14 ${WIDTH} ${HEIGHT + 14}`} role="img" aria-label={`${t("scaleAriaLabel")}: ${bodyFatPercent.toFixed(1)}%`} className="w-full">
        {ranges.map((r) => (
          <rect key={r.category} x={scaleX(r.from)} y={0} width={scaleX(r.to) - scaleX(r.from)} height={HEIGHT} fill={r.color} />
        ))}
        <polygon points={`${markerX - 6},-12 ${markerX + 6},-12 ${markerX},0`} className="fill-zinc-900 dark:fill-zinc-50" />
      </svg>
      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-5">
        {ranges.map((r) => (
          <span key={r.category} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
            {t(r.category)}
          </span>
        ))}
      </div>
    </div>
  );
}
