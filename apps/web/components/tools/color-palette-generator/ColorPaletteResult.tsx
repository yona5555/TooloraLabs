"use client";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { PaletteColor } from "@tooloralabs/tools";

type ColorPaletteResultProps = {
  palette: PaletteColor[];
};

function Swatch({ color }: { color: PaletteColor }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <div className="h-20 w-full" style={{ backgroundColor: color.hex }} />
      <div className="space-y-1.5 bg-zinc-50 p-3 dark:bg-zinc-800/60">
        {([color.hex, color.rgb, color.hsl] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => copy(value)}
            dir="ltr"
            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-start font-mono text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
          >
            <span className="truncate">{value}</span>
            {copied ? <Check size={13} className="shrink-0 text-green-600 dark:text-green-400" /> : <Copy size={13} className="shrink-0 opacity-50" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ColorPaletteResult({ palette }: ColorPaletteResultProps) {
  const t = useTranslations("tools.color-palette-generator");

  return (
    <SectionCard title={t("aboveFold.resultTitle")}>
      {palette.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {palette.map((color) => (
            <Swatch key={color.hex + color.hsl} color={color} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          {t("aboveFold.placeholder")}
        </p>
      )}
    </SectionCard>
  );
}
