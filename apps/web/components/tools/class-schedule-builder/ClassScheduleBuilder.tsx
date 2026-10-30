"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import ScheduleStudioInput from "./ScheduleStudioInput";
import ScheduleStudioResult from "./ScheduleStudioResult";
import { ScheduleConflictCard, ScheduleCreditsCard, ScheduleDailyLoadCard, ScheduleGapsCard } from "./ScheduleIndicatorsA";
import { ScheduleCampusCard, ScheduleStreakCard, ScheduleWindowCard, ScheduleWorkloadCard } from "./ScheduleIndicatorsB";
import { sampleState, useDerived, useStudioState, visitorTimeZone } from "./studio";
import { useTodayISO } from "@/lib/use-today";

const noSubscribe = () => () => {};

export default function ClassScheduleBuilder({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.class-schedule-builder.nav");
  const t = useTranslations("tools.class-schedule-builder.studio");
  const sampleText = () => t.raw("sample.classes") as { name: string; room: string }[];

  // The sample term is built from today (useTodayISO: the render day while hydrating, then the browser's
  // day). While the visitor has neither edited nor restored a schedule, the sample follows today.
  const today = useTodayISO();
  const [sample, setSample] = useState(() => ({ day: today, state: sampleState(sampleText(), today) }));
  const [state, setState] = useStudioState(() => sample.state);
  if (sample.day !== today && state === sample.state) {
    const next = { day: today, state: sampleState(sampleText(), today) };
    setSample(next);
    setState(next.state);
  }
  const d = useDerived(state);
  // The visitor's IANA zone only exists in the browser; the server renders "floating" until hydration.
  const timeZone = useSyncExternalStore(noSubscribe, visitorTimeZone, () => null);
  const props = { state, onChange: setState, d };

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "schedule-indicators", label: t("nav.indicators") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={<ScheduleStudioInput state={state} onChange={setState} onReset={() => setState(sampleState(sampleText(), today))} timeZone={timeZone} />}
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <ScheduleStudioResult state={state} onChange={setState} d={d} timeZone={timeZone} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="class-schedule-builder" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="class-schedule-builder" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      <section id="schedule-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <ScheduleConflictCard {...props} />
        <ScheduleDailyLoadCard {...props} />
        <ScheduleGapsCard {...props} />
        <ScheduleCreditsCard {...props} />
        <ScheduleWindowCard {...props} />
        <ScheduleCampusCard {...props} />
        <ScheduleStreakCard {...props} />
        <ScheduleWorkloadCard {...props} />
      </section>

      {education}
    </>
  );
}
