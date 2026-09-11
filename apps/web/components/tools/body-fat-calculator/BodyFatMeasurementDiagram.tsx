"use client";
import { useTranslations } from "next-intl";

/** A simplified body outline marking the three tape-measure points the U.S. Navy method uses. */
export default function BodyFatMeasurementDiagram() {
  const t = useTranslations("tools.body-fat-calculator.measurementDiagram");

  return (
    <div dir="ltr" className="flex flex-col items-center">
      <svg viewBox="0 0 220 260" role="img" aria-label={t("ariaLabel")} className="w-48">
        <circle cx="110" cy="30" r="22" className="fill-zinc-200 dark:fill-zinc-700" />
        <path d="M 75 60 Q 60 90 65 140 L 65 220 Q 65 235 80 235 L 95 235 L 100 150 L 120 150 L 125 235 L 140 235 Q 155 235 155 220 L 155 140 Q 160 90 145 60 Z" className="fill-zinc-200 dark:fill-zinc-700" />

        <line x1="55" y1="66" x2="165" y2="66" className="stroke-blue-500" strokeWidth={4} strokeDasharray="6 3" />
        <line x1="50" y1="128" x2="170" y2="128" className="stroke-green-500" strokeWidth={4} strokeDasharray="6 3" />
        <line x1="45" y1="170" x2="175" y2="170" className="stroke-amber-500" strokeWidth={4} strokeDasharray="6 3" />

        <text x="180" y="70" fontSize="13" className="fill-blue-600 dark:fill-blue-400 font-semibold">
          {t("neck")}
        </text>
        <text x="180" y="132" fontSize="13" className="fill-green-600 dark:fill-green-400 font-semibold">
          {t("waist")}
        </text>
        <text x="180" y="174" fontSize="13" className="fill-amber-600 dark:fill-amber-400 font-semibold">
          {t("hip")}
        </text>
      </svg>
      <p className="mt-2 max-w-sm text-center text-xs opacity-70">{t("caption")}</p>
    </div>
  );
}
