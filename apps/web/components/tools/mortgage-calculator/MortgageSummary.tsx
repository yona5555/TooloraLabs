import { useTranslations } from "next-intl";

type Props = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function Card({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

export default function MortgageSummary({
  monthlyPayment,
  totalPayment,
  totalInterest,
}: Props) {
  const t = useTranslations("tools.mortgage-calculator.summary");

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card
        title={t("monthlyPayment")}
        value={formatCurrency(monthlyPayment)}
        description={t("monthlyPaymentDesc")}
      />

      <Card
        title={t("totalPayment")}
        value={formatCurrency(totalPayment)}
        description={t("totalPaymentDesc")}
      />

      <Card
        title={t("totalInterest")}
        value={formatCurrency(totalInterest)}
        description={t("totalInterestDesc")}
      />
    </div>
  );
}
