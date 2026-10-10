/**
 * Pure digit-by-digit classification behind the significant-figures live 3D
 * "digit tower": which written digits are significant, which zeros are only
 * placeholders, and which digits a rounding rule drops. Works on the written
 * string (sig figs are a property of how a number is written). No DOM;
 * unit-tested in __tests__/SignificantFiguresDigits.test.ts.
 */

export type DigitRole = "significant" | "leading-zero" | "trailing-zero";

export type ClassifiedDigit = {
  digit: string;
  role: DigitRole;
  /** Power of ten of this digit's place (units = 0, tenths = -1, tens = 1). */
  place: number;
};

export type TowerDigit = ClassifiedDigit & { kept: boolean };

export type DigitTower = {
  digits: TowerDigit[];
  sign: "" | "-";
  /** Index in `digits` after which the decimal point sits, or null when none is written. */
  pointAfter: number | null;
  /** First dropped significant digit (decides round up / down), or null when nothing significant is dropped. */
  decidingDigit: number | null;
  roundsUp: boolean;
  keptCount: number;
  droppedCount: number;
  significantCount: number;
};

/** Splits "-0.00500" into sign, digit characters and the point position. Returns null for non-numeric text. */
function splitWritten(raw: string): { sign: "" | "-"; digits: string[]; pointAfter: number | null } | null {
  const s = raw.trim();
  const m = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(s);
  if (!m) return null;
  const intPart = m[2] ?? "";
  const fracPart = m[3];
  if (intPart === "" && (fracPart === undefined || fracPart === "")) return null;
  const digits = [...intPart, ...(fracPart ?? "")];
  return { sign: m[1] === "-" ? "-" : "", digits, pointAfter: fracPart === undefined ? null : intPart.length - 1 };
}

/**
 * Role of every written digit, using the same rules as countSignificantFigures:
 * leading zeros never count; trailing zeros count only when a decimal point is
 * written; an all-zero decimal like "0.00" counts its zeros after the point.
 */
export function classifyDigits(raw: string): ClassifiedDigit[] {
  const parts = splitWritten(raw);
  if (!parts) return [];
  const { digits, pointAfter } = parts;
  const intLen = pointAfter === null ? digits.length : pointAfter + 1;
  const hasPoint = pointAfter !== null;
  const first = digits.findIndex((d) => d !== "0");
  let lastSig = digits.length - 1;
  if (!hasPoint) {
    let j = digits.length - 1;
    while (j > first && digits[j] === "0") j--;
    lastSig = j;
  }
  return digits.map((digit, i) => {
    const place = intLen - 1 - i;
    let role: DigitRole;
    if (first === -1) {
      // All zeros: "0.00" → zeros after the point are significant; "0" or "000" → placeholders only.
      role = hasPoint && i >= intLen ? "significant" : "leading-zero";
    } else if (i < first) role = "leading-zero";
    else if (i > lastSig) role = "trailing-zero";
    else role = "significant";
    return { digit, role, place };
  });
}

export type RoundingRule = { sigFigs: number } | { decimalPlaces: number } | null;

/**
 * The tower: classified digits plus which of them survive the rounding rule.
 * `{ sigFigs }` keeps the first N significant digits; `{ decimalPlaces }` keeps
 * digits at place ≥ −N; `null` keeps everything (counting only).
 */
export function buildDigitTower(raw: string, rule: RoundingRule): DigitTower {
  const parts = splitWritten(raw);
  const classified = classifyDigits(raw);
  const significantCount = classified.filter((d) => d.role === "significant").length;
  let sigSeen = 0;
  const digits: TowerDigit[] = classified.map((d) => {
    let kept = true;
    if (rule && "sigFigs" in rule) {
      if (d.role === "significant") {
        sigSeen += 1;
        kept = sigSeen <= rule.sigFigs;
      } else if (d.role === "trailing-zero") kept = sigSeen < rule.sigFigs;
    } else if (rule && "decimalPlaces" in rule) {
      kept = d.place >= -rule.decimalPlaces;
    }
    return { ...d, kept };
  });
  const decidingIdx = digits.findIndex((d) => !d.kept && d.role !== "leading-zero");
  const decidingDigit = decidingIdx === -1 ? null : Number(digits[decidingIdx].digit);
  return {
    digits,
    sign: parts?.sign ?? "",
    pointAfter: parts?.pointAfter ?? null,
    decidingDigit,
    roundsUp: decidingDigit !== null && decidingDigit >= 5,
    keptCount: digits.filter((d) => d.kept).length,
    droppedCount: digits.filter((d) => !d.kept).length,
    significantCount,
  };
}

/** A plain (never exponential) decimal string for a computed value, trimmed to 12 significant digits. */
export function plainDecimalString(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value === 0) return "0";
  const precise = Number(value.toPrecision(12));
  const s = String(precise);
  if (!/e/i.test(s)) return s;
  const exp = Math.floor(Math.log10(Math.abs(precise)));
  if (exp < 0) return precise.toFixed(Math.min(100, -exp + 11)).replace(/0+$/, "").replace(/\.$/, "");
  return BigInt(Math.round(precise)).toString();
}
