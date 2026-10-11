"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import DensityInputPanel from "./DensityInputPanel";
import DensityResult from "./DensityResult";
import DensityQuickReference from "./DensityQuickReference";
import DensityReferenceTable from "./DensityReferenceTable";
import { DENSITY_DEFAULTS, DensityLiveProvider, toInput, type DensityDraft } from "./DensityLiveContext";
import { MATERIAL_DENSITIES, MATERIAL_KEYS } from "./types";

const RELATED_TOOLS = ["molarity-calculator", "ideal-gas-law-calculator", "ohms-law-calculator", "volume-calculator"];

/** Every material preset is a real 100 cm³ sample: m = ρ × 100, so all three fields agree. */
const PRESET_VOLUME = 100;
const EXAMPLES = MATERIAL_KEYS.map((key) => {
  const density = MATERIAL_DENSITIES[key];
  return { id: key, values: { mass: toInput(density * PRESET_VOLUME), volume: String(PRESET_VOLUME), density: String(density) } };
});

export default function DensityCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.density-calculator");
  const tNav = useTranslations("tools.density-calculator.nav");
  const tMaterials = useTranslations("tools.density-calculator.materials");
  const tCommon = useTranslations("common.live3d");

  const [draft, setDraft] = useState<DensityDraft>(DENSITY_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const [navBarVisible, setNavBarVisible] = useState(false);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerSentinelRef.current;
    if (!el) return;

    let isVisible = false;

    const showObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !isVisible) {
          isVisible = true;
          setNavBarVisible(true);
        }
      },
      { rootMargin: "-88px 0px 0px 0px", threshold: 0 }
    );
    const hideObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isVisible) {
          isVisible = false;
          setNavBarVisible(false);
        }
      },
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 }
    );

    showObserver.observe(el);
    hideObserver.observe(el);
    return () => {
      showObserver.disconnect();
      hideObserver.disconnect();
    };
  }, []);

  function setDim<K extends keyof DensityDraft>(key: K, value: DensityDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key !== "operation") setActiveExample(null);
  }

  function handlePick(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setDraft((d) => ({ ...d, ...ex.values }));
    setActiveExample(id);
  }

  function handleClear() {
    setDraft(DENSITY_DEFAULTS);
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <DensityLiveProvider value={{ dims: draft, setDim }}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <DensityInputPanel draft={draft} onChange={setDim} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={EXAMPLES.map((e) => ({
                  id: e.id,
                  label: tMaterials(e.id),
                  detail: `ρ = ${e.values.density} g/cm³ · V = ${e.values.volume} cm³ · m = ${e.values.mass} g`,
                }))}
              />
            </div>
          }
          result={<DensityResult />}
          sidebar={
            <RelatedToolsSidebar fill currentSlug="density-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="density-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <DensityQuickReference />
              <DensityReferenceTable />
            </div>
          }
        />
      </div>

      {education}
    </DensityLiveProvider>
  );
}
