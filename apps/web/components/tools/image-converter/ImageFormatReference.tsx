"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { formatBytes } from "./formatBytes";
import type { OutputFormat } from "./ImageInputPanel";

type FormatRow = { format: string; bestFor: string };

const MIME: Record<string, OutputFormat> = { PNG: "image/png", JPEG: "image/jpeg", WebP: "image/webp" };

/**
 * The format guide, also a picker: each row sets the Output Format and the current one is marked.
 * Under the rows, the current image actually encoded in all three formats at the current quality,
 * as bars against the original's size; that chart takes the column's spare height (§41), so the
 * rows keep their natural height.
 */
export default function ImageFormatReference({
  format,
  onFormatChange,
  sizes,
  originalSize,
  quality,
}: {
  format: OutputFormat;
  onFormatChange: (f: OutputFormat) => void;
  sizes: Partial<Record<OutputFormat, number>>;
  originalSize: number;
  quality: number;
}) {
  const t = useTranslations("tools.image-converter.aboveFold.formatGuide");
  const tv = useTranslations("tools.image-converter.visuals.result");
  const rows = t.raw("rows") as FormatRow[];
  const top = Math.max(originalSize, ...Object.values(sizes).map((v) => v ?? 0)) || 1;
  const bars = [
    { key: "orig", label: tv("original"), size: originalSize, mime: null as OutputFormat | null },
    ...rows.map((r) => ({ key: r.format, label: r.format, size: sizes[MIME[r.format]] ?? 0, mime: MIME[r.format] ?? null })),
  ];

  return (
    <SectionCard phoneRole="extra" title={t("title")} className="flex flex-col lg:flex-1" bodyClassName="flex flex-1 flex-col p-4 lg:p-6">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {rows.map((row) => {
          const mime = MIME[row.format];
          const on = mime === format;
          return (
            <button
              key={row.format}
              type="button"
              aria-pressed={on}
              onClick={() => mime && onFormatChange(mime)}
              className="flex flex-col rounded-xl border px-3 py-2 text-start text-sm transition"
              style={{ borderColor: on ? "var(--ph-accent-strong)" : "var(--ph-line)", background: on ? "var(--ph-accent-soft)" : "transparent" }}
            >
              <span dir="ltr" className="font-semibold" style={{ color: "var(--ph-ink)" }}>
                {row.format}
              </span>
              <span className="mt-1" style={{ color: "var(--ph-ink-muted)" }}>
                {row.bestFor}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-1 flex-col border-t border-zinc-200 pt-4 dark:border-zinc-800" data-testid="image-format-sizes">
        <p className="text-xs font-semibold" style={{ color: "var(--ph-ink)" }}>
          {t("sizesTitle", { q: Math.round(quality * 100) })}
        </p>
        <div dir="ltr" className="mt-3 flex min-h-[140px] flex-1 items-stretch gap-2">
          {bars.map((b) => {
            const on = b.mime === format;
            const pct = b.size > 0 ? Math.max(3, (b.size / top) * 100) : 0;
            const body = (
              <>
                <span className="whitespace-nowrap text-xs font-semibold tabular-nums" style={{ color: "var(--ph-ink)" }}>
                  {b.size > 0 ? formatBytes(b.size) : "…"}
                </span>
                <span className="flex w-full flex-1 flex-col justify-end">
                  <span
                    className="block w-full rounded-t-lg transition-[height] duration-300"
                    style={{ height: `${pct}%`, background: b.mime ? (on ? "var(--cv-from)" : "var(--cv-to)") : "var(--ph-ink-muted)", opacity: b.mime && !on ? 0.75 : 1 }}
                  />
                </span>
                <span className="text-xs font-bold" style={{ color: on ? "var(--ph-accent-strong)" : "var(--ph-ink-muted)" }}>
                  {b.label}
                </span>
              </>
            );
            return b.mime ? (
              <button
                key={b.key}
                type="button"
                aria-pressed={on}
                data-testid={`image-size-${b.key}`}
                onClick={() => onFormatChange(b.mime as OutputFormat)}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg px-1 pt-1 transition"
                style={{ outline: on ? "2px solid var(--ph-accent-strong)" : "none", outlineOffset: 2 }}
              >
                {body}
              </button>
            ) : (
              <div key={b.key} data-testid={`image-size-${b.key}`} className="flex flex-1 flex-col items-center gap-1 px-1 pt-1">
                {body}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--ph-ink-muted)" }}>
          {t("sizesNote")}
        </p>
      </div>
    </SectionCard>
  );
}
