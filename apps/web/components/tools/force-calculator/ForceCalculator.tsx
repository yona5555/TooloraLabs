"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import ForceInputPanel from "./ForceInputPanel";
import ForceResult from "./ForceResult";
import ForceQuickReference from "./ForceQuickReference";
import ForceReferenceTable from "./ForceReferenceTable";
import { FORCE_DEFAULTS, ForceLiveProvider, type ForceDraft } from "./ForceLiveContext";
import type { ForceMode } from "./types";

const RELATED_TOOLS = ["kinematics-calculator", "energy-work-power-calculator", "projectile-motion-calculator", "ohms-law-calculator"];

type NumericInputs = Pick<ForceDraft, "force" | "mass" | "acceleration" | "mass1" | "mass2" | "distance">;

// Real, mode-specific everyday and astronomical scenarios, each internally
// consistent with F = ma (secondLaw) or realistic mass/distance pairs
// (gravitation).
const SCENARIOS_BY_MODE: Record<ForceMode, Record<string, Partial<NumericInputs>>> = {
  secondLaw: {
    shoppingCart: { mass: "15", acceleration: "1", force: "15" },
    carAccelerating: { mass: "1200", acceleration: "3", force: "3600" },
    rocketLaunch: { mass: "500000", acceleration: "20", force: "1e7" },
  },
  gravitation: {
    earthMoon: { mass1: "5.972e24", mass2: "7.342e22", distance: "3.844e8" },
    earthSun: { mass1: "5.972e24", mass2: "1.989e30", distance: "1.496e11" },
    twoPeople: { mass1: "70", mass2: "70", distance: "1" },
  },
};

const EXAMPLES = (Object.keys(SCENARIOS_BY_MODE) as ForceMode[]).flatMap((mode) =>
  Object.entries(SCENARIOS_BY_MODE[mode]).map(([key, values]) => ({ id: `${mode}:${key}`, mode, key, values })),
);

function exampleDetail(mode: ForceMode, v: Partial<NumericInputs>): string {
  return mode === "secondLaw" ? `m = ${v.mass} kg · a = ${v.acceleration} m/s² · F = ${v.force} N` : `m₁ = ${v.mass1} kg · m₂ = ${v.mass2} kg · r = ${v.distance} m`;
}

export default function ForceCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.force-calculator");
  const tNav = useTranslations("tools.force-calculator.nav");
  const tScenarios = useTranslations("tools.force-calculator.form.scenarios");
  const tCommon = useTranslations("common.live3d");

  const [draft, setDraft] = useState<ForceDraft>(FORCE_DEFAULTS);
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

  function setDim<K extends keyof ForceDraft>(key: K, value: ForceDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key !== "mode") setActiveExample(null);
  }

  function handlePick(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setDraft((d) => ({ ...d, ...ex.values, mode: ex.mode }));
    setActiveExample(id);
  }

  function handleClear() {
    setDraft(FORCE_DEFAULTS);
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <ForceLiveProvider value={{ dims: draft, setDim }}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <ForceInputPanel draft={draft} onChange={setDim} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={EXAMPLES.map((e) => ({ id: e.id, label: tScenarios(e.key), detail: exampleDetail(e.mode, e.values) }))}
              />
            </div>
          }
          result={<ForceResult />}
          sidebar={
            <RelatedToolsSidebar fill currentSlug="force-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="force-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <ForceQuickReference />
              <ForceReferenceTable />
            </div>
          }
        />
      </div>

      {education}
    </ForceLiveProvider>
  );
}
