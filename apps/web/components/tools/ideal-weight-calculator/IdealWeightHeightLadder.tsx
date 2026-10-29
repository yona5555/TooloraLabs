"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { f1 } from "@/components/tool-ui/indicator-kit/format";
import { useIdealWeightLive } from "./IdealWeightLiveContext";
import { H_MAX, H_MIN, WHO_HI, WHO_LO, cmText, ideal, weightAt } from "./iw";

/**
 * Input-column reference (§17/§27): the average ideal weight and the WHO healthy range for
 * heights around the current one (5 cm steps), as a tagged live table. Clicking a row sets the
 * height field. The current height is tagged; rows grow so the column ends flush with Result.
 */
export default function IdealWeightHeightLadder() {
  const t = useTranslations("tools.ideal-weight-calculator.visuals.ladder");
  const { gender, heightCm: h, setHeightCm } = useIdealWeightLive();
  const base = Math.round(h / 5) * 5;
  const rows = [-20, -15, -10, -5, 0, 5, 10, 15, 20].map((d) => (d === 0 ? h : Math.min(H_MAX, Math.max(H_MIN, base + d))));
  const uniq = rows.filter((v, i) => rows.indexOf(v) === i);

  return (
    <SectionCard title={t("title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="flex flex-col p-4 lg:flex-1 lg:p-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
      <div className="mt-3 grid grid-cols-[auto_1fr_auto] gap-x-3 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <span>{t("colHeight")}</span>
        <span className="text-end">{t("colAverage")}</span>
        <span className="w-24 text-end">{t("colWho")}</span>
      </div>
      <ul className="mt-1 flex flex-1 flex-col gap-1.5">
        {uniq.map((cm) => {
          const on = cm === h;
          return (
            <li key={cm} className="flex flex-1">
              <button
                type="button"
                onClick={() => setHeightCm(cm)}
                className={`grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-lg border px-3 py-2 text-start text-sm transition ${
                  on ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10" : "border-zinc-200 hover:border-blue-300 dark:border-zinc-700"
                }`}
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span dir="ltr" className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                    {cmText(cm)}
                  </span>
                  {on && <span className="shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">{t("you")}</span>}
                </span>
                <span dir="ltr" className="text-end font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {f1(ideal(gender, cm).average)}
                </span>
                <span dir="ltr" className="w-24 text-end tabular-nums text-zinc-700 dark:text-zinc-300">
                  {f1(weightAt(WHO_LO, cm))}–{f1(weightAt(WHO_HI, cm))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        {t("note", { kg: f1(ideal(gender, h + 1).average - ideal(gender, h).average) })}
      </p>
    </SectionCard>
  );
}
