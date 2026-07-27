import type { DiscountResult } from "./types";

type Props = {
  result: DiscountResult | null;
};

export default function Result({ result }: Props) {
  if (!result) return null;

  return (
    <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">
        Discount Result
      </h3>

      <div className="mt-6 space-y-3 text-lg">
        <div className="flex justify-between">
          <span>Original Price</span>
          <strong>{result.originalPrice}</strong>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <strong>{result.discountPercent}%</strong>
        </div>

        <div className="flex justify-between">
          <span>You Save</span>
          <strong>{result.saved}</strong>
        </div>

        <div className="flex justify-between">
          <span>Final Price</span>
          <strong className="text-2xl text-blue-600">
            {result.finalPrice}
          </strong>
        </div>
      </div>
    </div>
  );
}
