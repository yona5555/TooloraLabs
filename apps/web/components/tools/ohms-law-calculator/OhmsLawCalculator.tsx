"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import OhmsLawInputPanel from "./OhmsLawInputPanel";
import OhmsLawResult from "./OhmsLawResult";
import OhmsLawQuickReference from "./OhmsLawQuickReference";
import OhmsLawReferenceTable from "./OhmsLawReferenceTable";
import { OHMS_DEFAULTS, OhmsLiveProvider, type OhmsDraft } from "./OhmsLiveContext";

const RELATED_TOOLS = ["energy-work-power-calculator", "force-calculator", "density-calculator", "ideal-gas-law-calculator"];

type Values = Pick<OhmsDraft, "voltage" | "current" | "resistance" | "power">;

// Real, self-consistent (V = IR, P = VI) everyday circuit scenarios.
const SCENARIOS: Record<string, Values> = {
  aaMotor: { voltage: "1.5", current: "0.5", resistance: "3", power: "0.75" },
  usbCharger: { voltage: "5", current: "1", resistance: "5", power: "5" },
  carHeadlight: { voltage: "12", current: "5", resistance: "2.4", power: "60" },
  usToaster: { voltage: "120", current: "8.33", resistance: "14.4", power: "1000" },
  euKettle: { voltage: "230", current: "8.7", resistance: "26.45", power: "2000" },
};

export default function OhmsLawCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.ohms-law-calculator");
  const tNav = useTranslations("tools.ohms-law-calculator.nav");
  const tScenarios = useTranslations("tools.ohms-law-calculator.form.scenarios");
  const tCommon = useTranslations("common.live3d");

  const [draft, setDraft] = useState<OhmsDraft>(OHMS_DEFAULTS);
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

  function setDim<K extends keyof OhmsDraft>(key: K, value: OhmsDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key !== "pair") setActiveExample(null);
  }

  function handlePick(key: string) {
    const values = SCENARIOS[key];
    if (!values) return;
    setDraft((d) => ({ ...d, ...values }));
    setActiveExample(key);
  }

  function handleClear() {
    setDraft(OHMS_DEFAULTS);
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <OhmsLiveProvider value={{ dims: draft, setDim }}>
      <div ref={headerSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <OhmsLawInputPanel draft={draft} onChange={setDim} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={Object.entries(SCENARIOS).map(([key, v]) => ({
                  id: key,
                  label: tScenarios(key),
                  detail: `${v.voltage} V · ${v.current} A · ${v.resistance} Ω · ${v.power} W`,
                }))}
              />
            </div>
          }
          result={<OhmsLawResult />}
          sidebar={
            <RelatedToolsSidebar fill currentSlug="ohms-law-calculator" category="physics" relatedList={RELATED_TOOLS} relatedListTitle={t("relatedTools.title")} />
          }
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="ohms-law-calculator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <OhmsLawQuickReference />
              <OhmsLawReferenceTable />
            </div>
          }
        />
      </div>

      {education}
    </OhmsLiveProvider>
  );
}
