import type { PercentageMode, PercentageResult } from "./types";

function round(value: number) {
  return Number(value.toFixed(2));
}

export function calculatePercentage(
  mode: PercentageMode,
  first: number,
  second: number
): PercentageResult {
  switch (mode) {
    case "percent-of-number": {
      const value = (first / 100) * second;
      return {
        value: round(value),
        text: `${first}% of ${second} = ${round(value)}`,
      };
    }

    case "what-percent": {
      if (second === 0) {
        return {
          value: 0,
          text: "Division by zero is not allowed.",
        };
      }

      const value = (first / second) * 100;

      return {
        value: round(value),
        text: `${first} is ${round(value)}% of ${second}`,
      };
    }

    case "percentage-change": {
      if (first === 0) {
        return {
          value: 0,
          text: "Original value cannot be zero.",
        };
      }

      const value = ((second - first) / first) * 100;

      return {
        value: round(value),
        text: `Percentage change = ${round(value)}%`,
      };
    }
  }
}
