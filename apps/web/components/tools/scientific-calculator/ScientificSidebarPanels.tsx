"use client";
/**
 * Owns the shared state (theta, which common-angle row is hovered) for the two sidebar panels
 * that fill the void under the History card (Rule 41): the unit-circle card and the common-angles
 * table card. Seeded ONCE from the calculator's own angle mode + display value (read-only, via
 * ScientificCalcReadonlyContext) -- after that, fully independent of the calculator.
 */
import { useState } from "react";
import { useScientificCalcReadonly } from "./ScientificCalcReadonlyContext";
import ScientificUnitCircleCard from "./ScientificUnitCircleCard";
import ScientificCommonAnglesCard from "./ScientificCommonAnglesCard";

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
  const [hoverAngle, setHoverAngle] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <ScientificUnitCircleCard theta={theta} setTheta={setTheta} seed={seed} hoverAngle={hoverAngle} setHoverAngle={setHoverAngle} />
      <ScientificCommonAnglesCard theta={theta} hoverAngle={hoverAngle} setHoverAngle={setHoverAngle} />
    </div>
  );
}
