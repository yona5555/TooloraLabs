"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { DuplicateLineRemoverOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";

type DuplicateLineResultProps = {
  data: DuplicateLineRemoverOutput | null;
  digitStyle: DigitStyle;
};

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/60">
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{title}</dt>
      <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}

export default function DuplicateLineResult({ data, digitStyle }: DuplicateLineResultProps) {
  const t = useTranslations("tools.duplicate-line-remover");

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      action={data && data.result ? <CopyButton text={data.result} /> : undefined}
    >
      {data ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat title={t("aboveFold.totalLines")} value={formatLocalizedNumber(data.totalLines, digitStyle)} />
            <Stat title={t("aboveFold.uniqueLines")} value={formatLocalizedNumber(data.uniqueLines, digitStyle)} />
            <Stat title={t("aboveFold.removedCount")} value={formatLocalizedNumber(data.removedCount, digitStyle)} />
          </div>

          <textarea
            readOnly
            value={data.result}
            rows={10}
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />

          {data.duplicates.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t("aboveFold.duplicatesTitle")}
              </p>
              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {data.duplicates.map((dup) => (
                  <div key={dup.line} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-1.5 text-sm dark:bg-zinc-800/60">
                    <span className="truncate font-mono text-zinc-800 dark:text-zinc-200">{dup.line}</span>
                    <span dir="ltr" className="shrink-0 font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      ×{formatLocalizedNumber(dup.count, digitStyle)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
