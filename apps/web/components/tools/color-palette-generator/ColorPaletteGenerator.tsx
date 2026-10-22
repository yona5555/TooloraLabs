"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { generateRandomHex, isValidHex } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import ColorPaletteInputPanel from "./ColorPaletteInputPanel";
import ColorPaletteResult from "./ColorPaletteResult";
import ColorPaletteQuickReference from "./ColorPaletteQuickReference";
import { PALETTE_DEFAULTS, PALETTE_EXAMPLES, PaletteLiveProvider, type PaletteDraft } from "./PaletteLiveContext";

export default function ColorPaletteGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.color-palette-generator");
  const tNav = useTranslations("tools.color-palette-generator.nav");
  const tEx = useTranslations("tools.color-palette-generator.examples");
  const tHarmony = useTranslations("tools.color-palette-generator.form.harmony");
  const [draft, setDraft] = useState<PaletteDraft>(PALETTE_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("tailwind");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof PaletteDraft>(key: K, value: PaletteDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <PaletteLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <ColorPaletteInputPanel
                baseHex={draft.baseHex}
                onBaseHexChange={(v) => setDim("baseHex", v)}
                onRandomize={() => setDim("baseHex", generateRandomHex().toUpperCase())}
                harmony={draft.harmony}
                onHarmonyChange={(v) => setDim("harmony", v)}
                error={draft.baseHex && !isValidHex(draft.baseHex) ? t("form.invalidHex") : ""}
                onClear={() => {
                  setDraft(PALETTE_DEFAULTS);
                  setActiveExample("tailwind");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = PALETTE_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft({ baseHex: ex.baseHex, harmony: ex.harmony });
                  setActiveExample(id);
                }}
                examples={PALETTE_EXAMPLES.map((ex) => ({ id: ex.id, label: tEx(ex.id), detail: `${ex.baseHex} · ${tHarmony(ex.harmony)}` }))}
              />
            </div>
          }
          result={<ColorPaletteResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="color-palette-generator" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="color-palette-generator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <ColorPaletteQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </PaletteLiveProvider>
  );
}
