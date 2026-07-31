"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";
import { PasswordGenerator } from "@tooloralabs/tools";
import ToolButton from "@/components/tool-ui/ToolButton";

const tool = new PasswordGenerator();

export default function PasswordGeneratorTool() {
  const t = useTranslations("tools.password-generator");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setError("");
    setCopied(false);

    const result = tool.execute(
      {
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
      },
      { locale: "en-US" }
    );
    if (!result.success) {
      setPassword("");
      setError(t("errors.noCharset"));
      return;
    }
    setPassword(result.data.password);
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const options: {
    key: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }[] = [
    { key: "uppercase", checked: includeUppercase, onChange: setIncludeUppercase },
    { key: "lowercase", checked: includeLowercase, onChange: setIncludeLowercase },
    { key: "numbers", checked: includeNumbers, onChange: setIncludeNumbers },
    { key: "symbols", checked: includeSymbols, onChange: setIncludeSymbols },
  ];

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.lengthLabel")}
          </span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {length}
          </span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="mt-2 w-full accent-blue-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            <input
              type="checkbox"
              checked={option.checked}
              onChange={(e) => option.onChange(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            {t(`form.${option.key}`)}
          </label>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolButton type="button" onClick={generate}>
        {t("form.generate")}
      </ToolButton>

      {password && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
          <code className="break-all font-mono text-lg text-zinc-900 dark:text-zinc-100">
            {password}
          </code>
          <button
            type="button"
            onClick={copyPassword}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t("form.copied") : t("form.copy")}
          </button>
        </div>
      )}
    </div>
  );
}
