"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { generateColorPalette, generateRandomHex, isValidHex, type HarmonyType } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import ColorPaletteInputPanel from "./ColorPaletteInputPanel";
import ColorPaletteResult from "./ColorPaletteResult";
import PaletteCheatSheet from "./PaletteCheatSheet";
import { SAMPLE_HEX } from "./paletteMath";

const DEFAULTS = { baseHex: SAMPLE_HEX, harmony: "complementary" as HarmonyType };

export default function ColorPaletteGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.color-palette-generator");
  const tNav = useTranslations("tools.color-palette-generator.nav");

  const [baseHex, setBaseHex] = useState(DEFAULTS.baseHex);
  const [harmony, setHarmony] = useState<HarmonyType>(DEFAULTS.harmony);
  // The colour the visitor chose (typed, picked, sampled) — the wheel's reset returns here.
  const [anchorHex, setAnchorHex] = useState(DEFAULTS.baseHex);

  const isValid = isValidHex(baseHex);
  const palette = useMemo(() => (isValid ? generateColorPalette(baseHex, harmony) : []), [baseHex, harmony, isValid]);

  function choose(hex: string) {
    setBaseHex(hex);
    setAnchorHex(hex);
  }

  function handleClear() {
    choose(DEFAULTS.baseHex);
    setHarmony(DEFAULTS.harmony);
  }

  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
        <div ref={navSentinelRef} aria-hidden="true" />
        <div id="tool" className="scroll-mt-32">
          <ToolAboveFold
            tight
            sidebarMatchRow
            input={
              <ColorPaletteInputPanel
                baseHex={baseHex}
                onBaseHexChange={choose}
                onRandomize={() => choose(generateRandomHex())}
                harmony={harmony}
                onHarmonyChange={setHarmony}
                error={!isValid ? t("form.invalidHex") : ""}
                onClear={handleClear}
                palette={palette}
                onPick={choose}
              />
            }
            result={
              <ColorPaletteResult
                baseHex={baseHex}
                anchorHex={anchorHex}
                harmony={harmony}
                palette={palette}
                isSample={baseHex.toLowerCase() === SAMPLE_HEX.toLowerCase()}
                errorMessage={t("form.invalidHex")}
                onRotate={setBaseHex}
                onApplyFix={choose}
              />
            }
            sidebar={<RelatedToolsSidebar fill fillContent={<PaletteCheatSheet palette={palette} />} currentSlug="color-palette-generator" category="developer-tools" />}
            secondary={
              <div className="flex flex-col gap-4">
                <ViewDocsLink slug="color-palette-generator" />
                <SectionNav items={navItems} visible={navBarVisible} />
              </div>
            }
          />
        </div>

        {education}
      </div>
    </GlassPage>
  );
}
