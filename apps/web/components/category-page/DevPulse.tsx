import { getTranslations } from "next-intl/server";
import IndicatorStrip, { type IndicatorItem } from "./IndicatorStrip";

/**
 * The developer section's indicators, computed here from the formats' definitions: password entropy
 * L·log₂(N) for 16 printable-ASCII characters, Base64's 4-per-3 size growth (checked on "Man"), the
 * EAN-13 check digit of GS1's sample number, the 24-bit hex colour space, plus the ISO/IEC 18004
 * maximum QR capacity. Fixed inputs, no request.
 */
const PRINTABLE_ASCII = 126 - 33 + 1; // "!" to "~"
const PASSWORD_BITS = 16 * Math.log2(PRINTABLE_ASCII);
const BASE64_SAMPLE = Buffer.from("Man").toString("base64");
const BASE64_GROWTH = (4 / 3 - 1) * 100;
const HEX_COLOURS = 256 ** 3;

/** EAN-13 check digit: weights 1,3,1,3… over the first 12 digits, then (10 − sum mod 10) mod 10. */
function ean13Check(first12: string) {
  const sum = [...first12].reduce((s, d, i) => s + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}
const EAN_BODY = "590123412345";

export default async function DevPulse({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categoryPulse.dev" });
  const n = (v: number) => new Intl.NumberFormat(`${locale}-u-nu-latn`).format(v);
  const ltr = (s: string) => <span dir="ltr">{s}</span>;

  const items: IndicatorItem[] = [
    { id: "entropy", href: "/tools/password-generator", label: t("entropy"), value: ltr(`${PASSWORD_BITS.toFixed(1)} bits`), note: t("entropyNote", { chars: PRINTABLE_ASCII }) },
    { id: "base64", href: "/tools/base64-tool", label: t("base64"), value: ltr(`Man → ${BASE64_SAMPLE} · +${BASE64_GROWTH.toFixed(1)}%`), note: t("base64Note") },
    { id: "ean", href: "/tools/barcode-generator", label: t("ean"), value: ltr(`${EAN_BODY}${ean13Check(EAN_BODY)}`), note: t("eanNote", { digit: ean13Check(EAN_BODY) }) },
    { id: "hex", href: "/tools/color-palette-generator", label: t("hex"), value: ltr(n(HEX_COLOURS)), note: t("hexNote") },
    { id: "qr", href: "/tools/qr-code-generator", label: t("qr"), value: t("qrValue", { bytes: n(2953) }), note: t("qrNote") },
  ];
  return <IndicatorStrip label={t("label")} items={items} />;
}
