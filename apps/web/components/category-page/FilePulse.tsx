import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The file section's indicators, computed here from the formats' definitions: GiB vs GB (2³⁰ vs
 * 10⁹), A4 in PDF points (mm ÷ 25.4 × 72), the classic ZIP size limit (32-bit fields, 2³² − 1), plus
 * the characters Windows forbids in file names and RFC 4180's CSV line ending. Fixed, no request.
 */
const GIB = 2 ** 30;
const GIB_GAP = (GIB / 1e9 - 1) * 100;
const pt = (mm: number) => (mm / 25.4) * 72;
const ZIP_MAX = 2 ** 32 - 1;

export default async function FilePulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.file" });
  const n = (v: number) => new Intl.NumberFormat(`${locale}-u-nu-latn`).format(v);
  const ltr = (s: string) => <span dir="ltr">{s}</span>;

  const items: IndicatorItem[] = [
    { id: "gib", href: "/tools/file-size-converter", label: t("gib"), value: ltr(`+${GIB_GAP.toFixed(2)}%`), note: t("gibNote", { bytes: n(GIB) }) },
    { id: "a4", href: "/tools/pdf-merge-split", label: t("a4"), value: ltr(`${pt(210).toFixed(2)} × ${pt(297).toFixed(2)} pt`), note: t("a4Note") },
    { id: "zip", href: "/tools/zip-compressor", label: t("zip"), value: t("zipValue", { bytes: n(ZIP_MAX) }), note: t("zipNote") },
    { id: "names", href: "/tools/file-name-sanitizer", label: t("names"), value: ltr('\\ / : * ? " < > |'), note: t("namesNote") },
    { id: "csv", href: "/tools/csv-json-converter", label: t("csv"), value: ltr("RFC 4180 · CRLF"), note: t("csvNote") },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
