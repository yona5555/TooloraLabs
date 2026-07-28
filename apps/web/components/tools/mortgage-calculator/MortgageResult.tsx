import type { MortgageResult as MortgageResultType } from "./types";
import MortgageSummary from "./MortgageSummary";
import PaymentBreakdown from "./PaymentBreakdown";

type Props = {
  result: MortgageResultType;
};

export default function MortgageResult({ result }: Props) {
  return (
    <div className="space-y-8">
      <MortgageSummary
        monthlyPayment={result.monthlyPayment}
        totalPayment={result.totalPayment}
        totalInterest={result.totalInterest}
      />

      <PaymentBreakdown
        principalAndInterest={result.monthlyPrincipalAndInterest}
        taxes={result.monthlyTaxes}
        insurance={result.monthlyInsurance}
        hoa={result.monthlyHOAFee}
        pmi={result.monthlyPMIFee}
      />

    </div>
  );
}
