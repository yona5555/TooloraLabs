"use client";
import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Upload, Download } from "lucide-react";
import { bytesToBase64, base64ToBytes } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";

export default function Base64FilePanel() {
  const t = useTranslations("tools.base64-tool.aboveFold.filePanel");
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [error, setError] = useState("");

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setFileName(file.name);
    const type = file.type || "application/octet-stream";
    setMimeType(type);
    const buffer = await file.arrayBuffer();
    const bytes = Array.from(new Uint8Array(buffer));
    const base64 = bytesToBase64(bytes, "standard");
    setDataUri(`data:${type};base64,${base64}`);
  }

  function handleDownload() {
    if (!dataUri) return;
    const match = dataUri.match(/^data:([^;]*);base64,([\s\S]*)$/);
    const base64 = match ? match[2] : dataUri;
    const bytes = base64ToBytes(base64, "standard");
    if (!bytes) {
      setError(t("invalidDataUri"));
      return;
    }
    const blob = new Blob([new Uint8Array(bytes)], { type: match?.[1] || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "download";
    a.click();
    URL.revokeObjectURL(url);
  }

  const isImage = mimeType.startsWith("image/");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
        <Upload size={16} />
        {t("chooseFile")}
        <input type="file" className="hidden" onChange={handleFileSelect} />
      </label>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {dataUri && (
        <div className="mt-4 space-y-3">
          {isImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUri}
              alt={fileName}
              className="max-h-40 w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
            />
          )}
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{fileName}</p>
          <textarea
            readOnly
            value={dataUri}
            rows={4}
            dir="ltr"
            className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={dataUri} />
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <Download size={16} />
              {t("download")}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
