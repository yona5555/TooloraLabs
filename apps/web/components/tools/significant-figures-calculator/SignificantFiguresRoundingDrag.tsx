"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mafs, Coordinates, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { roundToSigFigs } from "@tooloralabs/tools";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import { computeDigitSignificance } from "./DigitSignificanceDisplay";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

type Vector2 = [number, number];
const MIN_DIGITS = 1;
const MAX_DIGITS = 8;
const ROW = 0;
const LIGHT = { blue: "#2563eb" };
const DARK = { blue: "#60a5fa" };

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * The hero indicator (§36): a genuinely draggable precision selector — mouse, touch, and
 * keyboard — set over an integer number line from 1 to 8. The value being rounded is the live
 * valueA actually typed above the fold, not a fixed placeholder, so dragging this point and
 * editing the real round-to-digits field both move the same point.
 */
export default function SignificantFiguresRoundingDrag() {
  const t = useTranslations("tools.significant-figures-calculator.education.hero");
  const isDark = useIsDarkMode();
  const colors = isDark ? DARK : LIGHT;
  const { dims, setDim } = useSignificantFiguresLive();

  const point = useMovablePoint([dims.roundToDigits, ROW] as Vector2, {
    color: colors.blue,
    constrain: (p) => [Math.round(Math.min(MAX_DIGITS, Math.max(MIN_DIGITS, p[0]))), ROW],
  });

  const lastDigits = useRef(dims.roundToDigits);
  const suppress = useRef(false);

  useEffect(() => {
    if (dims.roundToDigits !== lastDigits.current) {
      suppress.current = true;
      point.setPoint([dims.roundToDigits, ROW]);
      lastDigits.current = dims.roundToDigits;
    }
  }, [dims.roundToDigits, point]);

  useEffect(() => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    const digits = Math.round(point.point[0]);
    if (digits !== lastDigits.current) {
      lastDigits.current = digits;
      setDim("roundToDigits", digits);
    }
  }, [point, setDim]);

  const numericA = Number(dims.rawValueA);
  const hasValidA = dims.rawValueA.trim() !== "" && Number.isFinite(numericA);
  const rounded = hasValidA ? roundToSigFigs(numericA, dims.roundToDigits) : null;
  const mask = hasValidA ? computeDigitSignificance(dims.rawValueA) : [];

  return (
    <div className="mt-2">
      <div dir="ltr" className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{`${t("valueLabel")}: ${dims.rawValueA || "—"}`}</span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{`${t("digitsLabel")}: ${dims.roundToDigits}`}</span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{`${t("roundedLabel")}: ${rounded !== null ? round3(rounded) : "—"}`}</span>
      </div>

      {hasValidA && (
        <div dir="ltr" className="mb-3 flex flex-wrap justify-center gap-1.5">
          {mask.map((entry, i) => (
            <span
              key={i}
              className={`flex h-9 w-7 items-center justify-center rounded-lg font-mono text-base font-bold transition-colors duration-300 ${
                entry.significant ? "bg-blue-600 text-white" : "border border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
              }`}
            >
              {entry.char}
            </span>
          ))}
        </div>
      )}

      <div dir="ltr" aria-label={t("ariaLabel")} className="mafs-canvas mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
        <Mafs viewBox={{ x: [0, MAX_DIGITS + 1], y: [-1, 1] }} height={110} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian xAxis={{ lines: 1 }} yAxis={{ lines: false, labels: false }} />
          <Text x={(MAX_DIGITS + 1) / 2} y={0.7} size={10} color={isDark ? "#71717a" : "#a1a1aa"}>
            {t("axisHint")}
          </Text>
          {point.element}
        </Mafs>
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>
    </div>
  );
}
