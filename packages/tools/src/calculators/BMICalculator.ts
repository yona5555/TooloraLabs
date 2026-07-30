import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type BMIResult = {
  bmi: number;
  category: string;
  healthyMinWeight: number;
  healthyMaxWeight: number;
};

export type BMIInput = { heightCm: number; weightKg: number };

export class BMICalculator extends BaseCalculator<BMIInput, BMIResult> {
  metadata = {
    id: "bmi-calculator",
    slug: "bmi-calculator",
    name: "BMI Calculator",
    category: "calculators",
    description: "Calculate Body Mass Index and healthy weight range.",
    version: "1.0.0",
  };

  execute(input: BMIInput, _context: ToolContext): ToolResult<BMIResult> {
    const heightM = input.heightCm / 100;
    const bmi = input.weightKg / (heightM * heightM);

    let category = "Obesity";
    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi < 25) {
      category = "Normal weight";
    } else if (bmi < 30) {
      category = "Overweight";
    }

    return {
      success: true,
      data: {
        bmi: Number(bmi.toFixed(1)),
        category,
        healthyMinWeight: Number((18.5 * heightM * heightM).toFixed(1)),
        healthyMaxWeight: Number((24.9 * heightM * heightM).toFixed(1)),
      },
      metadata: {},
    };
  }
}
