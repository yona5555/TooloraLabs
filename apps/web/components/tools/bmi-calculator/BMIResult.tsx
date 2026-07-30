import { useTranslations } from "next-intl";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";

interface BMIResultData {
  bmi: number;
  category: string;
}

interface BMIResultProps {
  result: BMIResultData;
}

type Recommendation = {
  title: string;
  description: string;
};

export default function BMIResult({ result }: BMIResultProps) {
  const t = useTranslations("tools.bmi-calculator");
  const level = mapBMIToResultLevel(result.category);
  const recommendations = t.raw(
    `levels.${level}.recommendations`
  ) as Recommendation[];

  return (
    <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      <div className="mt-4">
        <p className="text-4xl font-bold">{result.bmi.toFixed(1)}</p>
        <p className="mt-1 text-lg font-medium">{t(`levels.${level}.title`)}</p>
        <p className="mt-3 text-gray-600">
          {t(`levels.${level}.description`)}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">{t("actionTitle")}</h3>

        <ul className="mt-3 space-y-3">
          {recommendations.map((item) => (
            <li key={item.title}>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
