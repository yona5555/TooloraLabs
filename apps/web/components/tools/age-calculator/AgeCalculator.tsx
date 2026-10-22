"use client";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import { newEntryId, usePersistedList } from "@/lib/use-persisted-list";
import AgeInputCard from "./AgeInputCard";
import AgeResultCard from "./AgeResultCard";
import AgeHistoryCard, { type AgeHistoryEntry } from "./AgeHistoryCard";
import { AgeCountdownCard, AgeEquivalenceCard, AgeTimeTravelCard, AgeWeekdayCard } from "./AgeIndicatorsA";
import { AgeFormulaCard, AgeLifeGaugeCard, AgeLifeStagesCard, AgeUnitsLadderCard } from "./AgeIndicatorsB";
import { makeFormatters, sampleState, stateDigitStyle, stateFromQuery, stateToQuery, useAgeState, useDerived, useTodayIso, type AgeState } from "./ageModel";

const HISTORY_KEY = "tooloralabs:age-calculator:history:v1";

export default function AgeCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.age-calculator.dual");
  const locale = useLocale();
  const [state, setStateRaw, ready] = useAgeState();
  const today = useTodayIso();
  const d = useDerived(state, today);
  const digitStyle = stateDigitStyle(state);
  const f = useMemo(() => makeFormatters(locale, digitStyle), [locale, digitStyle]);
  const history = usePersistedList<AgeHistoryEntry>(HISTORY_KEY, 20);

  // Only the visitor's own edits are recorded in the history (not the sample shown on load).
  const touched = useRef(false);
  const setState = (next: AgeState) => {
    touched.current = true;
    setStateRaw(next);
  };

  const { report: r } = d;
  const g = r.gregorian;
  const h = r.hijri;
  const ymd = (a: { years: number; months: number; days: number }) => t("ymd", { y: f.int(a.years), m: f.int(a.months), d: f.int(a.days) });
  const ageText = t("copy.age", { age: ymd(g), date: f.greg(r.reference) });
  const hijriText = h ? t("copy.hijri", { age: ymd(h) }) : "";
  const copyText = [
    ageText,
    hijriText,
    t("copy.birth", { g: f.greg(r.birth), h: f.hijri(r.birth), weekday: f.weekday(r.birthWeekday) }),
    t("copy.next", { date: f.greg(g.nextBirthdayGregorian), n: f.int(g.daysUntilNext) }),
    t("copy.days", { n: f.int(r.totalDays) }),
  ]
    .filter(Boolean)
    .join("\n");

  const query = stateToQuery(state);
  const { add, items } = history;
  const lastQuery = items[0]?.query;
  useEffect(() => {
    if (!ready || !touched.current || d.error || lastQuery === query) return;
    const id = setTimeout(() => {
      add({
        id: newEntryId(),
        query,
        label: `${f.iso(r.birth)} → ${f.iso(r.reference)}`,
        value: r.totalDays,
        valueText: h ? `${ymd(g)} · ${t("cal.hShort")} ${ymd(h)}` : ymd(g),
      });
    }, 1200);
    return () => clearTimeout(id);
    // Record once the inputs settle; the formatted strings follow from the same state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ready, d.error, lastQuery]);

  const props = { state, setState, d, f };
  const navItems = [
    { id: "tool", label: t("nav.tool") },
    { id: "age-indicators", label: t("nav.indicators") },
    { id: "faq", label: t("nav.faq") },
    { id: "behind-the-tool", label: t("nav.behind") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <AgeInputCard state={state} onChange={setState} onReset={() => setState(sampleState())} d={d} f={f} copyText={copyText} />
              <AgeHistoryCard
                d={d}
                f={f}
                entries={history.items}
                onSelect={(e) => {
                  const next = stateFromQuery(e.query);
                  if (next) setStateRaw(next);
                }}
                onDelete={history.remove}
                onClear={history.clear}
              />
            </div>
          }
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <AgeResultCard d={d} f={f} ageText={ageText} hijriText={hijriText} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="age-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="age-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      <section id="age-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <AgeTimeTravelCard {...props} />
        <AgeEquivalenceCard {...props} />
        <AgeCountdownCard {...props} />
        <AgeWeekdayCard {...props} />
        <AdSpace variant="leaderboard" />
        <AgeLifeStagesCard {...props} />
        <AgeLifeGaugeCard {...props} />
        <AgeUnitsLadderCard {...props} />
        <AgeFormulaCard {...props} />
      </section>

      {education}
    </>
  );
}
