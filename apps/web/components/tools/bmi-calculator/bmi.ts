import { BMIResult } from "./types";

export function calculateBMI(
  heightCm: number,
  weightKg: number
): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category = "Obesity";

  if (bmi < 18.5) {
    category = "Underweight";
  } else if (bmi < 25) {
    category = "Normal weight";
  } else if (bmi < 30) {
    category = "Overweight";
  }

  return {
    bmi: Number(bmi.toFixed(1)),
    category,
    healthyMinWeight: Number((18.5 * heightM * heightM).toFixed(1)),
    healthyMaxWeight: Number((24.9 * heightM * heightM).toFixed(1)),
  };
}
