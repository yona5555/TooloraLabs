"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { calculateDebtToIncome } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DebtToIncomeInputPanel from "./DebtToIncomeInputPanel";
import DebtToIncomeResult from "./DebtToIncomeResult";

const DEFAULTS = {
  monthlyGrossIncome: "6000",
  housingPayment: "1500",
  carPayments: "300",
  studentLoanPayments: "200",
  creditCardPayments: "100",
  otherPayments: "0",
};

export default function DebtToIncomeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.debt-to-income-calculator.nav");

  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState(DEFAULTS.monthlyGrossIncome);
  const [housingPayment, setHousingPayment] = useState(DEFAULTS.housingPayment);
  const [carPayments, setCarPayments] = useState(DEFAULTS.carPayments);
  const [studentLoanPayments, setStudentLoanPayments] = useState(DEFAULTS.studentLoanPayments);
  const [creditCardPayments, setCreditCardPayments] = useState(DEFAULTS.creditCardPayments);
  const [otherPayments, setOtherPayments] = useState(DEFAULTS.otherPayments);

  const digitStyle: DigitStyle = resolveDigitStyle(
    monthlyGrossIncome,
    housingPayment,
    carPayments,
    studentLoanPayments,
    creditCardPayments,
    otherPayments
  );

  const parsedMonthlyGrossIncome = parseLocalizedNumber(monthlyGrossIncome) || 0;
  const parsedHousingPayment = parseLocalizedNumber(housingPayment) || 0;
  const parsedCarPayments = parseLocalizedNumber(carPayments) || 0;
  const parsedStudentLoanPayments = parseLocalizedNumber(studentLoanPayments) || 0;
  const parsedCreditCardPayments = parseLocalizedNumber(creditCardPayments) || 0;
  const parsedOtherPayments = parseLocalizedNumber(otherPayments) || 0;

  const result = useMemo(
    () =>
      calculateDebtToIncome(
        parsedMonthlyGrossIncome,
        parsedHousingPayment,
        parsedCarPayments,
        parsedStudentLoanPayments,
        parsedCreditCardPayments,
        parsedOtherPayments
      ),
    [
      parsedMonthlyGrossIncome,
      parsedHousingPayment,
      parsedCarPayments,
      parsedStudentLoanPayments,
      parsedCreditCardPayments,
      parsedOtherPayments,
    ]
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <DebtToIncomeInputPanel
              monthlyGrossIncome={monthlyGrossIncome}
              onMonthlyGrossIncomeChange={setMonthlyGrossIncome}
              housingPayment={housingPayment}
              onHousingPaymentChange={setHousingPayment}
              carPayments={carPayments}
              onCarPaymentsChange={setCarPayments}
              studentLoanPayments={studentLoanPayments}
              onStudentLoanPaymentsChange={setStudentLoanPayments}
              creditCardPayments={creditCardPayments}
              onCreditCardPaymentsChange={setCreditCardPayments}
              otherPayments={otherPayments}
              onOtherPaymentsChange={setOtherPayments}
            />
          }
          result={
            <DebtToIncomeResult
              result={parsedMonthlyGrossIncome > 0 ? result : null}
              monthlyGrossIncome={parsedMonthlyGrossIncome}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="debt-to-income-calculator" category="calculators" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
