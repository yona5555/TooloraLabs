export type BMIResult = {
  bmi: number;
  category: string;
  healthyMinWeight: number;
  healthyMaxWeight: number;
};

export type UnitSystem = "metric" | "us";

export type BMIExtendedResult = BMIResult & {
  weightKg: number;
  heightCm: number;
  ponderalIndex: number;
  bodyFatEstimate: number;
};

export type BMIScenario = { key: string; heightCm: number; weightKg: number; age: number; gender: "male" | "female" };

/** One real example per BMI category, at a fixed 170cm height, so the category difference comes purely from weight. */
export const BMI_SCENARIOS: BMIScenario[] = [
  { key: "underweightExample", heightCm: 170, weightKg: 50, age: 28, gender: "female" },
  { key: "healthyExample", heightCm: 170, weightKg: 65, age: 30, gender: "male" },
  { key: "overweightExample", heightCm: 170, weightKg: 80, age: 42, gender: "male" },
  { key: "obeseExample", heightCm: 170, weightKg: 95, age: 50, gender: "male" },
];
