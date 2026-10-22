"use client";
import { useTranslations } from "next-intl";
import { AlertTriangle, Wand2 } from "lucide-react";
import { ltr } from "@/components/tool-ui/MixedText";
import { diagnoseHex, proposeHexFix } from "./paletteMath";

/**
 * Invalid base colour, adapted from the json-formatter error panel: the typed value with the first
 * non-hex character marked (caret), a meter of hex digits against the 6 a colour needs, the reason in
 * plain words, a suggested fix, and an Auto-fix for the standard mistakes (3-digit shorthand, an
 * 8-digit value with alpha, a 0x prefix, stray spaces) — shown only when the repair is a valid colour.
 */
export default function PaletteErrorPanel({ value, message, onApplyFix }: { value: string; message: string; onApplyFix: (v: string) => void }) {
  const t = useTranslations("tools.color-palette-generator.aboveFold.errorPanel");
  const { kind, bad, digits } = diagnoseHex(value);
  const fix = proposeHexFix(value);
  const chars = Array.from(value);
  const meterMax = Math.max(6, digits) * 1.15;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" data-testid="cp-error-panel">
      <div className="flex items-start gap-2">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p className="font-semibold" dir="auto">
          {message}
        </p>
      </div>

      <div className="rounded-lg border border-red-200/70 bg-white px-3 py-2 text-sm leading-6 dark:border-red-500/20 dark:bg-zinc-900">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span dir="auto" className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
            {t("inputLabel")}
          </span>
          <span dir="ltr" className="min-w-0 break-all font-mono" style={{ color: chars.length ? "var(--ph-ink)" : "var(--ph-ink-muted)" }}>
            {chars.length === 0
              ? `${t("emptyValue")} — ${t("emptyExample", { hex: "#3B82F6" })}`
              : chars.map((c, i) => (
                  <span key={i} style={i === bad ? { background: "var(--glass-danger-soft)", color: "var(--glass-danger-strong)", fontWeight: 800 } : undefined}>
                    {c === " " ? "·" : c}
                  </span>
                ))}
          </span>
        </div>
        {bad >= 0 && (
          <div className="flex items-baseline gap-x-2 leading-4" aria-hidden="true">
            <span dir="auto" className="invisible text-[11px] font-bold uppercase tracking-wide">
              {t("inputLabel")}
            </span>
            <span dir="ltr" className="whitespace-pre font-mono" style={{ color: "var(--glass-danger-strong)" }}>
              <span className="invisible">{chars.slice(0, bad).map((c) => (c === " " ? "·" : c)).join("")}</span>^
            </span>
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-3" data-testid="cp-length-meter">
          <div dir="ltr" className="relative h-3 flex-1 rounded-full" style={{ background: "var(--glass-track)" }}>
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(Math.min(digits, meterMax) / meterMax) * 100}%`, background: "var(--glass-danger-strong)" }} />
            <div className="absolute -inset-y-1 w-0.5 rounded" style={{ left: `${(6 / meterMax) * 100}%`, background: "var(--glass-success-strong)" }} />
          </div>
          <span className="shrink-0 text-xs font-semibold" style={{ color: "var(--ph-ink)" }}>
            {t("meter", { n: ltr(String(digits)) })}
          </span>
        </div>
      </div>

      <div dir="auto">
        <p>{t(`kind.${kind}.explanation`)}</p>
        <p className="mt-1.5 font-semibold">
          {t("suggestionLabel")}: {t(`kind.${kind}.suggestion`)}
        </p>
      </div>

      <div className="flex min-h-11 flex-wrap items-center gap-2">
        {fix ? (
          <>
            <button
              type="button"
              onClick={() => onApplyFix(fix.value)}
              data-testid="cp-error-autofix"
              className="flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition"
              style={{ background: "var(--glass-danger-strong)" }}
            >
              <Wand2 size={14} />
              {t(`fix.${fix.kind}`)}
            </button>
            <span dir="ltr" className="flex items-center gap-1.5 font-mono text-xs" style={{ color: "var(--ph-ink)" }}>
              → <span className="inline-block h-3.5 w-3.5 rounded-sm" style={{ background: fix.value, border: "1px solid var(--ph-line)" }} />
              {fix.value}
            </span>
          </>
        ) : (
          <p dir="auto" className="text-xs" style={{ color: "var(--ph-ink-muted)" }}>
            {t("autoFixUnavailable")}
          </p>
        )}
      </div>
    </div>
  );
}
