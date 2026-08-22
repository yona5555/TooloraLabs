"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type DebtToIncomeInputPanelProps = {
  monthlyGrossIncome: string;
  onMonthlyGrossIncomeChange: (value: string) => void;
  housingPayment: string;
  onHousingPaymentChange: (value: string) => void;
  carPayments: string;
  onCarPaymentsChange: (value: string) => void;
  studentLoanPayments: string;
  onStudentLoanPaymentsChange: (value: string) => void;
  creditCardPayments: string;
  onCreditCardPaymentsChange: (value: string) => void;
  otherPayments: string;
  onOtherPaymentsChange: (value: string) => void;
};

export default function DebtToIncomeInputPanel({
  monthlyGrossIncome,
  onMonthlyGrossIncomeChange,
  housingPayment,
  onHousingPaymentChange,
  carPayments,
  onCarPaymentsChange,
  studentLoanPayments,
  onStudentLoanPaymentsChange,
  creditCardPayments,
  onCreditCardPaymentsChange,
  otherPayments,
  onOtherPaymentsChange,
}: DebtToIncomeInputPanelProps) {
  const t = useTranslations("tools.debt-to-income-calculator");

  return (
    <SectionCard title={t("aboveFold.inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("form.monthlyGrossIncomeLabel")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.monthlyGrossIncomePlaceholder")}
          value={monthlyGrossIncome}
          onChange={(e) => onMonthlyGrossIncomeChange(e.target.value)}
        />

        <ToolInput
          label={t("form.housingPaymentLabel")}
          hint={t("form.housingPaymentHint")}
          type="text"
          inputMode="decimal"
          placeholder={t("form.housingPaymentPlaceholder")}
          value={housingPayment}
          onChange={(e) => onHousingPaymentChange(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <ToolInput
            label={t("form.carPaymentsLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.carPaymentsPlaceholder")}
            value={carPayments}
            onChange={(e) => onCarPaymentsChange(e.target.value)}
          />
          <ToolInput
            label={t("form.studentLoanPaymentsLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.studentLoanPaymentsPlaceholder")}
            value={studentLoanPayments}
            onChange={(e) => onStudentLoanPaymentsChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ToolInput
            label={t("form.creditCardPaymentsLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.creditCardPaymentsPlaceholder")}
            value={creditCardPayments}
            onChange={(e) => onCreditCardPaymentsChange(e.target.value)}
          />
          <ToolInput
            label={t("form.otherPaymentsLabel")}
            hint={t("form.otherPaymentsHint")}
            type="text"
            inputMode="decimal"
            placeholder={t("form.otherPaymentsPlaceholder")}
            value={otherPayments}
            onChange={(e) => onOtherPaymentsChange(e.target.value)}
          />
        </div>
      </div>
    </SectionCard>
  );
}
