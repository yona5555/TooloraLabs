import { AgeResult as AgeResultType } from "./types";

type Props = {
  result: AgeResultType;
};

const calendarAge = [
  { key: "years", label: "Years" },
  { key: "months", label: "Months" },
  { key: "days", label: "Days" },
] as const;

const totalAge = [
  { key: "totalDays", label: "Total Days" },
  { key: "totalWeeks", label: "Total Weeks" },
  { key: "totalHours", label: "Total Hours" },
  { key: "totalMinutes", label: "Total Minutes" },
  { key: "totalSeconds", label: "Total Seconds" },
] as const;

function Card({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
      <p className="text-4xl font-bold text-blue-600">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-sm font-medium text-zinc-500">
        {label}
      </p>
    </div>
  );
}

export default function AgeResult({ result }: Props) {
  return (
    <div className="space-y-10">
      <div>
        <h3 className="mb-5 text-xl font-bold text-zinc-900">
          Calendar Age
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          {calendarAge.map((item) => (
            <Card
              key={item.key}
              value={result[item.key]}
              label={item.label}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xl font-bold text-zinc-900">
          Total Time
        </h3>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {totalAge.map((item) => (
            <Card
              key={item.key}
              value={result[item.key]}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
