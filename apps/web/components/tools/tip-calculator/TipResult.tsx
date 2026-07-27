import type { TipResult as Result } from "./types";

type Props = {
  result: Result | null;
};

export default function TipResult({ result }: Props) {
  if (!result) return null;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <div className="flex justify-between py-2">
        <span>Bill Amount</span>
        <strong>{result.billAmount.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>Tip</span>
        <strong>{result.tipPercent.toFixed(2)}%</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>People</span>
        <strong>{result.people}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>Tip Amount</span>
        <strong>{result.tipAmount.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>Total Amount</span>
        <strong>{result.totalAmount.toFixed(2)}</strong>
      </div>

      <div className="flex justify-between py-2">
        <span>Tip / Person</span>
        <strong>{result.tipPerPerson.toFixed(2)}</strong>
      </div>

      <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
        <span>Total / Person</span>
        <span>{result.totalPerPerson.toFixed(2)}</span>
      </div>
    </div>
  );
}
