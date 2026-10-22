"use client";
import { useTranslations } from "next-intl";
import { Hand } from "lucide-react";
import { generateColorPalette, hexToRgb, type HarmonyType, type PaletteColor } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { ltr } from "@/components/tool-ui/MixedText";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import JSONCodePanel from "@/components/tools/json-formatter/JSONCodePanel";
import ColorPaletteShareExportModal from "./ColorPaletteShareExportModal";
import PaletteWheel, { PaletteWheelEmpty } from "./PaletteWheel";
import PaletteErrorPanel from "./PaletteErrorPanel";
import PalettePreview from "./PalettePreview";
import { contrast, hsl, MONOCHROMATIC_LIGHTNESS, offsetsOf, SAMPLE_HEX, WHITE } from "./paletteMath";

/** The angle between neighbouring hues of each harmony (from the tool's own offsets). */
const HUE_STEP: Record<Exclude<HarmonyType, "monochromatic">, number> = { complementary: 180, analogous: 30, triadic: 120, splitComplementary: 150, tetradic: 90 };

type ColorPaletteResultProps = {
  baseHex: string;
  anchorHex: string;
  harmony: HarmonyType;
  palette: PaletteColor[];
  isSample: boolean;
  errorMessage: string;
  onRotate: (hex: string) => void;
  onApplyFix: (hex: string) => void;
};

/** The palette as JSON, one colour per line, so the list grows by exactly one row per colour. */
function paletteJson(harmony: HarmonyType, base: string, palette: PaletteColor[]): string {
  const c = hsl(base);
  const rgb = hexToRgb(base);
  const head = harmony === "monochromatic" ? `  "lightness": [${MONOCHROMATIC_LIGHTNESS.join(", ")}],` : `  "angles": [${offsetsOf(harmony).join(", ")}],`;
  return [
    "{",
    `  "harmony": "${harmony}",`,
    head,
    `  "base": "${base.toUpperCase()}",`,
    `  "rgb": "rgb(${rgb?.r}, ${rgb?.g}, ${rgb?.b})",`,
    `  "hsl": "hsl(${Math.round(c.h)}, ${Math.round(c.s)}%, ${Math.round(c.l)}%)",`,
    `  "colors": [`,
    ...palette.map((p, i) => `    "${p.hex}"${i < palette.length - 1 ? "," : ""}`),
    "  ]",
    "}",
  ].join("\n");
}

export default function ColorPaletteResult({ baseHex, anchorHex, harmony, palette, isSample, errorMessage, onRotate, onApplyFix }: ColorPaletteResultProps) {
  const t = useTranslations("tools.color-palette-generator");
  const tc = useTranslations("toolPage.indicatorKit");
  const isDark = useIsDarkMode();
  const valid = palette.length > 0;
  const base = baseHex.startsWith("#") ? baseHex : `#${baseHex}`;
  const sample = generateColorPalette(SAMPLE_HEX, "complementary");

  const c = valid ? hsl(base) : null;
  const baseContrast = valid ? contrast(hexToRgb(base) ?? WHITE, WHITE) : 0;
  const stats = c
    ? [
        { key: "angles", label: t("aboveFold.statAngles"), value: harmony === "monochromatic" ? `${MONOCHROMATIC_LIGHTNESS[1] - MONOCHROMATIC_LIGHTNESS[0]}% L` : `${HUE_STEP[harmony]}°` },
        { key: "count", label: t("aboveFold.statCount"), value: String(palette.length) },
        { key: "base", label: t("aboveFold.statBaseHsl"), value: `${Math.round(c.h)}° ${Math.round(c.s)}% ${Math.round(c.l)}%` },
        { key: "contrast", label: t("aboveFold.statContrast"), value: `${baseContrast.toFixed(2)}:1` },
      ]
    : [];

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="cp-result"
        title={t("aboveFold.resultTitle")}
        bodyClassName="flex flex-col gap-4 p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {valid && (
              <ColorPaletteShareExportModal
                inputRows={[]}
                resultRows={palette.map((color, i) => ({ label: `${t("aboveFold.resultTitle")} ${i + 1}`, value: `${color.hex} — ${color.rgb} — ${color.hsl}` }))}
                heroLabel={t("form.baseColorLabel")}
                heroValue={palette[0]?.hex ?? ""}
                sentence={palette.map((color) => color.hex).join(", ")}
              />
            )}
          </span>
        }
      >
        {valid ? (
          <>
            <span className="-mb-2 self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--ph-accent-soft)", color: "var(--ph-accent-strong)" }} data-testid="cp-sample-badge">
              {isSample ? t("aboveFold.sampleBadge") : t("aboveFold.customBadge")}
            </span>
            <PaletteWheel baseHex={base} anchorHex={anchorHex} harmony={harmony} palette={palette} onRotate={onRotate} />
            <PalettePreview palette={palette} />
            <JSONCodePanel text={paletteJson(harmony, base, palette)} filename="palette.json" theme={isDark ? "dark" : "light"} />
            <dl data-ph-result-values className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.key} className="rounded-xl bg-zinc-50 px-2 py-2.5 dark:bg-zinc-800/60">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</dt>
                  <dd dir="ltr" className="mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <>
            <PaletteWheelEmpty value={baseHex} />
            <PaletteErrorPanel value={baseHex} message={errorMessage} onApplyFix={onApplyFix} />
            <div className="flex flex-col gap-2" data-testid="cp-compare">
              <p dir="auto" className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--ph-ink-muted)" }}>
                {t("aboveFold.compareTitle")}
              </p>
              <p dir="auto" className="text-xs leading-5" style={{ color: "var(--ph-ink)" }}>
                {t("aboveFold.compareText", { sample: ltr(SAMPLE_HEX) })}
              </p>
              <div dir="ltr" className="flex h-11 overflow-hidden rounded-xl" style={{ border: "1px solid var(--ph-line)" }}>
                {sample.map((p) => (
                  <div key={p.hex} className="flex flex-1 items-center justify-center font-mono text-xs font-bold" style={{ background: p.hex, color: contrast(hexToRgb(p.hex) ?? WHITE, WHITE) >= 3 ? "var(--color-white)" : "var(--color-black)" }}>
                    {p.hex.toUpperCase()}
                  </div>
                ))}
              </div>
              <JSONCodePanel text={paletteJson("complementary", SAMPLE_HEX, sample)} filename="sample-palette.json" theme={isDark ? "dark" : "light"} />
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
