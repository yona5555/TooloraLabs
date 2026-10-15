"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, Check } from "lucide-react";
import CopyButton from "@/components/tool-ui/CopyButton";
import { tokenizeJSONLines, type JSONTokenType } from "./jsonSyntaxHighlight";

/**
 * The Result card's code panel: a polished, syntax-highlighted window-framed code block with
 * line numbers, Copy and "Download as PNG" (html2canvas-pro rasterizes this exact node, so the
 * PNG always matches the panel's current `theme`). `theme` is the code panel's OWN selectable
 * palette (pulling the bulb's cord switches it) — independent of the site's own light/dark mode,
 * so its colours come from the fixed json-code-light / json-code-dark tokens, not the --ph- ones.
 */
export type CodeTheme = "light" | "dark";

const PALETTE: Record<CodeTheme, { bg: string; frame: string; border: string; ink: string; muted: string; key: string; string: string; number: string; boolean: string; null: string; punct: string }> = {
  light: {
    bg: "var(--json-code-light-bg)",
    frame: "var(--json-code-light-frame)",
    border: "var(--json-code-light-border)",
    ink: "var(--json-code-light-ink)",
    muted: "var(--json-code-light-muted)",
    key: "var(--json-code-light-key)",
    string: "var(--json-code-light-string)",
    number: "var(--json-code-light-number)",
    boolean: "var(--json-code-light-boolean)",
    null: "var(--json-code-light-null)",
    punct: "var(--json-code-light-punct)",
  },
  dark: {
    bg: "var(--json-code-dark-bg)",
    frame: "var(--json-code-dark-frame)",
    border: "var(--json-code-dark-border)",
    ink: "var(--json-code-dark-ink)",
    muted: "var(--json-code-dark-muted)",
    key: "var(--json-code-dark-key)",
    string: "var(--json-code-dark-string)",
    number: "var(--json-code-dark-number)",
    boolean: "var(--json-code-dark-boolean)",
    null: "var(--json-code-dark-null)",
    punct: "var(--json-code-dark-punct)",
  },
};

function tokenColor(type: JSONTokenType, p: (typeof PALETTE)["light"]): string {
  switch (type) {
    case "key":
      return p.key;
    case "string":
      return p.string;
    case "number":
      return p.number;
    case "boolean":
      return p.boolean;
    case "null":
      return p.null;
    case "punct":
      return p.punct;
    default:
      return p.ink;
  }
}

export default function JSONCodePanel({ text, filename, theme }: { text: string; filename: string; theme: CodeTheme }) {
  const t = useTranslations("tools.json-formatter.aboveFold.codeImage");
  const cardRef = useRef<HTMLDivElement>(null);
  const [pngState, setPngState] = useState<"idle" | "working" | "done">("idle");
  const p = PALETTE[theme];

  const lines = tokenizeJSONLines(text);

  async function handleDownloadPng() {
    const node = cardRef.current;
    if (!node) return;
    setPngState("working");
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const bg = getComputedStyle(node).backgroundColor;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: bg || "#ffffff" });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("no blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.replace(/\.json$/i, ".png");
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPngState("done");
      setTimeout(() => setPngState("idle"), 1500);
    } catch {
      setPngState("idle");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2" data-testid="json-code-panel">
      <div
        ref={cardRef}
        dir="ltr"
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border transition-colors duration-300"
        style={{ background: p.bg, borderColor: p.border }}
      >
        <div className="flex items-center gap-2 border-b px-3 py-2 transition-colors duration-300" style={{ background: p.frame, borderColor: p.border }}>
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ms-2 truncate font-mono text-xs" style={{ color: p.muted }}>
            {filename}
          </span>
        </div>
        <div className="json-scroll max-h-[45rem] overflow-auto px-0 py-2">
          <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
            <tbody>
              {lines.map((tokens, i) => (
                <tr key={i}>
                  <td className="w-10 select-none whitespace-nowrap px-2 text-end align-top tabular-nums" style={{ color: p.muted, opacity: 0.7 }}>
                    {i + 1}
                  </td>
                  <td className="whitespace-pre px-3 align-top" style={{ color: p.ink }}>
                    {tokens.map((tok, j) => (
                      <span key={j} style={{ color: tokenColor(tok.type, p) }}>
                        {tok.text}
                      </span>
                    ))}
                    {tokens.length === 0 ? " " : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <CopyButton text={text} className="px-3 py-2 text-xs" />
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={pngState === "working"}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {pngState === "done" ? <Check size={14} /> : <ImageIcon size={14} />}
          {pngState === "working" ? t("generating") : pngState === "done" ? t("done") : t("downloadPng")}
        </button>
      </div>
    </div>
  );
}
