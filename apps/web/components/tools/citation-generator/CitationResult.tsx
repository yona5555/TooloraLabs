import { useTranslations } from "next-intl";
import CopyButton from "@/components/tool-ui/CopyButton";
import type { CitationResult as Result } from "./types";

type Props = {
  result: Result;
};

export default function CitationResult({ result }: Props) {
  const t = useTranslations("tools.citation-generator.result");

  if (result.error) {
    const messageKey = result.error === "missing-title" ? "missingTitle" : result.error === "missing-journal-name" ? "missingJournalName" : "missingUrl";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <div className="p-4 lg:p-6">
          <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(messageKey)}</p>
        </div>
      </div>
    );
  }

  const styles: { key: "apa" | "mla" | "chicago"; label: string; text: string }[] = [
    { key: "apa", label: t("apaLabel"), text: result.apa ?? "" },
    { key: "mla", label: t("mlaLabel"), text: result.mla ?? "" },
    { key: "chicago", label: t("chicagoLabel"), text: result.chicago ?? "" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {styles.map((style) => (
        <div
          key={style.key}
          className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none"
        >
          <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
            <h2 className="font-bold text-white">{style.label}</h2>
            <CopyButton text={style.text} className="!text-white dark:!text-white" />
          </div>
          <div className="p-4 lg:p-6">
            <p dir="ltr" className="text-start text-sm leading-6 text-zinc-700 dark:text-zinc-200">
              {style.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
