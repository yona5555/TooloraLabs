"use client";
import { useTranslations } from "next-intl";
import { hexToRgb, type PaletteColor } from "@tooloralabs/tools";
import { BLACK, contrast, WHITE } from "./paletteMath";

const inkOn = (hex: string) => {
  const rgb = hexToRgb(hex) ?? WHITE;
  return contrast(rgb, WHITE) >= contrast(rgb, BLACK) ? "var(--color-white)" : "var(--color-black)";
};

/** The real palette applied to a miniature page: header, heading, body text, a button and links. */
export default function PalettePreview({ palette }: { palette: PaletteColor[] }) {
  const t = useTranslations("tools.color-palette-generator.aboveFold.preview");
  const c0 = palette[0].hex;
  const c1 = palette[1]?.hex ?? palette[palette.length - 1].hex;
  const last = palette[palette.length - 1].hex;
  return (
    <div data-testid="cp-preview">
      <p dir="auto" className="mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
        {t("title")}
      </p>
      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ph-line)", background: "var(--ph-surface)" }}>
        <div className="flex items-center justify-between px-3 py-2 text-xs font-bold" style={{ background: c0, color: inkOn(c0) }}>
          <span dir="auto">{t("brand")}</span>
          <span dir="auto" className="opacity-90">
            {t("nav")}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 px-3 py-2.5">
          <p dir="auto" className="text-sm font-extrabold" style={{ color: c0 }}>
            {t("heading")}
          </p>
          <p dir="auto" className="text-xs leading-5" style={{ color: "var(--ph-ink)" }}>
            {t("body")}{" "}
            <span className="font-semibold underline" style={{ color: last, textDecorationColor: last }}>
              {t("link")}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: c1, color: inkOn(c1) }}>
              {t("button")}
            </span>
            <span className="rounded-lg border px-3 py-1.5 text-xs font-bold" style={{ borderColor: c0, color: c0 }}>
              {t("secondary")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
