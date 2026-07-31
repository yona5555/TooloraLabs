"use client";

import { Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

type CopyButtonProps = {
  text: string;
  className?: string;
};

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const t = useTranslations("common.actions");
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700 ${className}`}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
