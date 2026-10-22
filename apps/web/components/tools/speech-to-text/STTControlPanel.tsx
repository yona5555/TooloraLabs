"use client";
import { useTranslations } from "next-intl";
import { Mic, MicOff, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { ListeningState } from "./types";
import { clean } from "./sttMath";

const LANGUAGE_OPTIONS = [
  { code: "en-US", label: "English (US)" },
  { code: "ar-SA", label: "العربية" },
  { code: "de-DE", label: "Deutsch" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "hi-IN", label: "हिन्दी" },
];

type Props = {
  listeningState: ListeningState;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  isSupported: boolean;
  language: string;
  onLanguageChange: (value: string) => void;
  /** Final segments received so far (or the stored example while there are none). */
  segments: string[];
  isExample: boolean;
};

export default function STTControlPanel({
  listeningState,
  onStart,
  onStop,
  onClear,
  isSupported,
  language,
  onLanguageChange,
  segments,
  isExample,
}: Props) {
  const t = useTranslations("tools.speech-to-text.form");
  const tv = useTranslations("tools.speech-to-text.visuals");

  return (
    <SectionCard title={t("inputTitle")} className="flex flex-col lg:flex-1" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
      {!isSupported && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          {t("unsupported")}
        </p>
      )}

      <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
        {t("privacyNotice")}
      </p>

      {listeningState === "denied" && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {t("micDenied")}
        </p>
      )}

      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("languageLabel")}</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 flex gap-2">
        {listeningState === "listening" ? (
          <button
            type="button"
            onClick={onStop}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <MicOff size={18} />
            {t("stopListening")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={!isSupported}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mic size={18} />
            {t("startListening")}
          </button>
        )}
        <button
          type="button"
          onClick={onClear}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Trash2 size={16} />
          {t("clear")}
        </button>
      </div>

      {/* The tool's input: every final segment received, raw (spaces shown as dots) with its length before → after clean-up. */}
      {/* Desktop: fills the column's spare height and scrolls inside it, so the row stays as tall as the sidebar (§41). */}
      <div className="mt-5 flex flex-col rounded-xl p-3 lg:min-h-[8rem] lg:flex-1 lg:basis-0" style={{ background: "var(--glass-table-wrap-bg)" }} data-testid="stt-segments">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
            {tv("received")}
          </p>
          {isExample && (
            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "var(--ai-soft)", color: "var(--ph-ink)" }}>
              {tv("example")}
            </span>
          )}
        </div>
        <ol className="flex flex-col gap-1.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {segments.map((sg, i) => (
            <li key={i} className="rounded-lg px-2.5 py-1.5 text-sm" style={{ background: "var(--ai-soft)" }}>
              <div className="flex items-center justify-between gap-2 text-xs font-bold tabular-nums" style={{ color: "var(--ph-ink-muted)" }}>
                <span>{`S${i + 1}`}</span>
                <span dir="ltr">{`${sg.length} → ${clean(sg).length}`}</span>
              </div>
              <p dir="auto" className="mt-0.5 break-words leading-5" style={{ color: "var(--ph-ink)" }}>
                {sg.replace(/ /g, "·")}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </SectionCard>
  );
}
