import { useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";

type StyledEntry = { style: string; text: string };

type Props = {
  entries: StyledEntry[];
  isEmpty: boolean;
};

export default function LogoResult({ entries, isEmpty }: Props) {
  const t = useTranslations("tools.text-logo-generator.result");

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
      </div>
      <div className="p-4 lg:p-6">
        {isEmpty ? (
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t("emptyText")}</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.style}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {t(`styles.${entry.style}`)}
                  </p>
                  <p dir="ltr" className="mt-0.5 truncate text-lg text-zinc-800 dark:text-zinc-100">
                    {entry.text}
                  </p>
                </div>
                <CopyButton text={entry.text} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
