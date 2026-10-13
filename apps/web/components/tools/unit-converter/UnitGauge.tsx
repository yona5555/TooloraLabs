"use client";
import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { UnitCategory } from "@tooloralabs/tools";
import { KitControls, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { DualRingGauge } from "@/components/tool-ui/indicator-kit/DualRingGauge";
import { fmtSmart, niceCeil, snap } from "@/components/tool-ui/indicator-kit/format";
import { sceneBase } from "./units";

/**
 * §44 (2D): the approved double-ring gauge at the top of the Result card. Both rings fill to the
 * same quantity; the outer ring is ticked in the "from" unit, the inner ring in the "to" unit
 * (round values of each unit, placed with the converter's own conversion). The handle and the
 * − / + / reset buttons write the Value field; typing in the field moves the handle.
 */
const lbl = (v: number) => fmtSmart(v, 3);

/** Fractions (0, 1] of round values of one unit across [lo, hi], about `n` of them. */
function ringTicks(lo: number, hi: number, n = 10): number[] {
  if (!(hi > lo)) return [];
  const step = niceCeil((hi - lo) / n);
  const out: number[] = [];
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-6; v += step) {
    const f = (v - lo) / (hi - lo);
    if (f > 0.004 && f <= 1.000001) out.push(Math.min(1, f));
  }
  return out;
}

export default function UnitGauge({
  category,
  from,
  value,
  seed,
  conv,
  onSet,
  fromSym,
  toSym,
}: {
  category: UnitCategory;
  from: string;
  value: number;
  seed: number;
  conv: (v: number) => number;
  onSet: (v: number) => void;
  fromSym: string;
  toSym: string;
}) {
  const t = useTranslations("tools.unit-converter.visuals.hero");
  const tCat = useTranslations("tools.unit-converter.categories");
  const [base0, base1] = sceneBase(category, from);
  const live: [number, number] = [Math.min(base0, value < base0 ? -niceCeil(-value) : base0), Math.max(base1, niceCeil(value))];
  // The scale is frozen while dragging, so pulling a large typed value down never rescales mid-drag.
  const [dragging, setDragging] = useState(false);
  const frozen = useRef(live);
  const [lo, hi] = dragging ? frozen.current : live;
  const step = niceCeil((hi - lo) / 200);
  const set = useCallback((v: number) => onSet(snap(v, step, lo, hi)), [onSet, step, lo, hi]);
  const s: Stepper = {
    value,
    set,
    inc: () => set(value + step),
    dec: () => set(value - step),
    reset: () => set(seed),
    flash: 0,
    atMin: value <= lo,
    atMax: value >= hi,
    isSeed: Math.abs(value - seed) < 1e-9,
    min: lo,
    max: hi,
    step,
  };
  const toValue = conv(value);
  const toLo = conv(lo);
  const toHi = conv(hi);
  const valueText = `${lbl(value)} ${fromSym} = ${lbl(toValue)} ${toSym}`;
  return (
    <div data-ph-scene-block data-unit-gauge={category} className="flex flex-1 flex-col gap-3">
      <div
        className="flex w-full flex-1 flex-col"
        data-testid="unit-hero-drawing"
        onPointerDownCapture={() => {
          frozen.current = [lo, hi];
          setDragging(true);
        }}
        onPointerUpCapture={() => setDragging(false)}
        onPointerCancelCapture={() => setDragging(false)}
      >
        <DualRingGauge
          s={s}
          frac={(value - lo) / (hi - lo)}
          fromFrac={(f) => lo + f * (hi - lo)}
          outer={{ ticks: ringTicks(lo, hi), color: "var(--cv-from)", tickColor: "var(--ph-ink)" }}
          inner={{ ticks: ringTicks(toLo, toHi), color: "var(--cv-to)", tickColor: "var(--ph-ink-muted)" }}
          center={[tCat(category), `${lbl(value)} ${fromSym}`, `${lbl(toValue)} ${toSym}`]}
          label={t("handle")}
          valueText={valueText}
          testId="unit-hero"
        />
      </div>
      <KitControls s={s} valueText={`${lbl(value)} ${fromSym}`} testId="unit-hero" />
    </div>
  );
}
