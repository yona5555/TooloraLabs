"use client";
import { useTranslations } from "next-intl";
import { Mic, MicOff, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { ListeningState } from "./types";

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
};

export default function STTControlPanel({
  listeningState,
  onStart,
  onStop,
  onClear,
  isSupported,
  language,
  onLanguageChange,
}: Props) {
  const t = useTranslations("tools.speech-to-text.form");

  return (
    <SectionCard title={t("inputTitle")}>
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
    </SectionCard>
  );
}
