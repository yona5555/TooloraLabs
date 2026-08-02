import { useTranslations } from "next-intl";

export default function AdSpace({ className = "h-64" }: { className?: string }) {
  const t = useTranslations("common");

  return (
    <div
      className={`flex w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:text-zinc-600 ${className}`}
    >
      {t("adSpace")}
    </div>
  );
}
