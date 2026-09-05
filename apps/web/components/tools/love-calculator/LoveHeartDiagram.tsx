"use client";
import { useId } from "react";
import { useTranslations } from "next-intl";

type Props = {
  percentage: number;
};

const HEART_PATH =
  "M50 88 C 15 62, 0 40, 0 22 C 0 6, 14 -2, 27 4 C 38 9, 46 20, 50 28 C 54 20, 62 9, 73 4 C 86 -2, 100 6, 100 22 C 100 40, 85 62, 50 88 Z";

export default function LoveHeartDiagram({ percentage }: Props) {
  const t = useTranslations("tools.love-calculator.diagram");
  const clipId = useId();
  const fillY = 88 - (percentage / 100) * 88;

  return (
    <svg viewBox="-4 -6 108 98" width={160} height={140} role="img" aria-label={t("ariaLabel", { percentage })}>
      <defs>
        <clipPath id={clipId}>
          <rect x={-4} y={fillY} width={108} height={98 - fillY} />
        </clipPath>
      </defs>
      <path d={HEART_PATH} className="fill-pink-100 stroke-pink-400 dark:fill-zinc-800 dark:stroke-pink-500" strokeWidth="3" />
      <path d={HEART_PATH} className="fill-pink-500 dark:fill-pink-500" clipPath={`url(#${clipId})`} />
      <text x="50" y="48" textAnchor="middle" className="fill-pink-900 font-mono text-[1.35rem] font-bold dark:fill-white">
        {percentage}%
      </text>
    </svg>
  );
}
