export type PercentageMode =
  | "percent-of-number"
  | "what-percent"
  | "percentage-change";

export type PercentageResult = {
  value: number;
  text: string;
};
