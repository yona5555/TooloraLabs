export type DebtToIncomeCategory = "healthy" | "manageable" | "high" | "veryHigh";

export type DebtToIncomeResult = {
  totalMonthlyDebt: number;
  frontEndRatio: number;
  backEndRatio: number;
  category: DebtToIncomeCategory;
};

/**
 * Computes both the front-end ratio (housing payment only) and the
 * back-end ratio (all monthly debt, commonly called the debt-to-income
 * or DTI ratio) as a percentage of gross monthly income, and buckets
 * the back-end ratio into a category using thresholds commonly cited
 * in mortgage underwriting: below 36% is generally considered healthy,
 * 36-43% is the range many conventional lenders still work with, 43-50%
 * exceeds the qualified-mortgage back-end threshold used by many
 * lenders, and 50%+ is widely treated as a high-risk debt load.
 */
export function calculateDebtToIncome(
  monthlyGrossIncome: number,
  housingPayment: number,
  carPayments: number,
  studentLoanPayments: number,
  creditCardPayments: number,
  otherPayments: number
): DebtToIncomeResult {
  if (
    !Number.isFinite(monthlyGrossIncome) ||
    monthlyGrossIncome <= 0 ||
    !Number.isFinite(housingPayment) ||
    housingPayment < 0 ||
    !Number.isFinite(carPayments) ||
    carPayments < 0 ||
    !Number.isFinite(studentLoanPayments) ||
    studentLoanPayments < 0 ||
    !Number.isFinite(creditCardPayments) ||
    creditCardPayments < 0 ||
    !Number.isFinite(otherPayments) ||
    otherPayments < 0
  ) {
    return { totalMonthlyDebt: 0, frontEndRatio: 0, backEndRatio: 0, category: "healthy" };
  }

  const totalMonthlyDebt = housingPayment + carPayments + studentLoanPayments + creditCardPayments + otherPayments;
  const frontEndRatio = (housingPayment / monthlyGrossIncome) * 100;
  const backEndRatio = (totalMonthlyDebt / monthlyGrossIncome) * 100;

  let category: DebtToIncomeCategory;
  if (backEndRatio < 36) {
    category = "healthy";
  } else if (backEndRatio < 43) {
    category = "manageable";
  } else if (backEndRatio < 50) {
    category = "high";
  } else {
    category = "veryHigh";
  }

  return { totalMonthlyDebt, frontEndRatio, backEndRatio, category };
}

export type MaxAllowedDebtResult = {
  maxTotalMonthlyDebt: number;
  maxAdditionalMonthlyDebt: number;
  currentOtherDebt: number;
};

/**
 * The reverse of `calculateDebtToIncome`'s back-end ratio: given a target
 * DTI ratio instead of computing one, finds the total monthly debt payment
 * that ratio allows against a given income — the same percentage-of-income
 * relationship solved for the debt side instead of the ratio side.
 */
export function calculateMaxAllowedDebt(
  monthlyGrossIncome: number,
  targetBackEndRatio: number,
  existingNonHousingDebt: number
): MaxAllowedDebtResult {
  if (
    !Number.isFinite(monthlyGrossIncome) ||
    monthlyGrossIncome <= 0 ||
    !Number.isFinite(targetBackEndRatio) ||
    targetBackEndRatio < 0 ||
    !Number.isFinite(existingNonHousingDebt) ||
    existingNonHousingDebt < 0
  ) {
    return { maxTotalMonthlyDebt: 0, maxAdditionalMonthlyDebt: 0, currentOtherDebt: existingNonHousingDebt };
  }

  const maxTotalMonthlyDebt = monthlyGrossIncome * (targetBackEndRatio / 100);
  const maxAdditionalMonthlyDebt = Math.max(maxTotalMonthlyDebt - existingNonHousingDebt, 0);

  return { maxTotalMonthlyDebt, maxAdditionalMonthlyDebt, currentOtherDebt: existingNonHousingDebt };
}
