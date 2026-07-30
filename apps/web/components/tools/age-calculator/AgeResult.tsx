import { useTranslations } from "next-intl";
import { formatLocalizedNumber } from "@tooloralabs/core";
import { AgeResult as AgeResultType } from "./types";

type Props = {
  result: AgeResultType;
};

const calendarAge = ["years", "months", "days"] as const;

const totalAge = [
  "totalDays",
  "totalWeeks",
  "totalHours",
  "totalMinutes",
  "totalSeconds",
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
        {formatLocalizedNumber(value, "western")}
      </p>

      <p className="mt-2 text-sm font-medium text-zinc-500">
        {label}
      </p>
    </div>
  );
}

export default function AgeResult({ result }: Props) {
  const t = useTranslations("tools.age-calculator.result");

  return (
    <div className="space-y-10">
      <div>
        <h3 className="mb-5 text-xl font-bold text-zinc-900">
          {t("calendarAge")}
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          {calendarAge.map((key) => (
            <Card key={key} value={result[key]} label={t(key)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xl font-bold text-zinc-900">
          {t("totalTime")}
        </h3>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {totalAge.map((key) => (
            <Card key={key} value={result[key]} label={t(key)} />
          ))}
        </div>
      </div>
    </div>
  );
}
