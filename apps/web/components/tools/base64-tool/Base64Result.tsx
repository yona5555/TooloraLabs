"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import Base64ShareExportModal from "./Base64ShareExportModal";
import { GROUP_TEXT, useB64Model } from "./B64LiveContext";

/**
 * Result card: the converted text, then the Base64 side drawn group by group — every four characters
 * coloured by the three bytes they carry, padding marked — with the byte-to-character size bars.
 */
export default function Base64Result() {
  const t = useTranslations("tools.base64-tool");
  const tr = useTranslations("tools.base64-tool.result");
  const { draft, result, error, a, f, pct } = useB64Model();
  const operationLabel = draft.mode === "encode" ? t("form.encode") : t("form.decode");
  const truncated = result.length > 300 ? `${result.slice(0, 300)}…` : result;

  if (error || !a) {
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")}>
        <p
          className={`rounded-xl px-4 py-3 text-sm font-medium ${error ? "border border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400" : "text-center text-zinc-500 dark:text-zinc-400"}`}
        >
          {error ? t("errors.invalidBase64") : t("aboveFold.placeholder")}
        </p>
      </SectionCard>
    );
  }

  const shownGroups = a.groups.slice(0, 40);
  const maxSize = Math.max(a.byteCount, a.paddedLength, 1);

  return (
    <SectionCard
      phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <div className="flex items-center gap-2">
          <CopyButton text={result} />
          <Base64ShareExportModal
            operationLabel={operationLabel}
            inputRows={[{ label: t("aboveFold.sizeInput"), value: `${f(draft.mode === "encode" ? a.byteCount : a.textLength)} ${t("aboveFold.bytes")}` }]}
            resultRows={[
              { label: t("aboveFold.sizeOutput"), value: `${f(draft.mode === "encode" ? a.textLength : a.byteCount)} ${t("aboveFold.bytes")}` },
              { label: t("aboveFold.resultTitle"), value: truncated },
            ]}
            heroLabel={t("aboveFold.resultTitle")}
            heroValue={truncated}
            sentence={`${operationLabel}: ${f(a.byteCount)} → ${f(a.textLength)} ${t("aboveFold.bytes")}`}
          />
        </div>
      }
    >
      <textarea
        readOnly
        aria-label={t("aboveFold.resultTitle")}
        value={result}
        rows={4}
        dir={draft.mode === "decode" ? "auto" : "ltr"}
        className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />

      <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">{tr("groups", { n: a.groups.length })}</p>
      <div
        dir="ltr"
        data-preview="visual"
        className="grid max-h-80 auto-rows-fr gap-1.5 overflow-auto max-md:grid-cols-[minmax(0,1fr)] rounded-xl bg-zinc-50 p-2 lg:max-h-none lg:min-h-[8rem] lg:flex-1 lg:basis-0 dark:bg-zinc-800/50"
      >
        {shownGroups.map((g, i) => (
          <div key={i} className="flex min-h-9 items-center gap-3 rounded-md bg-white px-3 dark:bg-zinc-900">
            <span className="w-6 shrink-0 text-end font-mono text-xs text-zinc-400">{i + 1}</span>
            <span className="shrink-0 font-mono text-xs text-zinc-600 dark:text-zinc-300">{g.bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs tracking-tight text-zinc-400">{g.bytes.map((b) => b.toString(2).padStart(8, "0")).join(" ")}</span>
            <span className={`shrink-0 font-mono text-base font-bold tracking-widest ${GROUP_TEXT[i % 2]}`}>
              {g.chars.map((c, k) => (
                <span key={k} className={c === "=" ? "text-rose-500" : ""}>
                  {c}
                </span>
              ))}
            </span>
          </div>
        ))}
        {a.groups.length > shownGroups.length && <p className="px-2 text-center text-xs text-zinc-500">+{f(a.groups.length - shownGroups.length)}</p>}
      </div>

      <div className="mt-4 space-y-2">
        {[
          { label: tr("bytes"), value: a.byteCount, cls: "bg-zinc-400 dark:bg-zinc-500" },
          { label: tr("chars"), value: a.paddedLength, cls: "bg-blue-500" },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{row.label}</span>
              <span dir="ltr" className="font-mono">
                {f(row.value)}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-full rounded-full ${row.cls}`} style={{ width: `${(row.value / maxSize) * 100}%` }} />
            </div>
          </div>
        ))}
        <p dir="ltr" className="pt-1 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          4 × ⌈{f(a.byteCount)} / 3⌉ = {f(a.paddedLength)} · +{pct(a.paddedLength - a.byteCount, a.byteCount)}
        </p>
      </div>
    </SectionCard>
  );
}
