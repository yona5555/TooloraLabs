"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import QRShareExportModal from "./QRShareExportModal";
import { embedCenterLogo } from "./qrLogoOverlay";
import type { QRLogoMode } from "./QRLogoPanel";
import { QR_RECOVERY } from "@tooloralabs/tools";
import { useQRModel } from "./QRLiveContext";

type QRResultProps = {
  svg: string;
  payload: string;
  error: string;
  logoDataUrl: string | null;
  logoMode: QRLogoMode;
};

function download(svg: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "qr-code.svg";
  link.click();
  URL.revokeObjectURL(url);
}

export default function QRResult({ svg, payload, error, logoDataUrl, logoMode }: QRResultProps) {
  const t = useTranslations("tools.qr-code-generator");
  const tr = useTranslations("tools.qr-code-generator.result");
  const { a, f, pct } = useQRModel();

  const renderedSvg = useMemo(() => {
    if (!svg) return "";
    if (logoMode === "center" && logoDataUrl) return embedCenterLogo(svg, logoDataUrl);
    return svg;
  }, [svg, logoMode, logoDataUrl]);

  const showBesideLogo = logoMode === "beside" && logoDataUrl && svg;

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        payload ? (
          <QRShareExportModal
            operationLabel=""
            inputRows={[]}
            resultRows={[{ label: t("aboveFold.payloadTitle"), value: payload }]}
            heroLabel={t("aboveFold.payloadTitle")}
            heroValue={payload}
            sentence={t("shareExport.summarySentence", { payload })}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center justify-center gap-4">
          <div
            data-preview="visual"
            className="flex aspect-square w-full max-w-[320px] items-center justify-center rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 [&_svg]:h-full [&_svg]:w-full"
          >
            {renderedSvg ? (
              <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: renderedSvg }} />
            ) : (
              <p className="px-4 text-center text-sm text-zinc-400 dark:text-zinc-500">{error || t("aboveFold.placeholder")}</p>
            )}
          </div>

          {showBesideLogo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoDataUrl} alt={t("logo.previewAlt")} className="h-20 w-20 rounded-xl border border-zinc-200 object-contain p-2 dark:border-zinc-700" />
          )}
        </div>

        {renderedSvg && (
          <button
            type="button"
            onClick={() => download(renderedSvg)}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Download size={16} />
            {t("form.download")}
          </button>
        )}
      </div>

      {payload && (
        <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("aboveFold.payloadTitle")}</p>
            <CopyButton text={payload} className="px-2 py-1.5 text-xs" />
          </div>
          <p dir="ltr" className="break-all rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            {payload}
          </p>
        </div>
      )}

      {a && (
        <div className="mt-5 flex flex-col border-t border-zinc-200 pt-4 lg:flex-1 dark:border-zinc-800">
          <div className="mb-1 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>{tr("capacity")}</span>
            <span dir="ltr">
              {f(a.payloadBytes)} / {f(a.capacityAtVersion[a.level])} B
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div className="h-full rounded-full bg-blue-600 dark:bg-blue-400" style={{ width: pct(a.payloadBytes, a.capacityAtVersion[a.level]) }} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:flex-1 lg:content-evenly">
            {[
              { label: tr("version"), value: `v${a.version}` },
              { label: tr("grid"), value: `${a.size} × ${a.size}` },
              { label: tr("level"), value: `${a.level} · ${Math.round(QR_RECOVERY[a.level] * 100)}%` },
              { label: tr("mask"), value: String(a.mask) },
              { label: tr("codewords"), value: `${a.dataCodewords} + ${a.ecCodewords}` },
              { label: tr("dark"), value: pct(a.darkModules, a.size * a.size) },
            ].map((r) => (
              <div key={r.label} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                <dt className="text-xs text-zinc-500 dark:text-zinc-400">{r.label}</dt>
                <dd dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </SectionCard>
  );
}
