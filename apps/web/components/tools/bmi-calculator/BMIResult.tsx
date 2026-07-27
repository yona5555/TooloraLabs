import { BMIResult as BMIResultType } from "./types";

type Props = {
  result: BMIResultType;
};

export default function BMIResult({ result }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
      <h3 className="text-xl font-bold text-zinc-900">
        Your BMI Result
      </h3>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">BMI</p>
          <p className="mt-1 text-3xl font-bold">{result.bmi}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Category</p>
          <p className="mt-1 text-2xl font-semibold">{result.category}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-zinc-500">Healthy Weight Range</p>
          <p className="mt-1 text-lg font-semibold">
            {result.healthyMinWeight} kg – {result.healthyMaxWeight} kg
          </p>
        </div>
      </div>
    </div>
  );
}
