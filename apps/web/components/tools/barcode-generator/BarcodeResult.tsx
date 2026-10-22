"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Download, Hand } from "lucide-react";
import type { BarcodeOutput, BarcodeSymbology } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ltr } from "@/components/tool-ui/MixedText";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import JSONCodePanel from "@/components/tools/json-formatter/JSONCodePanel";
import BarcodeScene from "./BarcodeScene";
import BarcodeErrorPanel, { type BarcodeErrorKey } from "./BarcodeErrorPanel";
import BarcodeShareExportModal from "./BarcodeShareExportModal";
import { code128Steps, encode, fullDigits, GS1_X_MM, SAMPLE_VALUES, symbolPatterns, totalModules } from "./barcodeMath";

type BarcodeResultProps = {
  symbology: BarcodeSymbology;
  value: string;
  output: BarcodeOutput | null;
  errorKey: BarcodeErrorKey | null;
  errorMessage: string;
  logoDataUrl: string | null;
  logoPlacement: "beside" | "none";
  symbologyLabel: string;
  isSample: boolean;
  onApplyFix: (v: string) => void;
};

/** The decoded scan as JSON: what a scanner would report for this value (same shape for the comparison sample). */
function scanJsonOf(symbology: BarcodeSymbology, label: string, v: string, out: BarcodeOutput): string {
  const modules = totalModules(out.segments);
  const full = symbology === "code128" ? "" : fullDigits(symbology, v);
  const check = symbology === "code128" ? code128Steps(v).checksum : Number(full.slice(-1));
  return JSON.stringify(
    {
      symbology: label,
      value: v,
      ...(symbology === "code128" ? { checksum: check } : { fullCode: full, checkDigit: check }),
      modules,
      quietZoneModules: out.quietZoneModules,
      bars: out.segments.filter((x) => x.filled).length,
      widthAt100PercentMm: Number(((modules + out.quietZoneModules * 2) * GS1_X_MM).toFixed(2)),
      symbols: symbolPatterns(symbology, v),
    },
    null,
    2,
  );
}

