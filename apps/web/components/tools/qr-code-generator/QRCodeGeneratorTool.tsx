"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { QRCodeGenerator } from "@tooloralabs/tools";
import ToolButton from "@/components/tool-ui/ToolButton";

const tool = new QRCodeGenerator();
const MAX_LENGTH = 2000;

export default function QRCodeGeneratorTool() {
  const t = useTranslations("tools.qr-code-generator");
  const [text, setText] = useState("");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate() {
    setError("");
    setSvg("");

    if (!text.trim()) {
      setError(t("errors.required"));
      return;
    }
    if (text.length > MAX_LENGTH) {
      setError(t("errors.tooLong"));
      return;
    }

    setIsGenerating(true);
    const output = await tool.execute({ text }, { locale: "en-US" });
    setIsGenerating(false);

    if (!output.success) {
      setError(t("errors.generationFailed"));
      return;
    }
    setSvg(output.data.svg);
  }

  function download() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr-code.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {t("form.inputLabel")}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("form.inputPlaceholder")}
          rows={3}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        />
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolButton type="button" onClick={generate} disabled={isGenerating}>
        {isGenerating ? t("form.generating") : t("form.generate")}
      </ToolButton>

      {svg && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <div
            className="h-56 w-56 rounded-lg bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Download size={16} />
            {t("form.download")}
          </button>
        </div>
      )}
    </div>
  );
}
