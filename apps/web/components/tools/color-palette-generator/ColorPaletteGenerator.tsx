"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { generateColorPalette, generateRandomHex, isValidHex, type HarmonyType } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ColorPaletteInputPanel from "./ColorPaletteInputPanel";
import ColorPaletteResult from "./ColorPaletteResult";

const DEFAULTS = { baseHex: "#3B82F6", harmony: "complementary" as HarmonyType };

export default function ColorPaletteGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.color-palette-generator");
  const tNav = useTranslations("tools.color-palette-generator.nav");

  const [baseHex, setBaseHex] = useState(DEFAULTS.baseHex);
  const [harmony, setHarmony] = useState<HarmonyType>(DEFAULTS.harmony);

  const isValid = isValidHex(baseHex);

  const palette = useMemo(() => (isValid ? generateColorPalette(baseHex, harmony) : []), [baseHex, harmony, isValid]);

  function handleRandomize() {
    setBaseHex(generateRandomHex());
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <ColorPaletteInputPanel
              baseHex={baseHex}
              onBaseHexChange={setBaseHex}
              onRandomize={handleRandomize}
              harmony={harmony}
              onHarmonyChange={setHarmony}
              error={baseHex && !isValid ? t("form.invalidHex") : ""}
            />
          }
          result={<ColorPaletteResult palette={palette} />}
          sidebar={<RelatedToolsSidebar currentSlug="color-palette-generator" category="developer-tools" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
