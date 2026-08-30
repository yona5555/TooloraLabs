"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Share2, X, FileDown, Printer, Check, Copy } from "lucide-react";
import { generateToolPdf } from "@/lib/pdf/generateToolPdf";
import { WhatsAppIcon, XIcon, FacebookIcon, LinkedInIcon } from "@/lib/share-icons";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { BreakEvenMode } from "./types";

type Row = { label: string; value: string };

type BreakEvenShareExportModalProps = {
  mode: BreakEvenMode;
  inputRows: Row[];
  resultRows: Row[];
  heroLabel: string;
  heroValue: string;
  sentence: string;
};

export default function BreakEvenShareExportModal({ mode, inputRows, resultRows, heroLabel, heroValue, sentence }: BreakEvenShareExportModalProps) {
  const t = useTranslations("tools.break-even-calculator");
  const tActions = useTranslations("common.actions");
  const tShare = useTranslations("share");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "done">("idle");
  const [copied, setCopied] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactOrganization, setContactOrganization] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = sentence;

  const preparedForRows = [
    { label: t("shareExport.contactName"), value: contactName },
    { label: t("shareExport.contactEmail"), value: contactEmail },
    { label: t("shareExport.contactPhone"), value: contactPhone },
    { label: t("shareExport.contactOrganization"), value: contactOrganization },
    { label: t("shareExport.contactAddress"), value: contactAddress },
  ]
    .map((row) => ({ label: row.label, value: row.value.trim() }))
    .filter((row) => row.value.length > 0);

  async function handleDownloadPdf() {
    setPdfState("generating");
    try {
      await generateToolPdf({
        locale,
        toolName: `${t("title")} — ${t(`tabs.${mode}`)}`,
        inputs: inputRows,
        results: resultRows,
        preparedFor: preparedForRows,
        preparedForTitle: t("shareExport.preparedForTitle"),
        brandingEnhancements: true,
        filename: "break-even-calculator.pdf",
      });
      setPdfState("done");
      setTimeout(() => setPdfState("idle"), 1500);
    } catch {
      setPdfState("idle");
    }
  }

  function handlePrint() {
    setOpen(false);
    window.print();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in this context; nothing to recover
    }
  }

  const socialLinks = [
    { key: "whatsapp", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, Icon: WhatsAppIcon },
    { key: "twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, Icon: XIcon },
    { key: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, Icon: FacebookIcon },
    { key: "linkedin", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, Icon: LinkedInIcon },
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10 dark:text-zinc-100"
      >
        <Share2 size={14} />
        {t("shareExport.triggerLabel")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("shareExport.modalTitle")}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-blue-200 bg-white shadow-xl dark:border-blue-500/30 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-3 lg:px-6">
              <h2 className="font-bold text-white">{t("shareExport.modalTitle")}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={tActions("copy")}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 p-4 lg:p-6">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfState === "generating"}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-start transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
              >
                {pdfState === "done" ? (
                  <Check size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FileDown size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                )}
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {pdfState === "generating" ? tActions("generatingPdf") : pdfState === "done" ? tActions("downloaded") : tActions("downloadPdf")}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-start transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
              >
                <Printer size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{tActions("print")}</span>
              </button>

              <div className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <p className="mb-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200">{t("shareExport.shareToSocial")}</p>
                <div className="flex items-center gap-2">
                  {socialLinks.map(({ key, href, Icon }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={tShare(key)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-start transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
              >
                {copied ? <Check size={18} className="shrink-0 text-blue-600 dark:text-blue-400" /> : <Copy size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />}
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{copied ? tShare("copied") : tShare("copyLink")}</span>
              </button>

              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">{t("shareExport.contactSectionTitle")}</p>
                <div className="space-y-3">
                  <ToolInput label={t("shareExport.contactName")} type="text" placeholder={t("shareExport.contactNamePlaceholder")} value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  <ToolInput label={t("shareExport.contactEmail")} type="email" placeholder={t("shareExport.contactEmailPlaceholder")} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                  <ToolInput label={t("shareExport.contactPhone")} type="tel" placeholder={t("shareExport.contactPhonePlaceholder")} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                  <ToolInput
                    label={t("shareExport.contactOrganization")}
                    type="text"
                    placeholder={t("shareExport.contactOrganizationPlaceholder")}
                    value={contactOrganization}
                    onChange={(e) => setContactOrganization(e.target.value)}
                  />
                  <ToolInput label={t("shareExport.contactAddress")} type="text" placeholder={t("shareExport.contactAddressPlaceholder")} value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div data-print-area className="hidden bg-white p-8 text-black print:block">
        <div className="mb-6 flex items-center justify-between border-b-2 border-blue-600 pb-4">
          <div>
            <span className="text-xl font-bold text-zinc-900">Toolora</span>
            <span className="text-xl font-bold text-blue-600">Labs</span>
          </div>
          <p className="text-xs text-zinc-500">
            {t("shareExport.generatedOn")}: {new Date().toLocaleDateString(locale)}
          </p>
        </div>

        <h1 className="mb-4 text-xl font-bold text-zinc-900">
          {t("title")} — {t(`tabs.${mode}`)}
        </h1>

        <h2 className="mb-2 mt-6 text-sm font-bold text-blue-600">{t("form.inputTitle")}</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {inputRows.map((row) => (
              <tr key={row.label}>
                <td className="border border-zinc-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-900">{row.label}</td>
                <td className="border border-zinc-200 px-3 py-1.5">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mb-2 mt-6 text-sm font-bold text-blue-600">{t("aboveFold.resultTitle")}</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <td className="border border-zinc-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-900">{heroLabel}</td>
              <td className="border border-zinc-200 px-3 py-1.5 font-semibold">{heroValue}</td>
            </tr>
            {resultRows.map((row) => (
              <tr key={row.label}>
                <td className="border border-zinc-200 bg-blue-50 px-3 py-1.5 font-semibold text-blue-900">{row.label}</td>
                <td className="border border-zinc-200 px-3 py-1.5">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
