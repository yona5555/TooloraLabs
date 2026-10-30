"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import StudyStudioInput from "./StudyStudioInput";
import StudyStudioResult from "./StudyStudioResult";
import { ForgettingCurveCard, PomodoroCycleCard, PriorityFormulaCard, ReviewScheduleCard } from "./StudyIndicatorsA";
import { DailyLoadCard, FocusRatioCard, HoursPerExamCard, SlackBalanceCard } from "./StudyIndicatorsB";
import { sampleState, useDerived, useStudioState } from "./studio";
import { useTodayISO } from "@/lib/use-today";

export default function StudyTimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.study-time-calculator.nav");
  const t = useTranslations("tools.study-time-calculator.studio");
  const sampleNames = () => {
    const raw: unknown = t.raw("sample.exams");
    return Array.isArray(raw) ? (raw as string[]) : [];
  };

  // The sample exams are dated from today (useTodayISO: the render day while hydrating, then the
  // browser's day). While the visitor has neither edited nor restored a plan, the sample follows today.
  const today = useTodayISO();
  const [sample, setSample] = useState(() => ({ day: today, state: sampleState(sampleNames(), today) }));
  const [state, setState] = useStudioState(() => sample.state);
  if (sample.day !== today && state === sample.state) {
    const next = { day: today, state: sampleState(sampleNames(), today) };
    setSample(next);
    setState(next.state);
  }
  const d = useDerived(state);
  const props = { state, setState, d };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "study-indicators", label: t("nav.indicators") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={<StudyStudioInput state={state} onChange={setState} onReset={() => setState(sampleState(sampleNames(), today))} />}
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <StudyStudioResult state={state} d={d} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="study-time-calculator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="study-time-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      <section id="study-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <PomodoroCycleCard {...props} />
        <ReviewScheduleCard {...props} />
        <ForgettingCurveCard {...props} />
        <PriorityFormulaCard {...props} />
        <HoursPerExamCard {...props} />
        <DailyLoadCard {...props} />
        <SlackBalanceCard {...props} />
        <FocusRatioCard {...props} />
      </section>

      {education}
    </>
  );
}
