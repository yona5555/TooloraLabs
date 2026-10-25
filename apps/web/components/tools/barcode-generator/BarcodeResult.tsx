"use client";
import { useRef } from "react";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";
import { useTranslations } from "next-intl";
import { AlertTriangle, Download } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import BarcodeSVG from "./BarcodeSVG";
import BarcodeShareExportModal from "./BarcodeShareExportModal";
import { ROLE_FILL, useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const ERROR_KEYS: Record<string, string> = {
  EMPTY_INPUT: "required",
  INVALID_LENGTH_UPC: "invalidLengthUpc",
  INVALID_LENGTH_EAN: "invalidLengthEan",
  NON_DIGIT: "nonDigit",
  UNSUPPORTED_CHARACTER: "unsupportedCharacter",
  TOO_LONG: "tooLong",
};

const MODULE_W = 2;
const LOGO_EXTRA = 106;

/**
 * Result card: the scannable barcode (exported as-is), then a live anatomy strip drawn on the same
 * module scale — each symbol coloured by role (guards, left/right data, check) and labelled with the
 * character it carries — and the key facts of the symbol read from the analysis.
 */
export default function BarcodeResult() {
  const t = useTranslations("tools.barcode-generator");
  const tr = useTranslations("tools.barcode-generator.result");
  const tg = useTranslations("tools.barcode-generator.education.lab.gs1Names");
  const { draft, output, error, a, f, pct } = useBarcodeModel();
  const containerRef = useRef<HTMLDivElement>(null);
  const symbologyLabel = t(`form.symbology.${draft.symbology}`);

  function download() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "barcode.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (error || !a) {
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")}>
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{t(`errors.${ERROR_KEYS[error] ?? "required"}`)}</p>
        </div>
      </SectionCard>
    );
  }

  const q = output.quietZoneModules;
  const showLogo = draft.logoPlacement === "beside" && !!draft.logoDataUrl;
  const totalW = (a.modules + q * 2) * MODULE_W + (showLogo ? LOGO_EXTRA : 0);
  const stripH = 46;
  const isCode128 = a.symbology === "code128";
  const size = a.sizes[1];

  const rows = [
    { label: tr("full"), value: a.fullText },
    { label: isCode128 ? tr("checksum") : tr("checkDigit"), value: isCode128 ? `${f(a.check.sum)} mod 103 = ${a.check.check}` : `(10 − ${a.check.remainder}) mod 10 = ${a.check.check}` },
    { label: tr("modules"), value: `${f(a.modules)} · ${tr("bars", { n: a.bars })}` },
    { label: tr("ink"), value: pct(a.darkModules, a.modules) },
    { label: isCode128 ? tr("sizeAtX", { x: f(size.x, 2) }) : tr("sizeNominal"), value: `${f(size.widthMm, 1)} × ${f(size.heightMm, 1)} mm` },
    ...(a.gs1 ? [{ label: tr("gs1"), value: `${a.gs1.prefix} · ${tg(a.gs1.issuer)}` }] : [{ label: tr("chars"), value: f([...a.fullText].length) }]),
  ];

  return (
    <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")} className="lg:flex lg:h-full lg:flex-col" bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6">
      <div ref={containerRef} dir="ltr" data-preview="visual" className="w-full rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700">
        <BarcodeSVG segments={output.segments} displayText={output.displayText} quietZoneModules={q} logoDataUrl={draft.logoDataUrl} logoPlacement={draft.logoPlacement} />
      </div>

      <div dir="ltr" className="mt-2 px-4">
        <svg viewBox={`0 0 ${totalW} ${stripH}`} role="img" aria-label={tr("stripAria")} className="h-auto w-full" style={{ minWidth: 260 }}>
          <rect x={0} y={4} width={q * MODULE_W - 2} height={10} rx={3} className="fill-zinc-200 dark:fill-zinc-700" />
          <rect x={(q + a.modules) * MODULE_W + 2} y={4} width={q * MODULE_W - 2} height={10} rx={3} className="fill-zinc-200 dark:fill-zinc-700" />
          {a.symbols.map((s, i) => {
            const x = (q + s.start) * MODULE_W;
            const w = s.bits.length * MODULE_W;
            const showLabel = s.label && s.role !== "start" && s.role !== "stop";
            return (
              <g key={i}>
                <rect x={x + 0.6} y={4} width={w - 1.2} height={10} rx={3} className={ROLE_FILL[s.role]} />
                {showLabel && (
                  <text style={{ fontSize: svgPx(Math.min(14, w * 0.9)) }} x={x + w / 2} y={34} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
                    {s.label === " " ? "␣" : s.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {(isCode128 ? (["start", "data", "checksum"] as const) : (["guard", "left", "right", "check"] as const)).map((role) => (
            <span key={role} className="inline-flex items-center gap-1.5">
              <svg width={10} height={10} aria-hidden="true">
                <circle cx={5} cy={5} r={5} className={ROLE_FILL[role]} />
              </svg>
              {tr(`role.${role}`)}
            </span>
          ))}
        </div>
      </div>

      <dl className="mt-4 space-y-2 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800/40">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-zinc-500 dark:text-zinc-400">{r.label}</dt>
            <dd dir="ltr" className="text-end font-mono font-semibold text-zinc-800 dark:text-zinc-100">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-zinc-200 lg:max-h-none lg:min-h-[10rem] lg:flex-1 lg:basis-0 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-100 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-start font-semibold">{tr("colSymbol")}</th>
              <th className="px-3 py-2 text-start font-semibold">{tr("colRole")}</th>
              <th className="px-3 py-2 text-center font-semibold">{tr("colSet")}</th>
              <th className="px-3 py-2 text-end font-semibold">{tr("colWidths")}</th>
            </tr>
          </thead>
          <tbody>
            {a.symbols.map((s, i) => (
              <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-2 font-mono font-bold text-zinc-800 dark:text-zinc-100">
                    <svg width={8} height={8} aria-hidden="true">
                      <circle cx={4} cy={4} r={4} className={ROLE_FILL[s.role]} />
                    </svg>
                    {s.label === " " ? "␣" : s.label || "|"}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-300">{tr(`role.${s.role}`)}</td>
                <td className="px-3 py-1.5 text-center font-mono text-zinc-600 dark:text-zinc-300">{s.parity ?? (isCode128 && s.role === "data" ? s.label.charCodeAt(0) - 32 : "—")}</td>
                <td dir="ltr" className="px-3 py-1.5 text-end font-mono text-zinc-700 dark:text-zinc-200">
                  {s.widths.join("-")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full items-center gap-2">
        <ResultActionButton action="download"
          type="button"
          onClick={download}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <Download size={16} />
          {t("form.download")}
        </ResultActionButton>
        <BarcodeShareExportModal
          operationLabel={symbologyLabel}
          inputRows={[{ label: t("form.valueLabel"), value: output.displayText }]}
          resultRows={[
            { label: t("form.valueLabel"), value: output.displayText },
            { label: t("shareExport.quietZone"), value: String(q) },
          ]}
          heroLabel={t("form.valueLabel")}
          heroValue={output.displayText}
          sentence={`${symbologyLabel} barcode encoding "${output.displayText}".`}
        />
      </div>
    </SectionCard>
  );
}
