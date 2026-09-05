export type {
  DateCalculatorMode,
  DateUnit,
  DateOperation,
  DateCalculatorError,
  DateDifferenceResult,
  DateCalculatorOutput as DateResult,
} from "@tooloralabs/tools";

export const DATE_MODES = ["difference", "addSubtract"] as const;
export const DATE_UNITS = ["days", "weeks", "months", "years"] as const;
