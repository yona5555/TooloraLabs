import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { AgeExtendedResult } from "./types";

type Props = {
  result: AgeExtendedResult;
  digitStyle: DigitStyle;
};

const MILESTONE_KEYS: Record<number, string> = {
  18: "age18",
  21: "age21",
  30: "age30",
  40: "age40",
  50: "age50",
  65: "age65",
  100: "age100",
};

export default function AgeMilestones({ result, digitStyle }: Props) {
  const t = useTranslations("tools.age-calculator");
  const fmt = (n: number) => formatLocalizedNumber(n, digitStyle, { maximumFractionDigits: 0 });

  const upcoming = result.milestones.filter((m) => !m.isPast).slice(0, 3);
  const generationLabel = t(`aboveFold.generationNames.${result.generation}`);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <p className="text-zinc-600 dark:text-zinc-300">{t("milestones.intro", { generation: generationLabel })}</p>

      <h3 className="mt-5 font-semibold text-zinc-900 dark:text-zinc-50">{t("milestones.title")}</h3>
      {upcoming.length > 0 ? (
        <ul className="mt-3 grid gap-4 sm:grid-cols-3">
          {upcoming.map((milestone) => (
            <li key={milestone.ageYears} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {t(`milestones.items.${MILESTONE_KEYS[milestone.ageYears]}`)}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {t("milestones.daysAway", { days: fmt(milestone.daysRemaining) })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t("milestones.allPast")}</p>
      )}
    </div>
  );
}
