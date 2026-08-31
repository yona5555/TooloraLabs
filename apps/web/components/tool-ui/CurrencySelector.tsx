"use client";
import { useTranslations } from "next-intl";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "@/lib/currency";

type CurrencySelectorProps = {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
};

export default function CurrencySelector({ value, onChange, className = "" }: CurrencySelectorProps) {
  const t = useTranslations("common.currency");

  return (
    <div className={`block space-y-2 ${className}`}>
      <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("label")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        aria-label={t("label")}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {t(`names.${code}`)}
          </option>
        ))}
      </select>
      {value !== "USD" && <span className="block text-xs text-amber-600 dark:text-amber-400">{t("approximateNote")}</span>}
    </div>
  );
}
