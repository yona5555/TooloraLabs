"use client";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import type { BarcodeSymbology } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import { code128Steps, eanCheck, upcCheck } from "./barcodeMath";
import BarcodeTypesReference from "./BarcodeTypesReference";

/** Real values only: the tool's defaults and the codes from this page's own worked examples. */
const QUICK: { symbology: BarcodeSymbology; value: string }[] = [
  { symbology: "upc-a", value: "03600029145" },
  { symbology: "ean-13", value: "400638133393" },
  { symbology: "ean-13", value: "590123412345" },
  { symbology: "code128", value: "TOOLORA-2026" },
  { symbology: "code128", value: "A" },
];

type Part = { key: string; label: string; text: string; color: string; weight: number };

/** How the current value splits into the parts the symbol encodes (the same groups the tool prints). */
function partsOf(symbology: BarcodeSymbology, value: string, t: (k: string) => string): Part[] {
  const v = value.trim();
  if (symbology === "code128") {
    const n = Math.max(1, Array.from(v).length);
    return [
      { key: "start", label: t("partStart"), text: "104", color: "var(--bc-zone-guard)", weight: 1 },
      { key: "data", label: t("partData"), text: v || "…", color: "var(--bc-zone-maker)", weight: n },
      { key: "checksum", label: t("partChecksum"), text: v ? String(code128Steps(v).checksum) : "?", color: "var(--bc-zone-check)", weight: 1 },
      { key: "stop", label: t("partStop"), text: "106", color: "var(--bc-zone-guard)", weight: 1 },
    ];
  }
  const d = v.replace(/\D/g, "");
  const need = symbology === "upc-a" ? 11 : 12;
  const check = d.length === need ? String(symbology === "upc-a" ? upcCheck(d) : eanCheck(d)) : "?";
  const pad = (s: string, n: number) => (s + "·".repeat(n)).slice(0, n);
  const body = pad(d, need);
  if (symbology === "upc-a")
    return [
      { key: "system", label: t("partSystem"), text: body.slice(0, 1), color: "var(--bc-zone-system)", weight: 1 },
      { key: "left", label: t("partLeft"), text: body.slice(1, 6), color: "var(--bc-zone-maker)", weight: 5 },
      { key: "right", label: t("partRight"), text: body.slice(6, 11), color: "var(--bc-zone-product)", weight: 5 },
      { key: "check", label: t("partCheck"), text: check, color: "var(--bc-zone-check)", weight: 1 },
    ];
  return [
    { key: "first", label: t("partFirst"), text: body.slice(0, 1), color: "var(--bc-zone-system)", weight: 1 },
    { key: "left", label: t("partLeft"), text: body.slice(1, 7), color: "var(--bc-zone-maker)", weight: 6 },
    { key: "right", label: t("partRight"), text: body.slice(7, 12), color: "var(--bc-zone-product)", weight: 5 },
    { key: "check", label: t("partCheck"), text: check, color: "var(--bc-zone-check)", weight: 1 },
  ];
}

export default function BarcodeInputExtras({
  symbology,
  value,
  valid,
  onPick,
}: {
  symbology: BarcodeSymbology;
  value: string;
  valid: boolean;
  onPick: (symbology: BarcodeSymbology, value: string) => void;
}) {
  const t = useTranslations("tools.barcode-generator.form.extras");
  const tForm = useTranslations("tools.barcode-generator.form");
  const parts = partsOf(symbology, value, t);
  const total = parts.reduce((s, p) => s + p.weight, 0);
  const v = value.trim();
  const count = symbology === "code128" ? Array.from(v).length : v.replace(/\D/g, "").length;
  const limit = symbology === "upc-a" ? 11 : symbology === "ean-13" ? 12 : 48;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("quickSamplesTitle")}</h3>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => {
            const on = q.symbology === symbology && q.value === v;
            return (
              <button
                key={q.symbology + q.value}
                type="button"
                onClick={() => onPick(q.symbology, q.value)}
                className={`rounded-lg border px-3 py-1.5 text-start text-xs font-medium transition ${on ? "border-blue-500 text-blue-700 dark:text-blue-300" : "border-zinc-300 text-zinc-700 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-200"}`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wide opacity-70">{tForm(`symbology.${q.symbology}`)}</span>
                <span dir="ltr" className="font-mono">
                  {q.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div data-testid="bc-structure">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("structureTitle")}</h3>
        <div dir="ltr" className="flex h-9 w-full overflow-hidden rounded-lg" style={{ border: "1px solid var(--ph-line)" }}>
          {parts.map((p, i) => (
            <div
              key={p.key}
              className="flex min-w-0 items-center justify-center truncate px-1 font-mono text-xs font-bold"
              style={{ flexGrow: p.weight, flexBasis: 0, background: `color-mix(in oklab, ${p.color} 28%, transparent)`, color: "var(--ph-ink)", borderInlineStart: i === 0 ? "none" : "1px solid var(--ph-line)" }}
            >
              {p.text}
            </div>
          ))}
        </div>
        <div dir="ltr" className="mt-1.5 flex w-full gap-1">
          {parts.map((p) => (
            <div key={p.key} className="min-w-0 text-center text-[10px] leading-tight" style={{ flexGrow: Math.max(p.weight, 2), flexBasis: 0, color: "var(--ph-ink-muted)" }}>
              <span className="mx-auto mb-0.5 block h-1 w-4 rounded-full" style={{ background: p.color }} />
              <span dir="auto">{p.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px]" style={{ color: "var(--ph-ink-muted)" }}>
          {t("structureNote", { total: ltr(String(total)) })}
        </p>
      </div>

      <div
        data-testid="bc-status"
        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-4 py-2.5 text-xs font-semibold"
        style={{
          borderColor: valid ? "var(--glass-success-strong)" : "var(--glass-danger-strong)",
          background: valid ? "var(--glass-success-soft)" : "var(--glass-danger-soft)",
          color: valid ? "var(--glass-success-strong)" : "var(--glass-danger-strong)",
        }}
      >
        <span className="flex items-center gap-1.5">
          {valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {valid ? t("statusValid") : t("statusInvalid")}
        </span>
        <span className="tabular-nums" style={{ color: "var(--ph-ink)" }}>
          {symbology === "code128" ? t("statusChars", { n: ltr(String(count)), limit: ltr(String(limit)) }) : t("statusDigits", { n: ltr(String(count)), limit: ltr(String(limit)) })}
        </span>
      </div>

      <BarcodeTypesReference symbology={symbology} />
    </div>
  );
}
