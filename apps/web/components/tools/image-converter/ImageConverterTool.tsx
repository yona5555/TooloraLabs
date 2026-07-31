"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Upload } from "lucide-react";
import ToolButton from "@/components/tool-ui/ToolButton";
import { formatBytes } from "./formatBytes";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ImageConverterTool() {
  const t = useTranslations("tools.image-converter");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [format, setFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError("");
    setResultUrl("");
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError(t("errors.invalidFile"));
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError(t("errors.tooLarge"));
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function convert() {
    if (!previewUrl) return;
    setError("");
    setIsConverting(true);

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsConverting(false);
        setError(t("errors.conversionFailed"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          setIsConverting(false);
          if (!blob) {
            setError(t("errors.conversionFailed"));
            return;
          }
          setResultUrl(URL.createObjectURL(blob));
          setResultSize(blob.size);
        },
        format,
        format === "image/png" ? undefined : quality
      );
    };
    img.onerror = () => {
      setIsConverting(false);
      setError(t("errors.conversionFailed"));
    };
    img.src = previewUrl;
  }

  function download() {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `converted.${FORMAT_EXTENSIONS[format]}`;
    link.click();
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-10 text-center transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
        >
          <Upload size={28} className="text-zinc-400 dark:text-zinc-500" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {file ? file.name : t("form.chooseFile")}
          </span>
        </button>
      </div>

      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={t("form.previewAlt")}
          className="mx-auto max-h-64 rounded-xl border border-zinc-200 object-contain dark:border-zinc-700"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.formatLabel")}
          </span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as OutputFormat)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </label>

        {format !== "image/png" && (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {t("form.qualityLabel")}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-2 w-full accent-blue-600"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolButton type="button" onClick={convert} disabled={!file || isConverting}>
        {isConverting ? t("form.converting") : t("form.convert")}
      </ToolButton>

      {resultUrl && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("form.resultSize", { size: formatBytes(resultSize) })}
          </p>
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
