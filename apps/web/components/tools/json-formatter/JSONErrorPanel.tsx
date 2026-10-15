"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Wand2 } from "lucide-react";
import { autoFixJSON } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";

type ErrorKind = "trailingComma" | "singleQuotes" | "unquotedKey" | "comment" | "generic";

/** Walks `text` the same way the scanner does (line/column, not byte offset) to find the error's character index. */
function findPosition(text: string, line: number, column: number): number {
  let l = 1;
  let c = 1;
  for (let i = 0; i < text.length; i++) {
    if (l === line && c === column) return i;
    if (text[i] === "\n") {
      l++;
      c = 1;
    } else {
      c++;
    }
  }
  return text.length;
}

function classifyError(message: string, text: string, position: number): ErrorKind {
  if (/^Trailing comma/.test(message)) return "trailingComma";
  if (/double quotes.*single quotes/i.test(message)) return "singleQuotes";
  const ch = text[position];
  if (ch === "/" && (text[position + 1] === "/" || text[position + 1] === "*")) return "comment";
  if (message === "Expected a double-quoted key" && ch !== undefined && /[A-Za-z_$]/.test(ch)) return "unquotedKey";
  return "generic";
}

/**
 * Item 4 of the final JSON-formatter fix: when the JSON is invalid, the Result column no longer
 * just loses ~425px to a bare one-line message. This panel fills that same space with the exact
 * code around the error (caret at the exact line/column), a plain-language explanation, a
 * suggested fix, and an Auto-fix button for the four common mistakes `autoFixJSON` repairs.
 */
export default function JSONErrorPanel({
  json,
  errorMessage,
  errorLine,
  errorColumn,
  onApplyFix,
}: {
  json: string;
  errorMessage: string;
  errorLine: number;
  errorColumn: number;
  onApplyFix: (fixedJson: string) => void;
}) {
  const t = useTranslations("tools.json-formatter.aboveFold");
  const [applying, setApplying] = useState(false);

  const position = useMemo(() => findPosition(json, errorLine, errorColumn), [json, errorLine, errorColumn]);
  const kind = useMemo(() => classifyError(errorMessage, json, position), [errorMessage, json, position]);

  const autoFix = useMemo(() => autoFixJSON(json), [json]);
  const autoFixValid = useMemo(() => {
    if (!autoFix.changed) return false;
    try {
      JSON.parse(autoFix.fixed);
      return true;
    } catch {
      return false;
    }
  }, [autoFix]);

  const lines = json.split("\n");
  const startLine = Math.max(1, errorLine - 2);
  const endLine = Math.min(lines.length, errorLine + 1);
  const contextLines: { n: number; text: string }[] = [];
  for (let n = startLine; n <= endLine; n++) contextLines.push({ n, text: lines[n - 1] ?? "" });
  const gutterWidth = String(endLine).length;

  function handleAutoFix() {
    setApplying(true);
    onApplyFix(autoFix.fixed);
    setTimeout(() => setApplying(false), 400);
  }

  return (
    <div
      className="flex min-h-[36rem] flex-1 flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
      data-testid="json-error-panel"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p className="font-semibold" dir="auto">
          {t("errorAt", { line: ltr(String(errorLine)), column: ltr(String(errorColumn)) })}
        </p>
      </div>

      <div dir="ltr" className="json-scroll overflow-auto rounded-lg border border-red-200/70 bg-white px-3 py-2 font-mono text-xs leading-5 dark:border-red-500/20 dark:bg-zinc-900">
        {contextLines.map((row) => (
          <div key={row.n}>
            <div className="whitespace-pre" style={{ color: row.n === errorLine ? "var(--glass-danger-strong)" : "var(--ph-ink-muted)" }}>
              <span className="inline-block select-none text-end" style={{ width: `${gutterWidth + 1}ch`, color: "var(--ph-ink-muted)", opacity: 0.7 }}>
                {row.n}{" "}
              </span>
              {row.text.length === 0 ? " " : row.text}
            </div>
            {row.n === errorLine && (
              <div className="whitespace-pre" style={{ color: "var(--glass-danger-strong)" }}>
                <span className="inline-block select-none" style={{ width: `${gutterWidth + 1}ch` }} />
                {/* A hidden copy of the text up to the column, not repeated spaces: exact pixel
                    alignment regardless of font metrics, kerning, or non-ASCII characters. */}
                <span style={{ visibility: "hidden" }}>{row.text.slice(0, Math.max(0, errorColumn - 1))}</span>
                <span>^</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div dir="auto">
        <p>{t(`errorPanel.kind.${kind}.explanation`)}</p>
        <p className="mt-1.5 font-semibold">{t("errorPanel.suggestionLabel")}: {t(`errorPanel.kind.${kind}.suggestion`)}</p>
      </div>

      <div dir="auto" className="rounded-lg bg-red-100/60 px-3 py-2 text-xs dark:bg-red-500/10">
        <span className="font-semibold">{t("errorPanel.technicalLabel")}:</span> <span dir="ltr" className="font-mono">{errorMessage}</span>
      </div>

      <div className="mt-auto flex items-center gap-2">
        {autoFixValid ? (
          <button
            type="button"
            onClick={handleAutoFix}
            disabled={applying}
            data-testid="json-error-autofix"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-70"
            style={{ background: "var(--glass-danger-strong)" }}
          >
            <Wand2 size={14} />
            {t("errorPanel.autoFixButton")}
          </button>
        ) : (
          <p dir="auto" className="text-xs" style={{ color: "var(--ph-ink-muted)" }}>
            {t("errorPanel.autoFixUnavailable")}
          </p>
        )}
      </div>
    </div>
  );
}
