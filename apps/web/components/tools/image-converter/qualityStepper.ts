import type { Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { snap } from "@/components/tool-ui/indicator-kit/format";

/** First-view quality: low enough that lossy artefacts show at a glance in the comparison lens. */
export const Q_SEED = 30;
const Q_MIN = 10;
const Q_MAX = 100;

/**
 * The page's one quality value (0–1) as a kit Stepper in percent, so the Input card's track, the
 * gauge's outer ring and every − / + / reset button read and write the same state.
 */
export function qualityStepper(quality: number, onQualityChange: (q: number) => void): Stepper {
  const q = Math.round(quality * 100);
  const setQ = (v: number) => onQualityChange(snap(v, 1, Q_MIN, Q_MAX) / 100);
  return {
    value: q,
    set: setQ,
    inc: () => setQ(q + 1),
    dec: () => setQ(q - 1),
    reset: () => setQ(Q_SEED),
    flash: 0,
    atMin: q <= Q_MIN,
    atMax: q >= Q_MAX,
    isSeed: q === Q_SEED,
    min: Q_MIN,
    max: Q_MAX,
    step: 1,
  };
}
