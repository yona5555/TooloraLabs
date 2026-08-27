export type { PhOperation, PhCalculatorOutput as PhResult, PhClassification } from "@tooloralabs/tools";

export const COMMON_SUBSTANCES: { key: string; pH: number }[] = [
  { key: "batteryAcid", pH: 0.5 },
  { key: "lemonJuice", pH: 2.2 },
  { key: "vinegar", pH: 2.9 },
  { key: "orangeJuice", pH: 3.5 },
  { key: "blackCoffee", pH: 5.0 },
  { key: "pureWater", pH: 7.0 },
  { key: "seawater", pH: 8.2 },
  { key: "bakingSoda", pH: 9.0 },
  { key: "ammonia", pH: 11.5 },
  { key: "bleach", pH: 12.6 },
];
