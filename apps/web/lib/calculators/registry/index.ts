import { CalculatorEngine } from "../engine";
import { bmiProfile } from "../profiles/bmi";
import { mortgageProfile } from "../profiles/mortgage";

export const calculators = {
  bmi: new CalculatorEngine(bmiProfile),
  mortgage: new CalculatorEngine(mortgageProfile),
} as const;

export type CalculatorKey = keyof typeof calculators;

export function getCalculator(key: CalculatorKey) {
  return calculators[key];
}
