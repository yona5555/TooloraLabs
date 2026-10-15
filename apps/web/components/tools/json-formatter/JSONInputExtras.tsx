"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import type { JSONStats } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import { QUICK_SAMPLES } from "./jsonQuickSamples";
import { inferJSONSchema } from "./jsonSchema";
import { buildTree, flattenAll, TYPE_TAG, TYPE_TOKEN } from "./jsonTreeData";

/**
 * Real leaf-level content (every key path in the visitor's own document, tagged by type). Lives
 * in the input column (moved here from the Result column) so both above-the-fold columns end at
 * the same bottom edge instead of the Result column running ~185px past the input column.
 */
function JSONOutline({ parsed }: { parsed: unknown }) {
  const t = useTranslations("tools.json-formatter.aboveFold.outline");
  const rows = useMemo(() => {
    if (parsed === null || parsed === undefined || typeof parsed !== "object") return [];
    return flattenAll(buildTree(parsed)).filter((n) => n.depth > 0);
  }, [parsed]);

  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("title")}</h3>
      <div className="flex max-h-80 min-h-[9rem] flex-col overflow-hidden rounded-xl border" style={{ borderColor: "var(--ph-line)" }} data-testid="json-result-outline">
        {rows.length === 0 ? (
          <p className="flex min-h-0 flex-1 items-center justify-center px-3 py-4 text-center text-xs" style={{ color: "var(--ph-ink-muted)" }}>
            {t("empty")}
          </p>
        ) : (
          <div className="json-scroll min-h-0 flex-1 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {rows.map((n) => (
              <div key={n.id} dir="ltr" className="flex items-center gap-2 px-3 py-1.5 text-xs">
                <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: "var(--glass-track)", color: TYPE_TOKEN[n.type] }}>
                  {TYPE_TAG[n.type]}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono" style={{ color: "var(--ph-ink-muted)" }}>
                  {n.dotPath}
                </span>
                <span className="shrink-0 truncate font-mono font-semibold" style={{ color: "var(--ph-ink)" }}>
                  {n.preview}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * §41: fills the input column's space below the Clear button with real, useful content instead
 * of an empty band — quick real-world samples, a live-inferred JSON Schema, the document outline,
 * and a compact file status strip. All derived purely from the visitor's own current `json`/`parsed`.
 */
export default function JSONInputExtras({
  json,
  parsed,
  isValid,
  stats,
  onJsonChange,
}: {
  json: string;
  parsed: unknown;
  isValid: boolean;
  stats: JSONStats | null;
  onJsonChange: (value: string) => void;
}) {
  const t = useTranslations("tools.json-formatter.form.extras");

  const schemaText = useMemo(() => {
    if (!isValid || parsed === undefined) return "";
    try {
      return JSON.stringify(inferJSONSchema(parsed), null, 2);
    } catch {
      return "";
    }
  }, [parsed, isValid]);

  const lineCount = json.split("\n").length;
  const byteSize = useMemo(() => new TextEncoder().encode(json).length, [json]);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("quickSamplesTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_SAMPLES.map((sample) => (
            <button
              key={sample.key}
              type="button"
              onClick={() => onJsonChange(sample.json)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              {t(`quickSamples.${sample.key}`)}
            </button>
          ))}
        </div>
      </div>

      <div
        data-testid="json-file-status"
        dir="ltr"
        className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold"
        style={{
          borderColor: isValid ? "var(--glass-success-strong)" : "var(--glass-danger-strong)",
          background: isValid ? "var(--glass-success-soft)" : "var(--glass-danger-soft)",
          color: isValid ? "var(--glass-success-strong)" : "var(--glass-danger-strong)",
        }}
      >
        <span className="flex items-center gap-1.5">
          {isValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {isValid ? t("statusValid") : t("statusInvalid")}
        </span>
        <span className="tabular-nums" style={{ color: "var(--ph-ink)" }}>
          {t("statusLines", { n: lineCount })}
        </span>
        <span className="tabular-nums" style={{ color: "var(--ph-ink)" }}>
          {t("statusDepth", { n: stats?.depth ?? 0 })}
        </span>
        <span className="tabular-nums" style={{ color: "var(--ph-ink)" }}>
          {t("statusSize", { n: byteSize < 1024 ? `${byteSize} B` : `${(byteSize / 1024).toFixed(1)} KB` })}
        </span>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("schemaTitle")}</h3>
          {schemaText && <CopyButton text={schemaText} className="px-2.5 py-1 text-[11px]" />}
        </div>
        {schemaText ? (
          <pre
            dir="ltr"
            className="json-scroll max-h-80 min-h-[9rem] overflow-auto rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 font-mono text-[11px] leading-5 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {schemaText}
          </pre>
        ) : (
          <p className="flex min-h-[9rem] items-center justify-center rounded-xl border border-dashed border-zinc-300 px-3 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            {t("schemaUnavailable")}
          </p>
        )}
      </div>

      <JSONOutline parsed={parsed} />
    </div>
  );
}
