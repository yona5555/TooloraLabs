"use client";
import { useTranslations } from "next-intl";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";
import { Check, Copy } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import ColorPaletteShareExportModal from "./ColorPaletteShareExportModal";
import { usePaletteModel } from "./PaletteLiveContext";

function CopyValue({ value }: { value: string }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <ResultActionButton action="copy"
      type="button"
      onClick={() => copy(value)}
      dir="ltr"
      className="flex w-full items-center justify-between gap-2 rounded-md px-1.5 py-0.5 text-start font-mono text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
    >
      <span className="truncate">{value}</span>
      {copied ? <Check size={12} className="shrink-0 text-green-600 dark:text-green-400" /> : <Copy size={12} className="shrink-0 opacity-50" />}
    </ResultActionButton>
  );
}

/**
 * Result card: each colour as a full-width band carrying sample text in its best text colour with the
 * live WCAG contrast ratio and level, followed by its copyable HEX / RGB / HSL and its CIELAB values.
 */
export default function ColorPaletteResult() {
  const t = useTranslations("tools.color-palette-generator");
  const tr = useTranslations("tools.color-palette-generator.result");
  const { palette, a, f } = usePaletteModel();

  if (!a) {
    return (
      <SectionCard phoneRole="output" title={t("aboveFold.resultTitle")}>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">{t("form.invalidHex")}</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      phoneRole="output"
      title={t("aboveFold.resultTitle")}
      className="lg:flex lg:h-full lg:flex-col"
      bodyClassName="p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6"
      action={
        <ColorPaletteShareExportModal
          inputRows={[]}
          resultRows={palette.map((color, i) => ({ label: `${t("aboveFold.resultTitle")} ${i + 1}`, value: `${color.hex} — ${color.rgb} — ${color.hsl}` }))}
          heroLabel={t("form.baseColorLabel")}
          heroValue={palette[0]?.hex ?? ""}
          sentence={palette.map((color) => color.hex).join(", ")}
        />
      }
    >
      <div data-preview="visual" className="flex flex-col gap-3 lg:flex-1">
        {a.colors.map((c, i) => (
          <div key={i} className="flex min-h-24 flex-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex w-[46%] shrink-0 flex-col justify-between p-3" style={{ backgroundColor: c.hex, color: c.bestText === "white" ? "#fff" : "#000" }}>
              <span className="text-2xl leading-none font-bold">Aa</span>
              <span dir="ltr" className="font-mono text-xs font-semibold">
                {f(c.bestContrast, 2)}:1 · {c.level === "AA-large" ? tr("aaLarge") : c.level === "fail" ? tr("fail") : c.level}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 bg-zinc-50 p-2 dark:bg-zinc-800/60">
              <CopyValue value={palette[i].hex.toUpperCase()} />
              <CopyValue value={palette[i].rgb} />
              <CopyValue value={palette[i].hsl} />
              <p dir="ltr" className="px-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                L*{f(c.lab.L, 0)} a*{f(c.lab.a, 0)} b*{f(c.lab.b, 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">{tr("legend")}</p>
    </SectionCard>
  );
}
