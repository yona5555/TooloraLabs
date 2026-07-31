"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";
import { FileNameSanitizer } from "@tooloralabs/tools";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";

const tool = new FileNameSanitizer();

type Separator = "-" | "_";

export default function FileNameSanitizerTool() {
  const t = useTranslations("tools.file-name-sanitizer");
  const [fileName, setFileName] = useState("");
  const [separator, setSeparator] = useState<Separator>("-");
  const [lowercase, setLowercase] = useState(true);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function run() {
    setError("");
    setResult("");
    setCopied(false);

    if (!fileName.trim()) {
      setError(t("errors.required"));
      return;
    }

    const output = tool.execute({ fileName, separator, lowercase }, { locale: "en-US" });
    if (!output.success) {
      setError(t("errors.invalidResult"));
      return;
    }
    setResult(output.data.result);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <ToolInput
        type="text"
        label={t("form.inputLabel")}
        placeholder={t("form.inputPlaceholder")}
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.separator")}
          </span>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value as Separator)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="-">{t("form.separatorDash")}</option>
            <option value="_">{t("form.separatorUnderscore")}</option>
          </select>
        </label>

        <label className="flex items-center gap-2 self-end rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          {t("form.lowercase")}
        </label>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolButton type="button" onClick={run}>
        {t("form.sanitize")}
      </ToolButton>

      {result && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
          <code className="break-all font-mono text-lg text-zinc-900 dark:text-zinc-100">
            {result}
          </code>
          <button
            type="button"
            onClick={copyResult}
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
