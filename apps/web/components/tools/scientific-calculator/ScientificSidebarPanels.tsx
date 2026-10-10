"use client";
/**
 * Owns theta for the sidebar unit-circle card that fills the column under the History card
 * (Rule 41). Seeded ONCE from the calculator's own angle mode + display value (read-only, via
 * ScientificCalcReadonlyContext) -- after that, fully independent of the calculator.
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
  const [seed] = useState(() => seedTheta(calc.angleMode, calc.display) || 30);
  const [theta, setTheta] = useState(seed);
  return <ScientificUnitCircleCard theta={theta} setTheta={setTheta} seed={seed} />;
}
