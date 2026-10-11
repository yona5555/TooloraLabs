"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import KinematicsInputPanel from "./KinematicsInputPanel";
import KinematicsResult from "./KinematicsResult";
import KinematicsQuickReference from "./KinematicsQuickReference";
import KinematicsReferenceTable from "./KinematicsReferenceTable";
import { KIN_DEFAULTS, KinLiveProvider, type KinDraft } from "./KinLiveContext";
import type { KinematicsMode } from "./types";

const RELATED_TOOLS = ["force-calculator", "projectile-motion-calculator", "energy-work-power-calculator", "pace-calculator"];

type Inputs = Pick<KinDraft, "v0" | "v" | "a" | "t" | "dx">;

// Real, mode-specific everyday scenarios, each internally consistent with
// v = v0 + at (timeBased) or v² = v0² + 2a·dx (distanceBased).
const SCENARIOS_BY_MODE: Record<KinematicsMode, Record<string, Partial<Inputs>>> = {
  timeBased: {
    carAccelerating: { v0: "0", v: "25", a: "2.5", t: "10" },
    planeTakeoff: { v0: "0", v: "70", a: "3.5", t: "20" },
    trainBraking: { v0: "30", v: "0", a: "-1.5", t: "20" },
  },
  distanceBased: {
    sprinterAcceleration: { v0: "0", v: "10", a: "2.5", dx: "20" },
    cyclistDescent: { v0: "5", v: "15", a: "1", dx: "100" },
    carBraking: { v0: "20", v: "0", a: "-4", dx: "50" },
  },
};

const EXAMPLES = (Object.keys(SCENARIOS_BY_MODE) as KinematicsMode[]).flatMap((mode) =>
  Object.entries(SCENARIOS_BY_MODE[mode]).map(([key, values]) => ({ id: `${mode}:${key}`, mode, key, values })),
);

function exampleDetail(mode: KinematicsMode, v: Partial<Inputs>): string {
  return mode === "timeBased" ? `v₀ = ${v.v0} m/s · a = ${v.a} m/s² · t = ${v.t} s` : `v₀ = ${v.v0} m/s · a = ${v.a} m/s² · Δx = ${v.dx} m`;
}

export default function KinematicsCalculator({ education }: { education: ReactNode }) {
  const tRoot = useTranslations("tools.kinematics-calculator");
  const tNav = useTranslations("tools.kinematics-calculator.nav");
  const tScenarios = useTranslations("tools.kinematics-calculator.form.scenarios");
  const tCommon = useTranslations("common.live3d");

  const [draft, setDraft] = useState<KinDraft>(KIN_DEFAULTS);
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

  function setDim<K extends keyof KinDraft>(key: K, value: KinDraft[K]) {
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
    setDraft(KIN_DEFAULTS);
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <KinLiveProvider value={{ dims: draft, setDim }}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <KinematicsInputPanel draft={draft} onChange={setDim} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={EXAMPLES.map((e) => ({ id: e.id, label: tScenarios(e.key), detail: exampleDetail(e.mode, e.values) }))}
              />
            </div>
          }
          result={<KinematicsResult />}
          sidebar={
            <RelatedToolsSidebar fill currentSlug="kinematics-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={tRoot("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="kinematics-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <KinematicsQuickReference />
              <KinematicsReferenceTable />
            </div>
          }
        />
      </div>

      {education}
    </KinLiveProvider>
  );
}
