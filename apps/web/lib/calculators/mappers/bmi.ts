export type BMIResultLevel = "warning" | "normal" | "high" | "critical";

export function mapBMIToResultLevel(category: string): BMIResultLevel {
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
