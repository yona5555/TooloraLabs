export type HouseAffordabilityResult = {
  maxHomePrice: number;
  loanAmount: number;
  monthlyPayment: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
};

/**
 * Estimates the maximum home price a buyer can afford using the standard
 * 28/36 rule: total monthly housing costs (principal, interest, property
 * tax, insurance, and HOA dues) capped at 28% of gross monthly income,
 * and total monthly debt (housing plus existing debts) capped at 36% of
 * gross monthly income. The lower of the two limits sets the housing
 * budget, which is then solved backward — accounting for the fact that
 * property tax itself scales with the home price — into a maximum price.
 */
export function calculateHouseAffordability(
  annualIncome: number,
  monthlyDebts: number,
  downPayment: number,
  interestRate: number,
  loanTermYears: number,
  propertyTaxRate: number,
  annualHomeInsurance: number,
  monthlyHOA: number
): HouseAffordabilityResult {
  if (
    !Number.isFinite(annualIncome) ||
    annualIncome <= 0 ||
    !Number.isFinite(monthlyDebts) ||
    monthlyDebts < 0 ||
    !Number.isFinite(downPayment) ||
    downPayment < 0 ||
    !Number.isFinite(interestRate) ||
    interestRate < 0 ||
    !Number.isFinite(loanTermYears) ||
    loanTermYears <= 0 ||
    !Number.isFinite(propertyTaxRate) ||
    propertyTaxRate < 0 ||
    !Number.isFinite(annualHomeInsurance) ||
    annualHomeInsurance < 0 ||
    !Number.isFinite(monthlyHOA) ||
    monthlyHOA < 0
  ) {
    return {
      maxHomePrice: 0,
      loanAmount: 0,
      monthlyPayment: 0,
      monthlyPrincipalAndInterest: 0,
      monthlyPropertyTax: 0,
      monthlyInsurance: 0,
    };
  }

  const monthlyIncome = annualIncome / 12;
  const frontEndLimit = monthlyIncome * 0.28;
  const backEndLimit = monthlyIncome * 0.36 - monthlyDebts;
  const maxHousingPayment = Math.min(frontEndLimit, backEndLimit);

  const monthlyInsurance = annualHomeInsurance / 12;
  const remainingForPrincipalAndTax = maxHousingPayment - monthlyInsurance - monthlyHOA;

  if (remainingForPrincipalAndTax <= 0) {
    return {
      maxHomePrice: 0,
      loanAmount: 0,
      monthlyPayment: 0,
      monthlyPrincipalAndInterest: 0,
      monthlyPropertyTax: 0,
      monthlyInsurance: 0,
    };
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = Math.round(loanTermYears * 12);
  const paymentFactor =
    monthlyRate === 0 ? 1 / numberOfPayments : monthlyRate / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

  const monthlyTaxRate = propertyTaxRate / 100 / 12;

  const maxHomePrice = (remainingForPrincipalAndTax + downPayment * paymentFactor) / (paymentFactor + monthlyTaxRate);
  const loanAmount = maxHomePrice - downPayment;
  const monthlyPrincipalAndInterest = loanAmount * paymentFactor;
  const monthlyPropertyTax = maxHomePrice * monthlyTaxRate;
  const monthlyPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyHOA;

  return {
    maxHomePrice,
    loanAmount,
    monthlyPayment,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
  };
}

export type RequiredIncomeResult = {
  requiredAnnualIncome: number;
  loanAmount: number;
  monthlyPayment: number;
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  /** Which of the two 28/36 constraints ends up binding at the required income — the housing-only front-end ratio, or the all-debt back-end ratio. */
  bindingConstraint: "frontEnd" | "backEnd";
};

/**
 * The reverse of `calculateHouseAffordability`: given a target home price
 * instead of an income, finds the minimum gross annual income that price
 * requires under the same 28/36 rule. Because the actual affordability
 * limit is the *lower* of the front-end and back-end ratios, the required
 * income must be high enough to satisfy *both* individually — so this
 * solves each ratio's own required income separately and takes the larger
 * of the two, which is exactly the income at which the binding constraint
 * (whichever one it turns out to be) reaches the target housing payment.
 */
export function calculateRequiredIncome(
  targetHomePrice: number,
  monthlyDebts: number,
  downPayment: number,
  interestRate: number,
  loanTermYears: number,
  propertyTaxRate: number,
  annualHomeInsurance: number,
  monthlyHOA: number
): RequiredIncomeResult {
  if (
    !Number.isFinite(targetHomePrice) ||
    targetHomePrice <= 0 ||
    !Number.isFinite(monthlyDebts) ||
    monthlyDebts < 0 ||
    !Number.isFinite(downPayment) ||
    downPayment < 0 ||
    downPayment >= targetHomePrice ||
    !Number.isFinite(interestRate) ||
    interestRate < 0 ||
    !Number.isFinite(loanTermYears) ||
    loanTermYears <= 0 ||
    !Number.isFinite(propertyTaxRate) ||
    propertyTaxRate < 0 ||
    !Number.isFinite(annualHomeInsurance) ||
    annualHomeInsurance < 0 ||
    !Number.isFinite(monthlyHOA) ||
    monthlyHOA < 0
  ) {
    return {
      requiredAnnualIncome: 0,
      loanAmount: 0,
      monthlyPayment: 0,
      monthlyPrincipalAndInterest: 0,
      monthlyPropertyTax: 0,
      monthlyInsurance: 0,
      bindingConstraint: "frontEnd",
    };
  }

  const loanAmount = targetHomePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = Math.round(loanTermYears * 12);
  const paymentFactor = monthlyRate === 0 ? 1 / numberOfPayments : monthlyRate / (1 - Math.pow(1 + monthlyRate, -numberOfPayments));

  const monthlyPrincipalAndInterest = loanAmount * paymentFactor;
  const monthlyTaxRate = propertyTaxRate / 100 / 12;
  const monthlyPropertyTax = targetHomePrice * monthlyTaxRate;
  const monthlyInsurance = annualHomeInsurance / 12;
  const requiredHousingPayment = monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyHOA;

  const monthlyIncomeForFrontEnd = requiredHousingPayment / 0.28;
  const monthlyIncomeForBackEnd = (requiredHousingPayment + monthlyDebts) / 0.36;
  const requiredMonthlyIncome = Math.max(monthlyIncomeForFrontEnd, monthlyIncomeForBackEnd);

  return {
    requiredAnnualIncome: requiredMonthlyIncome * 12,
    loanAmount,
    monthlyPayment: requiredHousingPayment,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    bindingConstraint: monthlyIncomeForFrontEnd >= monthlyIncomeForBackEnd ? "frontEnd" : "backEnd",
  };
}
