"use client";
import { useTranslations } from "next-intl";
import { hexToRgb, type PaletteColor } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { BLACK, contrast, WHITE } from "./paletteMath";

/** Each palette colour's real WCAG contrast on white and on black — the same framed card as every other card. */
export default function PaletteCheatSheet({ palette }: { palette: PaletteColor[] }) {
  const t = useTranslations("tools.color-palette-generator.sidebar.cheatSheet");
  return (
    <SectionCard title={t("title")} bodyClassName="p-0">
      <p className="px-4 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 lg:px-6">{t("contrastTitle")}</p>
      {palette.length > 0 ? (
        <ol className="px-4 pb-2 lg:px-6" data-testid="cp-contrast-list">
          {palette.map((p, i) => {
            const rgb = hexToRgb(p.hex) ?? WHITE;
            const w = contrast(rgb, WHITE);
            const b = contrast(rgb, BLACK);
            return (
              <li key={i} dir="ltr" className="flex h-5 items-center gap-2 text-xs leading-5">
                <span className="h-3 w-3 rounded-sm" style={{ background: p.hex, border: "1px solid var(--ph-line)" }} />
                <span className="font-mono text-zinc-700 dark:text-zinc-200">{p.hex}</span>
                <span className="ms-auto font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                  ◻ {w.toFixed(2)} · ◼ {b.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="px-4 pb-2 text-xs text-zinc-500 dark:text-zinc-400 lg:px-6">{t("contrastNone")}</p>
      )}
      <p dir="auto" className="border-t border-zinc-100 px-4 py-1.5 text-[11px] leading-4 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 lg:px-6">{t("note")}</p>
    </SectionCard>
  );
}
