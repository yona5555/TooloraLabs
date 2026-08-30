"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";

type CopyLinkButtonProps = {
  className?: string;
};

export default function CopyLinkButton({ className = "" }: CopyLinkButtonProps) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in this context; nothing to recover
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700 ${className}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? t("copied") : t("copyLink")}
    </button>
  );
}
