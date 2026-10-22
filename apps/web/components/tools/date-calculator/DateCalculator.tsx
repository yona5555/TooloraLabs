"use client";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import { newEntryId, usePersistedList } from "@/lib/use-persisted-list";
import DateInputCard from "./DateInputCard";
import DateResultCard from "./DateResultCard";
import DateHistoryCard, { type DateHistoryEntry } from "./DateHistoryCard";
import DateConverterCard from "./DateConverterCard";
import { DateBusinessSplitCard, DateDualCalendarCard, DateTimelineDragCard, DateWeekdayBarsCard } from "./DateIndicatorsA";
import { DateBusinessFormulaCard, DateStepLadderCard, DateUnitsLogCard, DateYearZoneCard } from "./DateIndicatorsB";
import { makeFormatters, sampleState, stateDigitStyle, stateFromQuery, stateToQuery, useDateState, useDerived, type DateState } from "./dateModel";

const HISTORY_KEY = "tooloralabs:date-calculator:history:v1";

export default function DateCalculator({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.date-calculator.pro");
  const locale = useLocale();
  const [state, setStateRaw, ready] = useDateState(locale);
  const d = useDerived(state);
  const digitStyle = stateDigitStyle(state);
  const f = useMemo(() => makeFormatters(locale, digitStyle), [locale, digitStyle]);
  const history = usePersistedList<DateHistoryEntry>(HISTORY_KEY, 20);

  // Only the visitor's own edits are recorded in the history (not the sample shown on load).
  const touched = useRef(false);
  const setState = (next: DateState) => {
    touched.current = true;
    setStateRaw(next);
  };

  const s = d.span;
  const ymd = (a: { years: number; months: number; days: number }) => t("ymd", { y: f.int(a.years), m: f.int(a.months), d: f.int(a.days) });
  const isAdd = d.mode === "add" && !!d.add;
  const amountText = `${f.int(Number(state.amount) || 0)} ${t(`units.${state.unit}`)}`;
  const summary = isAdd
    ? t("copy.add", {
        start: `${f.greg(d.start)} (${f.hijri(d.start)})`,
        op: state.op === "subtract" ? t("input.opSubtract") : t("input.opAdd"),
        amount: amountText,
        result: `${f.gregLong(d.target)} (${f.hijriLong(d.target)})`,
      })
    : t("copy.diff", {
        start: `${f.greg(s.earlier)} (${f.hijri(s.earlier)})`,
        end: `${f.greg(s.later)} (${f.hijri(s.later)})`,
        ymd: ymd(s.ymd),
        days: f.int(s.totalDays),
      });
  const copyText = [
    summary,
    t("copy.business", { n: f.int(s.business.businessDays), weekend: t(`weekend.${d.weekend}`), h: f.int(s.business.holidays) }),
    t("copy.hijri", { ymd: ymd(s.hijri) }),
  ].join("\n");

  const query = stateToQuery(state);
  const { add, items } = history;
  const lastQuery = items[0]?.query;
  useEffect(() => {
    if (!ready || !touched.current || d.error || lastQuery === query) return;
    const id = setTimeout(() => {
      add({
        id: newEntryId(),
        query,
        label: isAdd ? `${f.iso(d.start)} ${state.op === "subtract" ? "−" : "+"} ${amountText}` : `${f.iso(s.earlier)} → ${f.iso(s.later)}`,
        value: s.totalDays,
        valueText: isAdd ? `${f.iso(d.target)} · ${f.hijri(d.target)}` : `${ymd(s.ymd)} · ${t("history.biz", { n: f.int(s.business.businessDays) })}`,
      });
    }, 1200);
    return () => clearTimeout(id);
    // Record once the inputs settle; the formatted strings follow from the same state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ready, d.error, lastQuery]);

  const props = { state, setState, d, f };
  const navItems = [
    { id: "tool", label: t("nav.tool") },
    { id: "date-converter", label: t("nav.converter") },
    { id: "date-indicators", label: t("nav.indicators") },
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
              <DateInputCard state={state} onChange={setState} onReset={() => setState(sampleState(locale))} d={d} f={f} copyText={copyText} />
              <DateHistoryCard
                d={d}
                f={f}
                entries={history.items}
                onSelect={(e) => {
                  const next = stateFromQuery(e.query, locale);
                  if (next) setStateRaw(next);
                }}
                onDelete={history.remove}
                onClear={history.clear}
              />
            </div>
          }
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <DateResultCard d={d} f={f} amountText={amountText} summary={summary} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="date-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="date-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      <div className="mt-8">
        <DateConverterCard f={f} seed={d.start} />
      </div>

      <section id="date-indicators" className="mt-6 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <DateTimelineDragCard {...props} />
        <DateBusinessSplitCard {...props} />
        <DateStepLadderCard {...props} />
        <DateDualCalendarCard {...props} />
        <AdSpace variant="leaderboard" />
        <DateBusinessFormulaCard {...props} />
        <DateWeekdayBarsCard {...props} />
        <DateYearZoneCard {...props} />
        <DateUnitsLogCard {...props} />
      </section>

      {education}
    </>
  );
}
