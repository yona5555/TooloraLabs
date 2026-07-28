import type { AmortizationRow } from "./types";

type Props = {
  schedule: AmortizationRow[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AmortizationTable({ schedule }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        Amortization Schedule
      </h2>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-right">Payment</th>
              <th className="px-4 py-3 text-right">Principal</th>
              <th className="px-4 py-3 text-right">Interest</th>
              <th className="px-4 py-3 text-right">Balance</th>
            </tr>
          </thead>

          <tbody>
            {schedule.slice(0, 12).map((row) => (
              <tr
                key={row.paymentNumber}
                className="border-t border-zinc-200"
              >
                <td className="px-4 py-3">
                  {row.paymentNumber}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(row.payment)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(row.principal)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(row.interest)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
