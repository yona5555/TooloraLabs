"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import BarcodeIndicatorCard, { BarcodeIndicatorUnavailable } from "./BarcodeIndicatorCard";
import { PARITY_FILL, ROLE_FILL, useBarcodeModel } from "./BarcodeLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 130;
const Y = 34;
const CELL_H = 40;

/**
 * Type #19 (Zone Strip): one cell per encoded character. For UPC/EAN each cell shows the code set it
 * was written in (L, G or R) — the hidden first EAN digit lives only in that L/G pattern. For Code 128
 * each cell shows the character's set-B value (ASCII − 32).
 */
export default function BarcodeParityStrip() {
  const t = useTranslations("tools.barcode-generator.education.lab.parity");
  const tg = useTranslations("tools.barcode-generator.education.lab.gs1Names");
  const { a, f } = useBarcodeModel();
  if (!a) return <BarcodeIndicatorUnavailable title={t("title")} />;

  const isCode128 = a.symbology === "code128";
  const cells = a.symbols.filter((s) => s.role !== "guard" && s.role !== "center" && s.role !== "start" && s.role !== "stop").slice(0, 16);
  const cw = W / cells.length;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {!isCode128 && a.symbology === "ean-13" && (
        <text style={{ fontSize: svgPx(12) }} x={0} y={16} fontWeight={700} className="fill-violet-700 dark:fill-violet-300">
          {t("hidden", { d: a.fullText[0], p: a.parityPattern ?? "" })}
        </text>
      )}
      {cells.map((s, i) => {
        const x = i * cw;
        const fill = isCode128 ? ROLE_FILL[s.role] : PARITY_FILL[s.parity ?? "L"];
        const code = isCode128 ? (s.role === "checksum" ? s.label : String(s.label.charCodeAt(0) - 32)) : s.parity;
        return (
          <g key={i}>
            <rect x={x + 1} y={Y} width={cw - 2} height={CELL_H} rx={5} className={fill} />
            <text style={{ fontSize: svgPx(Math.min(15, cw * 0.55)) }} x={x + cw / 2} y={Y + 26} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
              {code}
            </text>
            <text style={{ fontSize: svgPx(Math.min(14, cw * 0.6)) }}
              x={x + cw / 2}
              y={Y + CELL_H + 20}
              textAnchor="middle"
              fontWeight={600}
              fontFamily="var(--font-mono)"
              className="fill-zinc-700 dark:fill-zinc-200"
            >
              {s.role === "checksum" ? "✓" : s.label === " " ? "␣" : s.label}
            </text>
          </g>
        );
      })}
      {!isCode128 && (
        <text style={{ fontSize: svgPx(12) }} x={W / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {t("legend")}
        </text>
      )}
    </FitSvg>
  );

  const rows = isCode128
    ? [
        { label: t("set"), value: "B (ASCII 32–126)" },
        { label: t("first"), value: `"${a.fullText[0]}" → ${a.fullText.charCodeAt(0)} − 32 = ${a.fullText.charCodeAt(0) - 32}` },
        { label: t("chars"), value: f([...a.fullText].length) },
        { label: t("checksumValue"), value: String(a.check.check), emphasize: true },
      ]
    : [
        { label: t("left"), value: a.parityPattern ?? "" },
        { label: t("right"), value: "RRRRRR" },
        { label: t("firstDigit"), value: a.symbology === "ean-13" ? `${a.fullText[0]} (${a.parityPattern})` : t("upcFirst") },
        { label: t("prefix"), value: a.gs1 ? `${a.gs1.prefix} · ${tg(a.gs1.issuer)}` : "—" },
        { label: t("gtin"), value: a.symbology === "upc-a" ? `0${a.fullText}` : a.fullText, emphasize: true },
      ];

  return <BarcodeIndicatorCard title={t("title")} intro={t(isCode128 ? "introCode128" : "introEan")} indicator={svg} rows={rows} />;
}
