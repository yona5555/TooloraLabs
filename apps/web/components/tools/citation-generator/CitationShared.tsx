"use client";
import { useState } from "react";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";
import { Check, Copy } from "lucide-react";
import { formatLocalizedNumber } from "@tooloralabs/core";
import type { CitePart, CiteSegment } from "@tooloralabs/tools";
import { textWithUrlBreaks } from "@/components/tool-ui/UrlBreaks";
import { PART_COLORS } from "./studio";

export const fmt = (v: number, digits = 0) => formatLocalizedNumber(v, "western", { maximumFractionDigits: digits });

/** Copies plain text plus an HTML flavor (keeps italics when pasted into a word processor). */
export async function copyRich(text: string, html?: string): Promise<boolean> {
  try {
    if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
      return true;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({ text, html, label, doneLabel, compact = false }: { text: string; html?: string; label: string; doneLabel: string; compact?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <ResultActionButton action="copy"
      type="button"
      onClick={async () => {
        if (await copyRich(text, html)) {
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        }
      }}
      aria-label={label}
      className={`flex shrink-0 items-center gap-1 rounded-md border border-zinc-300 font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 ${
        compact ? "p-1" : "px-2 py-1 text-xs"
      }`}
    >
      {done ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {!compact && (done ? doneLabel : label)}
    </ResultActionButton>
  );
}

/** A formatted entry with real italics; `highlight` tints one element, `colored` underlines every element in its color. */
export function EntryText({
  segs,
  rtl,
  highlight,
  colored = false,
  className = "",
}: {
  segs: CiteSegment[];
  rtl: boolean;
  highlight?: CitePart | null;
  colored?: boolean;
  className?: string;
}) {
  return (
    <p dir={rtl ? "rtl" : "ltr"} className={`text-start break-words ${className}`}>
      {segs.map((s, i) => {
        const color = PART_COLORS[s.part];
        const on = highlight === s.part;
        const style =
          s.part === "punct" || !color
            ? undefined
            : on
              ? { backgroundColor: `${color}33`, boxShadow: `inset 0 -2px 0 ${color}`, borderRadius: 3 }
              : colored
                ? { boxShadow: `inset 0 -2px 0 ${color}99` }
                : undefined;
        const Tag = s.italic ? "i" : "span";
        return (
          <Tag key={i} style={style} className="transition-colors">
            {textWithUrlBreaks(s.text)}
          </Tag>
        );
      })}
    </p>
  );
}
