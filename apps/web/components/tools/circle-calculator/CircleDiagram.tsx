"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  radius: number;
  digitStyle: DigitStyle;
};

const BOX = 180;
const PAD = 30;

/**
 * A live sketch of the circle at the actual solved radius, redrawn on every input change —
 * not a fixed illustration. The circle itself is scaled to fill the drawing box (proportion,
 * not absolute scale, since radius can range from a fraction of a unit to the thousands); the
 * radius line and its label are what stay meaningful regardless of scale.
 */
export default function CircleDiagram({ radius, digitStyle }: Props) {
  const t = useTranslations("tools.circle-calculator.diagram");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 2 });

  const r = BOX / 2;
  const cx = BOX / 2 + PAD;
  const cy = BOX / 2 + PAD;
  const W = BOX + PAD * 2;

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${W} ${W}`} role="img" aria-label={`${t("ariaLabel")}: r = ${fmt(radius)}`} className="mx-auto block w-full max-w-[220px]">
        <circle cx={cx} cy={cy} r={r} className="fill-blue-500/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-300" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={2.5} className="fill-blue-700 dark:fill-blue-300" />
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} strokeWidth={2} strokeDasharray="4 3" className="stroke-blue-700 dark:stroke-blue-300" />
        <text x={cx + r / 2} y={cy - 8} fontSize={13} fontWeight={700} textAnchor="middle" className="fill-blue-700 dark:fill-blue-300">
          r = {fmt(radius)}
        </text>
      </svg>
    </div>
  );
}
