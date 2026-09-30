"use client";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { roundToSigFigs } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { computeDigitSignificance } from "./DigitSignificanceDisplay";

type Vector2 = [number, number];

const BASE_VALUE = 3.14159265;
const MIN_SIG_FIGS = 1;
const MAX_SIG_FIGS = 8;
const LIGHT = { blue: "#2563eb" };
const DARK = { blue: "#60a5fa" };

/**
 * The hero indicator (§36): drag a point along an integer axis from 1 to 8 — that number is how
 * many significant figures pi gets rounded to, live, via this tool's own roundToSigFigs
 * function. The digits themselves are highlighted using the same significance logic the
 * education page's other indicator (and the above-the-fold Result panel) already uses, so it's
 * visually obvious which digits survived the rounding.
 */
export default function SignificantFiguresRoundingDrag() {
  const t = useTranslations("tools.significant-figures-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;

  const point = useMovablePoint([4, 0] as Vector2, {
    color: colors.blue,
    constrain: (p) => [Math.min(MAX_SIG_FIGS, Math.max(MIN_SIG_FIGS, Math.round(p[0]))), 0],
  });

  const sigFigs = Math.round(point.point[0]);
  const rounded = roundToSigFigs(BASE_VALUE, sigFigs);
  const roundedStr = rounded.toString();
  const mask = computeDigitSignificance(roundedStr);

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${sigFigs} ${t("sigFigsUnit")}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`π ≈ ${roundedStr}`}</span>
      </div>

      <div dir="ltr" className="flex flex-wrap justify-center gap-1.5">
        {mask.map((entry, i) => (
          <span
            key={i}
            className={`flex h-10 w-8 items-center justify-center rounded-lg font-mono text-lg font-bold ${
              entry.significant ? "bg-blue-600 text-white" : "border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
            }`}
          >
            {entry.char}
          </span>
        ))}
      </div>

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas mt-3 w-full overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [0, 9], y: [-1, 1] }} height={110} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: false, axis: false }} />
          {point.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
