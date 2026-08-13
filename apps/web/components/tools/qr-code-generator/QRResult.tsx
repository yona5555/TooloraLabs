"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import CopyButton from "@/components/tool-ui/CopyButton";
import { embedCenterLogo } from "./qrLogoOverlay";
import type { QRLogoMode } from "./QRLogoPanel";

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

  const renderedSvg = useMemo(() => {
    if (!svg) return "";
    if (logoMode === "center" && logoDataUrl) return embedCenterLogo(svg, logoDataUrl);
    return svg;
  }, [svg, logoMode, logoDataUrl]);

  const showBesideLogo = logoMode === "beside" && logoDataUrl && svg;

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 [&_svg]:h-full [&_svg]:w-full">
            {renderedSvg ? (
              <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: renderedSvg }} />
            ) : (
              <p className="px-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
                {error || t("aboveFold.placeholder")}
              </p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("aboveFold.payloadTitle")}
            </p>
            <CopyButton text={payload} className="px-2 py-1.5 text-xs" />
          </div>
          <p dir="ltr" className="break-all rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            {payload}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
