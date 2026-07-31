"use client";

import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";

type PrintButtonProps = {
  onPrint: () => void;
  className?: string;
};

export default function PrintButton({ onPrint, className = "" }: PrintButtonProps) {
  const t = useTranslations("common.actions");

  return (
    <button
      type="button"
      onClick={onPrint}
      className={`flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700 print:hidden ${className}`}
    >
      <Printer size={16} />
      {t("print")}
    </button>
  );
}
