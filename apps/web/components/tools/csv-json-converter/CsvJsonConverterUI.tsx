"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CsvJsonConverter, type CsvJsonMode } from "@tooloralabs/tools";
import ToolButton from "@/components/tool-ui/ToolButton";

const tool = new CsvJsonConverter();

export default function CsvJsonConverterUI() {
  const t = useTranslations("tools.csv-json-converter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function run(mode: CsvJsonMode) {
    setError("");
    setOutput("");
    setCopied(false);

    if (!input.trim()) {
      setError(t("errors.required"));
      return;
    }

    const result = tool.execute({ text: input, mode }, { locale: "en-US" });
    if (!result.success) {
      const errorKey = result.metadata.error === "INVALID_JSON"
        ? "invalidJson"
        : result.metadata.error === "EXPECTED_ARRAY"
          ? "expectedArray"
          : "required";
      setError(t(`errors.${errorKey}`));
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
          rows={8}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <ToolButton type="button" onClick={() => run("csvToJson")}>
          {t("form.csvToJson")}
        </ToolButton>
        <button
          type="button"
          onClick={() => run("jsonToCsv")}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("form.jsonToCsv")}
        </button>
      </div>

      {output && (
        <label className="block space-y-2">
          <div className="flex items-center justify-between">
            <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t("form.outputLabel")}
            </span>
            <button
              type="button"
              onClick={copyOutput}
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {copied ? t("form.copied") : t("form.copy")}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={8}
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
      )}
    </div>
  );
}
