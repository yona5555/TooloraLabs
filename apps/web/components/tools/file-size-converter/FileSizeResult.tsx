"use client";
import { useTranslations } from "next-intl";
import { prefixGap } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import FileSizeConverterShareExportModal from "./FileSizeConverterShareExportModal";
import { useFsModel } from "./FsLiveContext";

/**
 * Result card: the exact byte count as the hero, then every prefix level side by side — the decimal
 * (×1000) value against the binary (×1024) value — with a bar showing how far apart the two numbers
 * drift at that level and the best-fitting unit of each standard highlighted.
 */
export default function FileSizeResult() {
  const t = useTranslations("tools.file-size-converter");
  const tr = useTranslations("tools.file-size-converter.result");
  const { out, a, error, f } = useFsModel();

  if (!out || !a) {
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")}>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{error === "negativeValue" ? t("errors.negativeValue") : t("aboveFold.placeholder")}</p>
      </SectionCard>
    );
  }

  const heroValue = f(out.bytes, 0);
  const fmt = (v: number) => f(v, v < 1 ? 6 : 3);

  return (
    <SectionCard
      phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <FileSizeConverterShareExportModal
          operationLabel=""
          inputRows={[]}
          resultRows={[{ label: "B", value: heroValue }, ...out.decimal.slice(1, 4).map((row) => ({ label: row.unit, value: fmt(row.value) })), ...out.binary.slice(1, 4).map((row) => ({ label: row.unit, value: fmt(row.value) }))]}
          heroLabel={t("aboveFold.exactBytes")}
          heroValue={heroValue}
          sentence={`${t("aboveFold.exactBytes")}: ${heroValue} bytes.`}
        />
      }
    >
      <p className="text-center text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{t("aboveFold.exactBytes")}</p>
      <p dir="ltr" className="mt-1 text-center font-mono text-3xl font-bold text-blue-700 dark:text-blue-400">
        {heroValue} B
      </p>
      <p dir="ltr" className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {fmt(a.decimalValue)} {out.decimal[a.decimalLevel].unit} = {fmt(a.binaryValue)} {out.binary[a.binaryLevel].unit}
      </p>

      <div className="mt-4 grid grid-cols-[auto_1fr_1fr] gap-x-3 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        <span />
        <span>{t("aboveFold.decimalTitle")}</span>
        <span>{t("aboveFold.binaryTitle")}</span>
      </div>
      <ul data-preview="visual" className="mt-2 grid auto-rows-fr gap-1.5 lg:flex-1">
        {out.decimal.map((d, k) => {
          const b = out.binary[k];
          const gap = prefixGap(k);
          return (
            <li key={d.unit} className="flex flex-col justify-center rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-x-3 text-sm">
                <span className="text-xs font-bold text-zinc-400">{k === 0 ? "×1" : `×10^${k * 3}`}</span>
                <span dir="ltr" className={`font-mono ${k === a.decimalLevel ? "font-bold text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-200"}`}>
                  {fmt(d.value)} <span className="text-xs text-zinc-400">{d.unit}</span>
                </span>
                <span dir="ltr" className={`font-mono ${k === a.binaryLevel ? "font-bold text-emerald-700 dark:text-emerald-300" : "text-zinc-700 dark:text-zinc-200"}`}>
                  {fmt(b.value)} <span className="text-xs text-zinc-400">{b.unit}</span>
                </span>
              </div>
              {k > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, (gap / prefixGap(5)) * 100)}%` }} />
                  </div>
                  <span dir="ltr" className="w-24 shrink-0 text-end font-mono text-[11px] text-amber-700 dark:text-amber-300">
                    {tr("gap", { p: f(gap, 2) })}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
