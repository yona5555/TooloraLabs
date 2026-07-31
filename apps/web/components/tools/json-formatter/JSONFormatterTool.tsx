"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { JSONFormatter } from "@tooloralabs/tools";
import ToolButton from "@/components/tool-ui/ToolButton";
import DownloadButton from "@/components/tool-ui/DownloadButton";
import type { JSONFormatterMode } from "./types";

const tool = new JSONFormatter();
const MAX_LENGTH = 100_000;

export default function JSONFormatterTool() {
  const t = useTranslations("tools.json-formatter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function run(mode: JSONFormatterMode) {
    setError("");
    setOutput("");
    setCopied(false);

    if (!input.trim()) {
      setError(t("errors.required"));
      return;
    }
    if (input.length > MAX_LENGTH) {
      setError(t("errors.tooLong"));
      return;
    }

    const result = tool.execute({ json: input, mode }, { locale: "en-US" });
    if (!result.success) {
      setError(t("errors.invalidJson"));
      return;
    }
    setOutput(result.data.result);
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {t("form.inputLabel")}
        </span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("form.inputPlaceholder")}
          rows={10}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <ToolButton type="button" onClick={() => run("format")}>
          {t("form.format")}
        </ToolButton>
        <button
          type="button"
          onClick={() => run("minify")}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("form.minify")}
        </button>
      </div>

      {output && (
        <label className="block space-y-2">
          <div className="flex items-center justify-between">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t("form.outputLabel")}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={copyOutput}
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {copied ? t("form.copied") : t("form.copy")}
              </button>
              <DownloadButton
                content={output}
                filename="formatted.json"
                mimeType="application/json;charset=utf-8"
              />
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            rows={10}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
      )}
    </div>
  );
}
