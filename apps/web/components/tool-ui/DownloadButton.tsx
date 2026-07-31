"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { downloadTextFile } from "@/lib/export";

type DownloadButtonProps = {
  content: string;
  filename: string;
  mimeType?: string;
  className?: string;
};

export default function DownloadButton({
  content,
  filename,
  mimeType = "text/plain;charset=utf-8",
  className = "",
}: DownloadButtonProps) {
  const t = useTranslations("common.actions");

  return (
    <button
      type="button"
      onClick={() => downloadTextFile(filename, content, mimeType)}
      className={`flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700 ${className}`}
    >
      <Download size={16} />
      {t("download")}
    </button>
  );
}