export default function BarcodeResult({ symbology, value, output, errorKey, errorMessage, logoDataUrl, logoPlacement, symbologyLabel, isSample, onApplyFix }: BarcodeResultProps) {
  const t = useTranslations("tools.barcode-generator");
  const tc = useTranslations("toolPage.indicatorKit");
  const labelRef = useRef<HTMLDivElement>(null);
  const isDark = useIsDarkMode();

  function download() {
    const svg = labelRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-overlay]").forEach((el) => el.remove());
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "barcode.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  const trimmed = value.trim();
  const sample = SAMPLE_VALUES[symbology];
  const sampleOut = encode(symbology, sample);
  const sampleJson = sampleOut ? scanJsonOf(symbology, symbologyLabel, sample, sampleOut) : "";
  const modules = output ? totalModules(output.segments) : 0;
  const bars = output ? output.segments.filter((s) => s.filled).length : 0;
  const full = output && symbology !== "code128" ? fullDigits(symbology, trimmed) : "";
  const check = symbology === "code128" ? code128Steps(trimmed).checksum : Number(full.slice(-1));
  const widthMm = output ? (modules + output.quietZoneModules * 2) * GS1_X_MM : 0;
  const scanJson = output ? scanJsonOf(symbology, symbologyLabel, trimmed, output) : "";

  let working = "";
  if (output && symbology === "code128") {
    const c = code128Steps(trimmed);
    working = `104 + Σ (value × position) = ${c.sum} → ${c.sum} mod 103 = ${c.checksum}`;
  } else if (output) {
    const d = full.slice(0, -1);
    const oddSum = d.split("").filter((_, i) => i % 2 === 0).reduce((a, x) => a + Number(x), 0);
    const evenSum = d.split("").filter((_, i) => i % 2 === 1).reduce((a, x) => a + Number(x), 0);
    const total = symbology === "upc-a" ? 3 * oddSum + evenSum : oddSum + 3 * evenSum;
    working =
      symbology === "upc-a"
        ? `3 × ${oddSum} + ${evenSum} = ${total} → (10 − ${total % 10}) mod 10 = ${check}`
        : `${oddSum} + 3 × ${evenSum} = ${total} → (10 − ${total % 10}) mod 10 = ${check}`;
  }

  const stats = [
    { key: "modules", label: t("aboveFold.statModules"), value: String(modules) },
    { key: "bars", label: t("aboveFold.statBars"), value: String(bars) },
    { key: "check", label: symbology === "code128" ? t("aboveFold.statChecksum") : t("aboveFold.statCheckDigit"), value: String(check) },
    { key: "width", label: t("aboveFold.statWidth"), value: `${widthMm.toFixed(1)} mm` },
  ];

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="bc-result"
        title={t("aboveFold.resultTitle")}
        bodyClassName="flex flex-col gap-4 p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {output && (
              <BarcodeShareExportModal
                operationLabel={symbologyLabel}
                inputRows={[{ label: t("form.valueLabel"), value: output.displayText }]}
                resultRows={[
                  { label: t("form.valueLabel"), value: output.displayText },
                  { label: t("shareExport.quietZone"), value: String(output.quietZoneModules) },
                ]}
                heroLabel={t("form.valueLabel")}
                heroValue={output.displayText}
                sentence={`${symbologyLabel} barcode encoding "${output.displayText}".`}
              />
            )}
          </span>
        }
      >
        {output && (
          <span className="-mb-2 self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--ph-accent-soft)", color: "var(--ph-accent-strong)" }} data-testid="bc-sample-badge">
            {isSample ? t("aboveFold.sampleBadge") : t("aboveFold.customBadge")}
          </span>
        )}
        <BarcodeScene key={symbology} symbology={symbology} value={value} output={output} logoDataUrl={logoDataUrl} logoPlacement={logoPlacement} labelRef={labelRef} />

        {output ? (
          <>
            <JSONCodePanel text={scanJson} filename="scan.json" theme={isDark ? "dark" : "light"} />
            <div className="rounded-xl px-4 py-3" style={{ background: "var(--glass-table-wrap-bg)" }} data-testid="bc-working">
              <p dir="auto" className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
                {symbology === "code128" ? t("aboveFold.workingChecksum") : t("aboveFold.workingCheckDigit")}
              </p>
              <p dir="ltr" className="mt-1 font-mono text-sm font-semibold" style={{ color: "var(--ph-ink)" }}>
                {working}
              </p>
              <p dir="auto" className="mt-1 text-xs" style={{ color: "var(--ph-ink-muted)" }}>
                {symbology === "code128" ? t("aboveFold.workingChecksumNote") : symbology === "upc-a" ? t("aboveFold.workingUpcNote") : t("aboveFold.workingEanNote")}
              </p>
            </div>
            <dl data-ph-result-values className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.key} className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</dt>
                  <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={download}
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <Download size={16} />
              {t("form.download")}
            </button>
          </>
        ) : (
          errorKey && (
            <>
              <BarcodeErrorPanel symbology={symbology} value={value} error={errorKey} message={errorMessage} onApplyFix={onApplyFix} />
              <div className="flex flex-col gap-2" data-testid="bc-compare">
                <p dir="auto" className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
                  {t("aboveFold.compareTitle", { symbology: symbologyLabel })}
                </p>
                <p dir="auto" className="text-xs leading-5" style={{ color: "var(--ph-ink)" }}>
                  {symbology === "code128"
                    ? t("aboveFold.compareChars", { have: ltr(String(Array.from(trimmed).length)), sample: ltr(sample), n: ltr(String(sample.length)), check: ltr(String(code128Steps(sample).checksum)) })
                    : t("aboveFold.compareDigits", {
                        have: ltr(String(trimmed.replace(/\D/g, "").length)),
                        need: ltr(String(sample.length)),
                        sample: ltr(sample),
                        check: ltr(fullDigits(symbology, sample).slice(-1)),
                      })}
                </p>
                <JSONCodePanel text={sampleJson} filename={`sample-${symbology}.json`} theme={isDark ? "dark" : "light"} />
              </div>
            </>
          )
        )}
      </SectionCard>
    </div>
  );
}
