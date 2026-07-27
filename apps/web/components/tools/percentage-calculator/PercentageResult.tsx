import type { PercentageResult as Result } from "./types";

type Props = {
  result: Result | null;
};

export default function PercentageResult({ result }: Props) {
  if (!result) return null;

  return (
    <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">
        Result
      </h3>

      <div className="mt-4 text-4xl font-bold text-blue-600">
        {result.value}
      </div>

      <p className="mt-3 text-zinc-600">
        {result.text}
      </p>
    </div>
  );
}
