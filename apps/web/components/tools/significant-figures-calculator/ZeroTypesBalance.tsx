"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import WorkedExampleNote from "@/components/tool-ui/WorkedExampleNote";
import { useSignificantFiguresLive } from "./SignificantFiguresLiveContext";

type ZeroCounts = { leading: number; captive: number; trailing: number };

function classifyZeros(raw: string): ZeroCounts {
  const s = raw.trim().replace(/^[+-]/, "");
  const digitsOnly = s.replace(".", "");
  const firstNonZero = digitsOnly.search(/[1-9]/);
  if (firstNonZero === -1) return { leading: 0, captive: 0, trailing: 0 };
  const lastNonZero = digitsOnly.length - 1 - [...digitsOnly].reverse().join("").search(/[1-9]/);

  let leading = 0;
  let captive = 0;
  let trailing = 0;
  for (let i = 0; i < digitsOnly.length; i++) {
    if (digitsOnly[i] !== "0") continue;
    if (i < firstNonZero) leading++;
    else if (i < lastNonZero) captive++;
    else trailing++;
  }
  return { leading, captive, trailing };
}

/** Type #14 (Balance Indicator): the live A's own zeros, classified by real position — leading zeros never count, captive zeros always do, trailing zeros depend on the decimal point actually being present. */
export default function ZeroTypesBalance() {
  const t = useTranslations("tools.significant-figures-calculator.education.zeroTypes");
  const { dims } = useSignificantFiguresLive();
  const counts = classifyZeros(dims.rawValueA);
  const total = counts.leading + counts.captive + counts.trailing || 1;

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { value: dims.rawValueA })}</p>
      <div dir="ltr" className="mt-4 flex h-10 w-full overflow-hidden rounded-lg">
        {counts.leading > 0 && (
          <div className="flex items-center justify-center bg-zinc-400 text-xs font-bold text-white dark:bg-zinc-600" style={{ width: `${(counts.leading / total) * 100}%` }}>
            {counts.leading}
          </div>
        )}
        {counts.captive > 0 && (
          <div className="flex items-center justify-center bg-blue-600 text-xs font-bold text-white" style={{ width: `${(counts.captive / total) * 100}%` }}>
            {counts.captive}
          </div>
        )}
        {counts.trailing > 0 && (
          <div className="flex items-center justify-center bg-emerald-600 text-xs font-bold text-white" style={{ width: `${(counts.trailing / total) * 100}%` }}>
            {counts.trailing}
          </div>
        )}
      </div>
      <div className="mt-4">
        <WorkedExampleNote
          title={t("worked.title")}
          rows={[
            { label: t("worked.leading"), value: `${counts.leading}`, note: t("worked.leadingNote") },
            { label: t("worked.captive"), value: `${counts.captive}`, note: t("worked.captiveNote") },
            { label: t("worked.trailing"), value: `${counts.trailing}`, emphasize: true, note: t("worked.trailingNote") },
          ]}
        />
      </div>
    </SectionCard>
  );
}
