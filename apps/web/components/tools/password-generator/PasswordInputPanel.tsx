"use client";
import { useTranslations } from "next-intl";
import type { PasswordMode, PassphraseSeparator } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

const SEPARATORS: PassphraseSeparator[] = ["-", "_", " ", ""];

export type PasswordFormState = {
  mode: PasswordMode;
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  wordCount: number;
  separator: PassphraseSeparator;
  capitalizeWords: boolean;
  appendNumber: boolean;
};

type PasswordInputPanelProps = {
  form: PasswordFormState;
  onChange: (patch: Partial<PasswordFormState>) => void;
};

export default function PasswordInputPanel({ form, onChange }: PasswordInputPanelProps) {
  const t = useTranslations("tools.password-generator.form");

  const charOptions: { key: "includeUppercase" | "includeLowercase" | "includeNumbers" | "includeSymbols"; label: string }[] = [
    { key: "includeUppercase", label: t("uppercase") },
    { key: "includeLowercase", label: t("lowercase") },
    { key: "includeNumbers", label: t("numbers") },
    { key: "includeSymbols", label: t("symbols") },
  ];

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["characters", "passphrase"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange({ mode: m })}
            className={`rounded-md px-3 py-2.5 text-sm font-medium transition ${
              form.mode === m
                ? "bg-blue-600 text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {m === "characters" ? t("modeCharacters") : t("modePassphrase")}
          </button>
        ))}
      </div>

      {form.mode === "characters" ? (
        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("lengthLabel")}</span>
              <span dir="ltr" className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {form.length}
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={form.length}
              onChange={(e) => onChange({ length: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {charOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                <input
                  type="checkbox"
                  checked={form[option.key]}
                  onChange={(e) => onChange({ [option.key]: e.target.checked })}
                  className="h-4 w-4 accent-blue-600"
                />
                {option.label}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.excludeAmbiguous}
              onChange={(e) => onChange({ excludeAmbiguous: e.target.checked })}
              className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600"
            />
            {t("excludeAmbiguous")}
          </label>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("wordCountLabel")}</span>
              <span dir="ltr" className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {form.wordCount}
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={form.wordCount}
              onChange={(e) => onChange({ wordCount: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
          </div>

          <div>
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("separatorLabel")}</span>
            <div className="mt-2 inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
              {SEPARATORS.map((sep) => (
                <button
                  key={sep || "none"}
                  type="button"
                  onClick={() => onChange({ separator: sep })}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    form.separator === sep
                      ? "bg-blue-600 text-white"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {sep === "-" ? t("separatorHyphen") : sep === "_" ? t("separatorUnderscore") : sep === " " ? t("separatorSpace") : t("separatorNone")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={form.capitalizeWords}
                onChange={(e) => onChange({ capitalizeWords: e.target.checked })}
                className="h-4 w-4 accent-blue-600"
              />
              {t("capitalizeWords")}
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={form.appendNumber}
                onChange={(e) => onChange({ appendNumber: e.target.checked })}
                className="h-4 w-4 accent-blue-600"
              />
              {t("appendNumber")}
            </label>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
