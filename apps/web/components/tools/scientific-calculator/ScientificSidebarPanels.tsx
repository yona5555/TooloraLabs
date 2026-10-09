"use client";
/**
 * Owns theta for the unit-circle card below the History card (Rule 41). Seeded ONCE from the
 * calculator's own angle mode + display value (read-only, via ScientificCalcReadonlyContext) --
 * after that, fully independent of the calculator. The common-angles table that used to live
 * here was removed (the owner found it useless, cramped, and clipped); the circle now fills
 * whatever height remains after the History card's own natural height (ScientificCalculator.tsx
 * measures the calculator card and gives this column that same total height via a CSS var).
 */
import { useState } from "react";
import { useScientificCalcReadonly } from "./ScientificCalcReadonlyContext";
import ScientificUnitCircleCard from "./ScientificUnitCircleCard";

function seedTheta(angleMode: "deg" | "rad", display: string): number {
  const parsed = Number.parseFloat(display);
  if (!Number.isFinite(parsed)) return 30;
  const deg = angleMode === "rad" ? (parsed * 180) / Math.PI : parsed;
  if (!Number.isFinite(deg)) return 30;
  return ((deg % 360) + 360) % 360;
}

export default function ScientificSidebarPanels() {
  const calc = useScientificCalcReadonly();
  const [seed] = useState(() => seedTheta(calc.angleMode, calc.display));
  const [theta, setTheta] = useState(seed);

  return (
    <div className="h-full">
      <ScientificUnitCircleCard theta={theta} setTheta={setTheta} seed={seed} />
    </div>
  );
}
