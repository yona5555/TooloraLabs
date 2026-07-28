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
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card
        title="Monthly Payment"
        value={formatCurrency(monthlyPayment)}
        description="Including taxes, insurance, HOA and PMI."
      />

      <Card
        title="Total Payment"
        value={formatCurrency(totalPayment)}
        description="Principal and interest paid over the loan term."
      />

      <Card
        title="Total Interest"
        value={formatCurrency(totalInterest)}
        description="Total borrowing cost."
      />
    </div>
  );
}
