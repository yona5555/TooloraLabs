import { useTranslations } from "next-intl";
import DiceFace from "./DiceFace";
import type { DiceRollerOutput, RollHistoryEntry } from "./types";

type Props = {
  result: DiceRollerOutput;
  isRolling: boolean;
  history: RollHistoryEntry[];
  onClearHistory: () => void;
};

export default function DiceResult({ result, isRolling, history, onClearHistory }: Props) {
  const t = useTranslations("tools.dice-roller.result");

  if (result.error) {
    const messageKey = result.error === "invalid-dice-count" ? "invalidDiceCount" : "invalidFaces";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        <div dir="ltr" className="flex flex-wrap justify-center gap-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
          {result.rolls.map((value, i) => (
            <DiceFace key={i} value={value} faces={result.faces} isRolling={isRolling} />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          <span className="text-zinc-500 dark:text-zinc-400">{t("totalLabel")}</span>
          <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{result.total}</span>
        </div>

        {history.length > 0 && (
          <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("historyLabel")}</h3>
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {t("clearHistory")}
              </button>
            </div>
            <ul dir="ltr" className="max-h-40 space-y-1.5 overflow-y-auto text-sm">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/60"
                >
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    d{entry.faces} × {entry.rolls.length}: {entry.rolls.join(", ")}
                  </span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{entry.total}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
