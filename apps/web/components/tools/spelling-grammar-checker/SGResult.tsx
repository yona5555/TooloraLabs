import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { SpellingGrammarOutput, IssueType } from "./types";

type Props = {
  text: string;
  result: SpellingGrammarOutput;
};

const TYPE_STYLES: Record<IssueType, string> = {
  spelling: "bg-red-100 decoration-red-500 decoration-2 underline dark:bg-red-500/20",
  grammar: "bg-blue-100 decoration-blue-500 decoration-2 underline dark:bg-blue-500/20",
  capitalization: "bg-amber-100 decoration-amber-500 decoration-2 underline dark:bg-amber-500/20",
  punctuation: "bg-zinc-200 decoration-zinc-500 decoration-2 underline dark:bg-zinc-500/30",
};

function renderHighlighted(text: string, issues: SpellingGrammarOutput["issues"]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  issues.forEach((issue, i) => {
    if (issue.start < cursor) return;
    if (issue.start > cursor) nodes.push(text.slice(cursor, issue.start));
    nodes.push(
      <mark key={i} title={issue.message} className={`rounded-sm px-0.5 ${TYPE_STYLES[issue.type]}`}>
        {text.slice(issue.start, issue.end)}
      </mark>,
    );
    cursor = issue.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function SGResult({ text, result }: Props) {
  const t = useTranslations("tools.spelling-grammar-checker.result");

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        {!text.trim() ? (
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("emptyText")}</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("wordCountLabel")}</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{result.wordCount}</span>
            </div>
            <div className="mb-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t("issueCountLabel")}</span>
              <span
                className={`font-mono font-semibold ${
                  result.issues.length === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {result.issues.length}
              </span>
            </div>

            <div
              dir="auto"
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm leading-7 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100"
            >
              {result.issues.length > 0 ? renderHighlighted(text, result.issues) : text}
            </div>

            {result.issues.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
                {result.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${TYPE_STYLES[issue.type].split(" ")[0]}`} />
                    <span className="text-zinc-600 dark:text-zinc-300">
                      {issue.message}
                      {issue.suggestion && (
                        <>
                          {" "}
                          {t("suggestion")}{" "}
                          <span dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                            {issue.suggestion}
                          </span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
