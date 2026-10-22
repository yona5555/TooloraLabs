"use client";
import { useTranslations } from "next-intl";
import type { HarmonyType } from "@tooloralabs/tools";

const HARMONY_OFFSETS: { key: HarmonyType; offsets: string }[] = [
  { key: "complementary", offsets: "180°" },
  { key: "analogous", offsets: "±30°" },
  { key: "triadic", offsets: "120°, 240°" },
  { key: "splitComplementary", offsets: "150°, 210°" },
  { key: "tetradic", offsets: "90°, 180°, 270°" },
  { key: "monochromatic", offsets: "20/35/50/65/80% L" },
];

/** The real hue offsets behind each harmony — in the input column, beside the harmony picker it explains. */
export default function ColorPaletteQuickReference({ harmony }: { harmony: HarmonyType }) {
  const t = useTranslations("tools.color-palette-generator.quickReference");
  const tHarmony = useTranslations("tools.color-palette-generator.form.harmony");

  return (
    <div data-testid="cp-angles">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("title")}</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl className="mt-2 overflow-hidden rounded-xl text-sm" style={{ border: "1px solid var(--ph-line)" }}>
        {HARMONY_OFFSETS.map(({ key, offsets }, i) => {
          const on = key === harmony;
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-3 px-3 py-1.5"
              style={{ background: on ? "var(--ph-accent-soft)" : undefined, borderTop: i ? "1px solid var(--ph-line)" : undefined }}
            >
              <dt className={on ? "font-semibold text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-300"}>{tHarmony(key)}</dt>
              <dd dir="ltr" className="shrink-0 font-mono text-xs text-blue-700 dark:text-blue-300">
                {offsets}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
