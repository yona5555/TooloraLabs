"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

const HARMONY_OFFSETS: { key: "complementary" | "analogous" | "triadic" | "splitComplementary" | "tetradic" | "monochromatic"; offsets: string }[] = [
  { key: "complementary", offsets: "180°" },
  { key: "analogous", offsets: "±30°" },
  { key: "triadic", offsets: "120°, 240°" },
  { key: "splitComplementary", offsets: "150°, 210°" },
  { key: "tetradic", offsets: "90°, 180°, 270°" },
  { key: "monochromatic", offsets: "20/35/50/65/80% L" },
];

export default function ColorPaletteQuickReference() {
  const t = useTranslations("tools.color-palette-generator.quickReference");
  const tHarmony = useTranslations("tools.color-palette-generator.form.harmony");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <dl className="mt-4 space-y-2 text-sm">
        {HARMONY_OFFSETS.map(({ key, offsets }) => (
          <div key={key} className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2 last:border-0 last:pb-0 dark:border-zinc-800">
            <dt className="text-zinc-600 dark:text-zinc-300">{tHarmony(key)}</dt>
            <dd dir="ltr" className="shrink-0 font-mono text-xs text-blue-700 dark:text-blue-300">
              {offsets}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
