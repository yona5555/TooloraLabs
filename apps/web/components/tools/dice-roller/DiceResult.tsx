import { useTranslations } from "next-intl";
import DiceFace from "./DiceFace";
import DiceShareExportModal from "./DiceShareExportModal";
import type { DiceRollerOutput, RollHistoryEntry } from "./types";
import HistoryTape from "@/components/tool-ui/HistoryTape";

type Props = {
  result: DiceRollerOutput;
  isRolling: boolean;
  history: RollHistoryEntry[];
  onClearHistory: () => void;
  onReuse: (entry: RollHistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
};

export default function DiceResult({ result, isRolling, history, onClearHistory, onReuse, onDeleteHistory }: Props) {
  const t = useTranslations("tools.dice-roller.result");
  const tRoot = useTranslations("tools.dice-roller");

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
      <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <DiceShareExportModal
          inputRows={[
            { label: tRoot("shareExport.diceCountLabel"), value: String(result.rolls.length) },
            { label: tRoot("shareExport.facesLabel"), value: `d${result.faces}` },
          ]}
          resultRows={result.rolls.map((value, i) => ({ label: `${tRoot("shareExport.rollLabel")} ${i + 1}`, value: String(value) }))}
          heroLabel={t("totalLabel")}
          heroValue={String(result.total)}
          sentence={tRoot("shareExport.sentence", { count: result.rolls.length, faces: result.faces, rolls: result.rolls.join(", "), total: result.total })}
        />
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

        <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("historyLabel")}</h3>
          <HistoryTape
            entries={history.map((e) => ({ id: e.id, label: `d${e.faces} × ${e.rolls.length}: ${e.rolls.join(", ")}`, value: e.total, valueText: String(e.total) }))}
            onSelect={(e) => {
              const entry = history.find((h) => h.id === e.id);
              if (entry) onReuse(entry);
            }}
            onDelete={onDeleteHistory}
            onClear={onClearHistory}
            formatTotal={(n) => String(n)}
            emptyText={t("historyEmpty")}
            maxHeightClass="max-h-48"
          />
        </div>
      </div>
    </div>
  );
}
