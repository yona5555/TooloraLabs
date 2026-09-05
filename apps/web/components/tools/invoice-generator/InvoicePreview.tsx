"use client";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { InvoiceGeneratorOutput } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import InvoiceCompositionDonut from "./InvoiceCompositionDonut";
import InvoiceShareExportModal from "./InvoiceShareExportModal";

type InvoicePreviewProps = {
  result: InvoiceGeneratorOutput | null;
  errorMessage: string;
  digitStyle: DigitStyle;
  fromName: string;
  toName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  printRef: React.RefObject<HTMLDivElement | null>;
  onPrint: () => void;
};

export default function InvoicePreview({
  result,
  errorMessage,
  digitStyle,
  fromName,
  toName,
  invoiceNumber,
  issueDate,
  dueDate,
  printRef,
  onPrint,
}: InvoicePreviewProps) {
  const t = useTranslations("tools.invoice-generator");

  const money = (value: number) =>
    formatLocalizedNumber(value, digitStyle, {
      style: "currency",
      currency: result?.currency || "USD",
      maximumFractionDigits: 2,
    });

  const shareModal = result ? (
    <InvoiceShareExportModal
      onPrint={onPrint}
      inputRows={[
        { label: t("form.fromLabel"), value: fromName || "—" },
        { label: t("form.toLabel"), value: toName || "—" },
        { label: t("form.invoiceNumberLabel"), value: invoiceNumber || "—" },
        { label: t("form.issueDateLabel"), value: issueDate || "—" },
        { label: t("form.dueDateLabel"), value: dueDate || "—" },
      ]}
      resultRows={[
        { label: t("result.subtotal"), value: money(result.subtotal) },
        { label: t("result.discount"), value: `-${money(result.discountAmount)}` },
        { label: t("result.tax"), value: money(result.taxAmount) },
      ]}
      heroLabel={t("result.grandTotal")}
      heroValue={money(result.total)}
      sentence={t("aboveFold.sentence", { total: money(result.total), count: result.lines.length })}
    />
  ) : undefined;

  return (
    <SectionCard title={t("aboveFold.resultTitle")} action={shareModal}>
      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </p>
      ) : result ? (
        <div ref={printRef} data-print-area className="space-y-5">
          <div className="flex items-center justify-between print:hidden">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {invoiceNumber || t("aboveFold.noNumber")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("form.fromLabel")}</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{fromName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("form.toLabel")}</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{toName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("form.issueDateLabel")}</p>
              <p dir="ltr" className="text-zinc-700 dark:text-zinc-300">{issueDate || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("form.dueDateLabel")}</p>
              <p dir="ltr" className="text-zinc-700 dark:text-zinc-300">{dueDate || "—"}</p>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  <th className="py-2 text-start font-semibold">{t("result.item")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.quantity")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.unitPrice")}</th>
                  <th className="py-2 text-end font-semibold">{t("result.lineTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, index) => (
                  <tr key={index} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 text-zinc-900 dark:text-zinc-100">{line.description}</td>
                    <td className="py-2 text-end text-zinc-700 dark:text-zinc-300">{line.quantity}</td>
                    <td className="py-2 text-end text-zinc-700 dark:text-zinc-300">{money(line.unitPrice)}</td>
                    <td className="py-2 text-end font-medium text-zinc-900 dark:text-zinc-100">{money(line.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ms-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>{t("result.subtotal")}</span>
              <span>{money(result.subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>{t("result.discount")}</span>
              <span>-{money(result.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>{t("result.tax")}</span>
              <span>{money(result.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
              <span>{t("result.grandTotal")}</span>
              <span>{money(result.total)}</span>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-5 print:hidden dark:border-zinc-800">
            <InvoiceCompositionDonut
              centerValue={money(result.total)}
              centerLabel={t("result.grandTotal")}
              segments={[
                { key: "taxable", value: result.taxableAmount, label: t("result.taxableAmount"), colorClass: "stroke-zinc-400 dark:stroke-zinc-600" },
                { key: "tax", value: result.taxAmount, label: t("result.tax"), colorClass: "stroke-blue-600 dark:stroke-blue-400" },
              ]}
            />
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
