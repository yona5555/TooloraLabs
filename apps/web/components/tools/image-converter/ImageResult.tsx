"use client";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { formatBytes } from "./formatBytes";
import type { Dimensions } from "./resizeMath";

type ImageResultProps = {
  resultUrl: string;
  resultSize: number;
  originalSize: number;
  outputDimensions: Dimensions | null;
  isConverting: boolean;
  onDownload: () => void;
};

export default function ImageResult({ resultUrl, resultSize, originalSize, outputDimensions, isConverting, onDownload }: ImageResultProps) {
  const t = useTranslations("tools.image-converter");

  const percentChange = originalSize > 0 ? Math.round((1 - resultSize / originalSize) * 100) : 0;

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {resultUrl ? (
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt={t("form.resultAlt")}
            className="mx-auto max-h-56 rounded-xl border border-zinc-200 object-contain dark:border-zinc-700"
          />

          <div className="grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.originalSize")}</dt>
              <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatBytes(originalSize)}
              </dd>
            </div>
            <div className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("aboveFold.newSize")}</dt>
              <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatBytes(resultSize)}
              </dd>
            </div>
          </div>

          <div
            className={`w-full rounded-xl px-4 py-3 text-center text-sm font-semibold ${
              percentChange > 0
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : percentChange < 0
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300"
            }`}
          >
            {percentChange > 0
              ? t("aboveFold.smallerBy", { percent: percentChange })
              : percentChange < 0
                ? t("aboveFold.largerBy", { percent: Math.abs(percentChange) })
                : t("aboveFold.sameSize")}
          </div>

          {outputDimensions && (
            <p dir="ltr" className="text-xs text-zinc-500 dark:text-zinc-400">
              {outputDimensions.width} × {outputDimensions.height}px
            </p>
          )}

          <button
            type="button"
            onClick={onDownload}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Download size={16} />
            {t("form.download")}
          </button>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {isConverting ? t("form.converting") : t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
