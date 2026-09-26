"use client";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { convertAmount } from "@/lib/currency";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";

type ExampleRow = { scenario: string; result: string };

/** Price/total-cost (in USD) behind each of the three fixed example rows, aligned by index. */
const ROW_AMOUNTS: { price: number; cost: number }[] = [
  { price: 1.5, cost: 60 },
  { price: 1.5, cost: 60 },
  { price: 3.5, cost: 35 },
];

type Props = {
  rows: ExampleRow[];
  columnScenario: string;
  columnResult: string;
};

/**
 * The three example rows are translated sentences with `{price}`/`{cost}` placeholders
 * (not ICU — `t.raw()` on the server hands them over unprocessed), substituted here so
 * the amounts can reflect the live currency selection instead of being baked in at
 * translation time.
 */
export default function FuelExamplesTable({ rows, columnScenario, columnResult }: Props) {
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";
  const digitStyle = live?.digitStyle ?? "western";
  const money = (usd: number) => formatLocalizedNumber(convertAmount(usd, "USD", currency), digitStyle, { style: "currency", currency, maximumFractionDigits: 2 });

  return (
    // No `dir="ltr"` here: both columns hold full translated sentences (not
    // a numeric-only column like ReferenceTableCard's), so forcing LTR
    // pinned the Scenario column on the left and Result on the right
    // regardless of page direction — the same column-order inversion fixed
    // in ReferenceTableCard.tsx. An HTML table's column order already
    // follows its inherited `dir` natively; each sentence's own embedded
    // currency amount is already correctly formatted by `money()` above.
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-current/30 text-start">
            <th className="px-3 py-2 text-start font-semibold">{columnScenario}</th>
            <th className="px-3 py-2 text-start font-semibold">{columnResult}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const amounts = ROW_AMOUNTS[i];
            const scenario = row.scenario.replace("{price}", money(amounts.price));
            const result = row.result.replace("{cost}", money(amounts.cost));
            return (
              <tr key={row.scenario} className="border-b border-current/10">
                <td className="px-3 py-2.5">{scenario}</td>
                <td className="px-3 py-2.5 font-semibold">{result}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
