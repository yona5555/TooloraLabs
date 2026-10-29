"use client";
import { useTranslations } from "next-intl";
import { contrastRatio, wcagLevel, type WcagLevel } from "@tooloralabs/tools";
import PaletteIndicatorCard, { PaletteIndicatorUnavailable } from "./PaletteIndicatorCard";
import { usePaletteModel } from "./PaletteLiveContext";

const LEVEL_CLS: Record<WcagLevel, string> = {
  AAA: "bg-emerald-600 text-white dark:bg-emerald-500",
  AA: "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100",
  "AA-large": "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100",
  fail: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
};

/**
 * Type #17 (Tagged Reference Table): the WCAG 2.x contrast ratio of every colour pair in the
 * palette — plus white and black — each cell tagged with the level it reaches as text on background.
 */
export default function PaletteContrastMatrix() {
  const t = useTranslations("tools.color-palette-generator.education.lab.matrix");
  const { a, f } = usePaletteModel();
  if (!a) return <PaletteIndicatorUnavailable title={t("title")} />;

  const axis = [...a.colors.map((c) => ({ hex: c.hex, rgb: c.rgb })), { hex: "#ffffff", rgb: { r: 255, g: 255, b: 255 } }, { hex: "#000000", rgb: { r: 0, g: 0, b: 0 } }];
  const levelLabel = (l: WcagLevel) => (l === "AA-large" ? t("large") : l === "fail" ? "✕" : l);

  const table = (
    <div dir="ltr" className="w-[340px] max-w-full overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <td />
            {axis.map((c, j) => (
              <th key={j} className="pb-1">
                <span className="mx-auto block h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: c.hex }} />
                <span className="sr-only">{c.hex}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {a.colors.map((row, i) => (
            <tr key={i}>
              <th className="pe-1">
                <span className="block h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: row.hex }} />
                <span className="sr-only">{row.hex}</span>
              </th>
              {axis.map((col, j) => {
                if (j === i)
                  return (
                    <td key={j} className="rounded-md bg-zinc-100 py-1.5 text-zinc-400 dark:bg-zinc-800">
                      —
                    </td>
                  );
                const r = contrastRatio(row.rgb, col.rgb);
                const l = wcagLevel(r);
                return (
                  <td key={j} className={`rounded-md py-1 font-mono ${LEVEL_CLS[l]}`}>
                    <span className="block font-bold">{f(r, 1)}</span>
                    <span className="block text-xs">{levelLabel(l)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const best = [...a.pairs].sort((x, y) => y.contrast - x.contrast)[0];
  const passing = a.pairs.filter((p) => p.contrast >= 4.5).length;
  return (
    <PaletteIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={table}
      rows={[
        { label: t("pairs"), value: f(a.pairs.length) },
        { label: t("passing"), value: `${f(passing)} / ${f(a.pairs.length)}` },
        { label: t("best"), value: best ? `${best.i + 1} ↔ ${best.j + 1} · ${f(best.contrast, 2)}:1` : "—" },
        { label: t("formula"), value: "(L1 + 0.05) / (L2 + 0.05)" },
        { label: t("bestText"), value: a.colors.map((c, i) => `${i + 1}:${c.bestText === "white" ? t("white") : t("black")}`).join(" "), emphasize: true },
      ]}
    />
  );
}
