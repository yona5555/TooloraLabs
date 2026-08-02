import { useTranslations } from "next-intl";
import { mapBMIToResultLevel } from "@/lib/calculators/mappers/bmi";

type Recommendation = {
  title: string;
  description: string;
};

export default function BMIRecommendations({ category }: { category: string }) {
  const t = useTranslations("tools.bmi-calculator");
  const level = mapBMIToResultLevel(category);
  const recommendations = t.raw(`levels.${level}.recommendations`) as Recommendation[];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <p className="text-zinc-600 dark:text-zinc-300">{t(`levels.${level}.description`)}</p>

      <h3 className="mt-5 font-semibold text-zinc-900 dark:text-zinc-50">{t("actionTitle")}</h3>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {recommendations.map((item) => (
          <li key={item.title}>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
