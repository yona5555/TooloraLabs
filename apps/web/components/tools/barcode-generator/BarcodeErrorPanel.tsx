"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Wand2 } from "lucide-react";
import type { BarcodeSymbology } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import { encode, SAMPLE_VALUES, upcCheck, eanCheck } from "./barcodeMath";

export type BarcodeErrorKey = "required" | "invalidLengthUpc" | "invalidLengthEan" | "nonDigit" | "unsupportedCharacter" | "tooLong";

const REQUIRED_DIGITS: Partial<Record<BarcodeSymbology, number>> = { "upc-a": 11, "ean-13": 12 };

type Fix = { value: string; kind: "loadSample" | "stripNonDigits" | "dropCheckDigit" | "removeUnsupported" | "truncate" };

/** The one repair that matches the mistake — offered only when the repaired value really encodes. */
function proposeFix(symbology: BarcodeSymbology, value: string, error: BarcodeErrorKey): Fix | null {
  let fix: Fix | null = null;
  if (error === "required") fix = { value: SAMPLE_VALUES[symbology], kind: "loadSample" };
  else if (symbology === "code128") {
    const kept = Array.from(value.trim()).filter((c) => /[\x20-\x7e]/.test(c)).join("");
    if (kept.length > 48) fix = { value: kept.slice(0, 48), kind: "truncate" };
    else if (kept && kept !== value.trim()) fix = { value: kept, kind: "removeUnsupported" };
  } else {
    const need = REQUIRED_DIGITS[symbology] ?? 0;
    const digits = value.replace(/\D/g, "");
    const check = symbology === "upc-a" ? upcCheck : eanCheck;
    if (digits.length === need && digits !== value.trim()) fix = { value: digits, kind: "stripNonDigits" };
    else if (digits.length === need + 1 && Number(digits[need]) === check(digits.slice(0, need))) fix = { value: digits.slice(0, need), kind: "dropCheckDigit" };
  }
  return fix && encode(symbology, fix.value) ? fix : null;
}

/** Index of the first character the symbology can't take (non-digit for EAN/UPC, non-ASCII for Code 128). */
function firstBad(symbology: BarcodeSymbology, value: string): number {
  const ok = symbology === "code128" ? (c: string) => /[\x20-\x7e]/.test(c) : (c: string) => /\d/.test(c);
  return Array.from(value).findIndex((c) => !ok(c));
}

/**
 * Invalid input, adapted from the json-formatter error panel: the typed value with the offending
 * character marked (caret), a length meter against the symbology's real limit, the reason in plain
 * words, a suggested fix, and an Auto-fix that only appears when its result really encodes.
 */
export default function BarcodeErrorPanel({
  symbology,
  value,
  error,
  message,
  onApplyFix,
}: {
  symbology: BarcodeSymbology;
  value: string;
  error: BarcodeErrorKey;
  message: string;
  onApplyFix: (v: string) => void;
}) {
  const t = useTranslations("tools.barcode-generator.aboveFold.errorPanel");
  const fix = useMemo(() => proposeFix(symbology, value, error), [symbology, value, error]);
  const chars = Array.from(value);
  const bad = firstBad(symbology, value);
  const limit = symbology === "code128" ? 48 : (REQUIRED_DIGITS[symbology] ?? 1);
  const have = symbology === "code128" ? chars.length : value.replace(/\D/g, "").length;
  const meterMax = Math.max(limit, have) * 1.15;
  const meterText =
    symbology === "code128" ? t("lengthMeterChars", { have: ltr(String(have)), limit: ltr(String(limit)) }) : t("lengthMeterDigits", { have: ltr(String(have)), limit: ltr(String(limit)) });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200" data-testid="bc-error-panel">
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
              ? t("emptyValue")
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
        <div className="mt-1.5 flex items-center gap-3" data-testid="bc-length-meter">
          <div dir="ltr" className="relative h-3 flex-1 rounded-full" style={{ background: "var(--glass-track)" }}>
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(Math.min(have, meterMax) / meterMax) * 100}%`, background: "var(--glass-danger-strong)" }} />
            <div className="absolute -inset-y-1 w-0.5 rounded" style={{ left: `${(limit / meterMax) * 100}%`, background: "var(--bc-ok)" }} />
          </div>
          <span className="shrink-0 text-xs font-semibold" style={{ color: "var(--ph-ink)" }}>
            {meterText}
          </span>
        </div>
      </div>

      <div dir="auto">
        <p>{t(`kind.${error}.explanation`)}</p>
        <p className="mt-1.5 font-semibold">
          {t("suggestionLabel")}: {t(`kind.${error}.suggestion`)}
        </p>
      </div>

      <div className="flex min-h-11 flex-wrap items-center gap-2">
        {fix ? (
          <>
            <button
              type="button"
              onClick={() => onApplyFix(fix.value)}
              data-testid="bc-error-autofix"
              className="flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition"
              style={{ background: "var(--glass-danger-strong)" }}
            >
              <Wand2 size={14} />
              {t(`fix.${fix.kind}`)}
            </button>
            <span dir="ltr" className="font-mono text-xs" style={{ color: "var(--ph-ink)" }}>
              → {fix.value}
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
