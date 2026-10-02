"use client";
import { useTranslations } from "next-intl";
import { roundToSigFigs } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

const LEVELS = [1, 2, 3, 4, 5];

/** Type #17 (Tagged Reference Table): the live A's own value, rounded to every precision level from 1 to 5 significant figures at once — the same real rounding the hero's own drag performs for one level at a time. */
export default function RoundingRulesTable() {
  const t = useTranslations("tools.significant-figures-calculator.education.roundingRules");
  const { dims } = useSignificantFiguresLive();
  const numericA = Number(dims.rawValueA);
  if (dims.rawValueA.trim() === "" || !Number.isFinite(numericA)) return null;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-start dark:border-zinc-700">
              <th className="px-3 py-2 text-start font-semibold">{t("columnDigits")}</th>
              <th className="px-3 py-2 text-start font-semibold">{t("columnResult")}</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((n) => {
              const isCurrent = n === dims.roundToDigits;
              return (
                <tr key={n} className={`border-b border-zinc-100 dark:border-zinc-800 ${isCurrent ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                  <td className={`px-3 py-2 font-mono ${isCurrent ? "font-bold text-blue-700 dark:text-blue-300" : ""}`}>{n}</td>
                  <td className="px-3 py-2 font-mono">{roundToSigFigs(numericA, n)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <WorkedExampleNote title={t("worked.title")} rows={[{ label: t("worked.currentLevel"), value: `${dims.roundToDigits}`, emphasize: true, note: `${roundToSigFigs(numericA, dims.roundToDigits)}` }]} />
      </div>
    </SectionCard>
  );
}
