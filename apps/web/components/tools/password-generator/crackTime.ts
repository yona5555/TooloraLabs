export type CrackTimeUnit = "instant" | "seconds" | "minutes" | "hours" | "days" | "years" | "thousandYears" | "millionYears" | "billionYears";

export type CrackTimeDisplay = { magnitude: number; unit: CrackTimeUnit };

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const YEAR = DAY * 365.25;

export function formatCrackTime(seconds: number): CrackTimeDisplay {
  if (seconds < 1) return { magnitude: 0, unit: "instant" };
  if (seconds < MINUTE) return { magnitude: seconds, unit: "seconds" };
  if (seconds < HOUR) return { magnitude: seconds / MINUTE, unit: "minutes" };
  if (seconds < DAY) return { magnitude: seconds / HOUR, unit: "hours" };
  if (seconds < YEAR) return { magnitude: seconds / DAY, unit: "days" };
  const years = seconds / YEAR;
  if (years < 1_000) return { magnitude: years, unit: "years" };
  if (years < 1_000_000) return { magnitude: years / 1_000, unit: "thousandYears" };
  if (years < 1_000_000_000) return { magnitude: years / 1_000_000, unit: "millionYears" };
  return { magnitude: years / 1_000_000_000, unit: "billionYears" };
}

export type StrengthTier = "veryWeak" | "weak" | "reasonable" | "strong" | "veryStrong";

export function getStrengthTier(entropyBits: number): StrengthTier {
  if (entropyBits < 28) return "veryWeak";
  if (entropyBits < 36) return "weak";
  if (entropyBits < 60) return "reasonable";
  if (entropyBits < 100) return "strong";
  return "veryStrong";
}

export const STRENGTH_TIER_ORDER: StrengthTier[] = ["veryWeak", "weak", "reasonable", "strong", "veryStrong"];
