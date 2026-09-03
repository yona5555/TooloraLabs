import { useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { NotepadResult as Result } from "./types";

type Props = {
  result: Result;
};

export default function NotepadResult({ result }: Props) {
  const t = useTranslations("tools.notepad-calculator.result");

  const copyText = result.lines.map((line) => (line.result !== null ? `${line.text}  =  ${line.result}` : line.text)).join("\n");

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <CopyButton text={copyText} className="!text-white dark:!text-white" />
      </div>
      <div className="p-4 lg:p-6">
        {result.lines.every((line) => line.result === null) ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("noCalculations")}</p>
        ) : (
          <ol className="divide-y divide-zinc-100 font-mono text-sm dark:divide-zinc-800">
            {result.lines.map((line, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-1.5">
                <span dir="auto" className="truncate text-zinc-700 dark:text-zinc-200">
                  {line.text || " "}
                </span>
                {line.result !== null && (
                  <span dir="ltr" className="shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                    {line.result}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
