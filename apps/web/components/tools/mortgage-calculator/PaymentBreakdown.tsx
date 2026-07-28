type Props = {
  principalAndInterest: number;
  taxes: number;
  insurance: number;
  hoa: number;
  pmi: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function Item({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}

export default function PaymentBreakdown({
  principalAndInterest,
  taxes,
  insurance,
  hoa,
  pmi,
}: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Payment Breakdown</h2>

      <div className="grid gap-3">
        <Item
          label="Principal & Interest"
          value={principalAndInterest}
        />

        <Item
          label="Property Tax"
          value={taxes}
        />

        <Item
          label="Home Insurance"
          value={insurance}
        />

        <Item
          label="HOA"
          value={hoa}
        />

        <Item
          label="PMI"
          value={pmi}
        />
      </div>
    </section>
  );
}
