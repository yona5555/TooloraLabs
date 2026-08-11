import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type PercentageMode =
  | "percent-of-number"
  | "what-percent"
  | "percentage-change"
  | "reverse-percentage"
  | "percentage-difference";

export type PercentageInput = {
  mode: PercentageMode;
  first: number;
  second: number;
};

export type PercentageOutput = {
  value: number;
  text: string;
};

function round(value: number) {
  return Number(value.toFixed(2));
}

export class PercentageCalculator extends BaseCalculator<PercentageInput, PercentageOutput> {
  metadata = {
    id: "percentage-calculator",
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    category: "calculators",
    description: "Perform fast percentage calculations.",
    version: "1.0.0",
  };

  execute(
    input: PercentageInput,
    _context: ToolContext
  ): ToolResult<PercentageOutput> {
    const { mode, first, second } = input;
    let data: PercentageOutput;

    switch (mode) {
      case "percent-of-number": {
        const value = (first / 100) * second;
        data = { value: round(value), text: `${first}% of ${second} = ${round(value)}` };
        break;
      }
      case "what-percent": {
        if (second === 0) {
          data = { value: 0, text: "Division by zero is not allowed." };
        } else {
          const value = (first / second) * 100;
          data = { value: round(value), text: `${first} is ${round(value)}% of ${second}` };
        }
        break;
      }
      case "percentage-change": {
        if (first === 0) {
          data = { value: 0, text: "Original value cannot be zero." };
        } else {
          const value = ((second - first) / first) * 100;
          data = { value: round(value), text: `Percentage change = ${round(value)}%` };
        }
        break;
      }
      case "reverse-percentage": {
        if (first === 0) {
          data = { value: 0, text: "Percentage cannot be zero." };
        } else {
          const value = second / (first / 100);
          data = { value: round(value), text: `${second} is ${first}% of ${round(value)}` };
        }
        break;
      }
      case "percentage-difference": {
        if (first + second === 0) {
          data = { value: 0, text: "Both values cannot be zero." };
        } else {
          const value = (Math.abs(first - second) / ((first + second) / 2)) * 100;
          data = { value: round(value), text: `Percentage difference between ${first} and ${second} = ${round(value)}%` };
        }
        break;
      }
    }

    return { success: true, data, metadata: {} };
  }
}
