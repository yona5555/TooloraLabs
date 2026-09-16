"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function ZipCompressorReference() {
  const t = useTranslations("tools.zip-compressor.reference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl dir="ltr" className="mt-4 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center justify-between gap-3">
          <dt>{t("textLabel")}</dt>
          <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">~60-70%</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>{t("codeLabel")}</dt>
          <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">~50-70%</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt>{t("compressedLabel")}</dt>
          <dd className="font-mono font-semibold text-zinc-500 dark:text-zinc-400">~0-5%</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("note")}</p>
    </SectionCard>
  );
}
