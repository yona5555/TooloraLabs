"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import EnergyInputPanel from "./EnergyInputPanel";
import EnergyResult from "./EnergyResult";
import EnergyQuickReference from "./EnergyQuickReference";
import EnergyReferenceTable from "./EnergyReferenceTable";
import { ENERGY_DEFAULTS, EnergyLiveProvider, type EnergyDraft } from "./EnergyLiveContext";
import type { EnergyWorkPowerMode } from "./types";

const RELATED_TOOLS = ["ohms-law-calculator", "force-calculator", "kinematics-calculator", "projectile-motion-calculator"];

type NumericInputs = Omit<EnergyDraft, "mode">;

// Real, mode-specific everyday scenarios. Each key's fields only apply
// within the mode that owns it (values for the other three modes are left
// untouched when a preset from a different mode is later selected).
const SCENARIOS_BY_MODE: Record<EnergyWorkPowerMode, Record<string, Partial<NumericInputs>>> = {
  work: {
    shoppingCart: { force: "50", distance: "10", angleDegrees: "0" },
    liftBox: { force: "100", distance: "1.5", angleDegrees: "0" },
    pullSledAngle: { force: "80", distance: "5", angleDegrees: "30" },
  },
  kineticEnergy: {
    walkingHuman: { mass: "70", velocity: "1.4" },
    runningHuman: { mass: "70", velocity: "5" },
    carHighway: { mass: "1500", velocity: "30" },
  },
  potentialEnergy: {
    bookOnShelf: { mass: "1", height: "1.5" },
    diver: { mass: "70", height: "3" },
    waterBehindDam: { mass: "1000", height: "50" },
  },
  power: {
    climbingStairs: { workValue: "1000", time: "10" },
    carAccelerating: { workValue: "500000", time: "5" },
    lightbulbRunning: { workValue: "3600", time: "60" },
  },
};

const EXAMPLES = (Object.keys(SCENARIOS_BY_MODE) as EnergyWorkPowerMode[]).flatMap((mode) =>
  Object.entries(SCENARIOS_BY_MODE[mode]).map(([key, values]) => ({ id: `${mode}:${key}`, mode, key, values })),
);

function exampleDetail(mode: EnergyWorkPowerMode, v: Partial<NumericInputs>): string {
  switch (mode) {
    case "work":
      return `F = ${v.force} N · d = ${v.distance} m · θ = ${v.angleDegrees}°`;
    case "kineticEnergy":
      return `m = ${v.mass} kg · v = ${v.velocity} m/s`;
    case "potentialEnergy":
      return `m = ${v.mass} kg · h = ${v.height} m`;
    case "power":
      return `W = ${v.workValue} J · t = ${v.time} s`;
  }
}

export default function EnergyWorkPowerCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.energy-work-power-calculator");
  const tNav = useTranslations("tools.energy-work-power-calculator.nav");
  const tScenarios = useTranslations("tools.energy-work-power-calculator.form.scenarios");
  const tCommon = useTranslations("common.live3d");

  const [draft, setDraft] = useState<EnergyDraft>(ENERGY_DEFAULTS);
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

  function setDim<K extends keyof EnergyDraft>(key: K, value: EnergyDraft[K]) {
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
    setDraft((d) => ({ ...ENERGY_DEFAULTS, mode: d.mode }));
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <EnergyLiveProvider value={{ dims: draft, setDim }}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <EnergyInputPanel draft={draft} onChange={setDim} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={EXAMPLES.map((e) => ({ id: e.id, label: tScenarios(e.key), detail: exampleDetail(e.mode, e.values) }))}
              />
            </div>
          }
          result={<EnergyResult />}
          sidebar={
            <RelatedToolsSidebar fill currentSlug="energy-work-power-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="energy-work-power-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <EnergyQuickReference />
              <EnergyReferenceTable />
            </div>
          }
        />
      </div>

      {education}
    </EnergyLiveProvider>
  );
}
