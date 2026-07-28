import type { ResultLevel } from "../types";

export function mapBMIToResultLevel(category: string): ResultLevel {
  switch (category) {
    case "Underweight":
      return "warning";

    case "Normal weight":
      return "normal";

    case "Overweight":
      return "high";

    case "Obesity":
      return "critical";

    default:
      return "normal";
  }
}
