"use client";
import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import GpaPlannerInput from "./GpaPlannerInput";
import GpaPlannerResult from "./GpaPlannerResult";
import GpaTranscriptPrint from "./GpaTranscriptPrint";
import { GpaContributionCard, GpaDistributionCard, GpaTargetSliderCard, GpaTrendCard } from "./GpaIndicatorsA";
import { GpaConverterCard, GpaHonorsStripCard, GpaRetakeCard, GpaWhatIfCard } from "./GpaIndicatorsB";
import { makeFormatters, sampleState, stateDigitStyle, useDerived, usePlannerState } from "./planner";

export default function GpaCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.gpa-calculator.nav");
  const tp = useTranslations("tools.gpa-calculator.planner");
  const sampleNames = () => tp.raw("sample.courses") as string[];

  const [state, setState] = usePlannerState(() => sampleState(sampleNames()));
  const d = useDerived(state);
  const digitStyle = stateDigitStyle(state);
  const f = useMemo(() => makeFormatters(digitStyle), [digitStyle]);
  const props = { state, setState, d, f };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "gpa-indicators", label: tp("nav.indicators") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={<GpaPlannerInput state={state} onChange={setState} onReset={() => setState(sampleState(sampleNames()))} onPrint={() => window.print()} />}
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <GpaPlannerResult state={state} d={d} f={f} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="gpa-calculator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="gpa-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      <section id="gpa-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <GpaTargetSliderCard {...props} />
        <GpaWhatIfCard {...props} />
        <GpaTrendCard {...props} />
        <GpaHonorsStripCard {...props} />
        <AdSpace variant="leaderboard" />
        <GpaRetakeCard {...props} />
        <GpaContributionCard {...props} />
        <GpaDistributionCard {...props} />
        <GpaConverterCard {...props} />
      </section>

      <GpaTranscriptPrint state={state} d={d} f={f} />

      {education}
    </>
  );
}
