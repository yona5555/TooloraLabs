"use client";
import { useTranslations } from "next-intl";
import type { SleepOption } from "./types";

const WIDTH = 320;
const CYCLE_WIDTH = 30;
const HEIGHT = 24;
const MAX_CYCLES = 6;

/**
 * A row of blocks, one per 90-minute sleep cycle, for the option with the most cycles —
 * a visual anchor for why more recommended options mean more complete cycles, not an
 * arbitrary duration difference.
 */
export default function SleepCycleDiagram({ options }: { options: SleepOption[] }) {
  const t = useTranslations("tools.sleep-calculator.diagram");
  if (options.length === 0) return null;

  const maxCycles = Math.max(...options.map((o) => o.cycles), MAX_CYCLES);
  const totalWidth = Math.min(maxCycles * CYCLE_WIDTH + (maxCycles - 1) * 4, WIDTH);
  const gap = 4;

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${totalWidth} ${HEIGHT}`} role="img" aria-label={t("ariaLabel")} className="mx-auto block w-full max-w-[320px]">
        {Array.from({ length: maxCycles }).map((_, i) => (
          <rect
            key={i}
            x={i * (CYCLE_WIDTH + gap)}
            y={0}
            width={CYCLE_WIDTH}
            height={HEIGHT}
            rx={4}
            className="fill-blue-500/70 dark:fill-blue-400/70"
          />
        ))}
      </svg>
      <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("caption", { count: maxCycles })}</p>
    </div>
  );
}
