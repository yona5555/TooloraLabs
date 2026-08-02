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
