"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { tcFormatHms } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SectionCard from "@/components/tool-ui/SectionCard";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import HistoryTape, { type TapeEntry } from "@/components/tool-ui/HistoryTape";
import { newEntryId, usePersistedList } from "@/lib/use-persisted-list";
import TcInput from "./TcInput";
import TcResult, { useTcPhrases } from "./TcResult";
import { TcDstTimelineCard, TcFlowCard, TcShiftDialCard, TcTimesheetStackCard } from "./TcIndicatorsA";
import { TcDecimalCard, TcOvertimeGaugeCard, TcRoundingTrioCard, TcWeekBarsCard } from "./TcIndicatorsB";
import { buildShareUrl, makeFmt, sampleState, sanitize, useDerived, useTcState, type TcState } from "./state";

type HistoryEntry = TapeEntry & { state: TcState };

export default function TimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.time-calculator.nav");
  const { t, dayTag, dst, zoneName } = useTcPhrases();
  const locale = useLocale();
  const sample = useCallback(() => sampleState(locale, t.raw("sample.rows") as string[]), [locale, t]);
  const [s, setState] = useTcState(sample);
  const set = useCallback((patch: Partial<TcState>) => setState((prev) => ({ ...prev, ...patch })), [setState]);
  const d = useDerived(s);
  const f = useMemo(() => makeFmt(locale, s.h12), [locale, s.h12]);
  const [copied, setCopied] = useState<"result" | "link" | null>(null);
  const history = usePersistedList<HistoryEntry>("tooloralabs:time-calculator:history:v1", 30);

  /** One-line summary of the active mode (history label + copied text). */
  const summary = useCallback((): { label: string; value: string; lines: string[] } => {
    const mode = t(`modes.${s.mode}`);
    if (s.mode === "sum") {
      const lines = s.rows.map((r, i) => `${r.sign === 1 ? "+" : "−"}${f.dur(d.rowSeconds[i])}  ${r.label || t("input.entryN", { n: i + 1 })}`);
      return { label: `${mode} · ${s.rows.length}×`, value: `${f.dur(d.sheet.totalSeconds)} (${f.hours(d.sheet.totalSeconds)} h)`, lines };
    }
    if (s.mode === "span") {
      const sp = d.span;
      return {
        label: `${mode} · ${f.shortDate(d.spanStartDate)} ${f.clock(d.spanStart)} → ${f.clock(d.spanEnd)} ${dayTag(sp.dayOffset)}`,
        value: `${f.dur(sp.netSeconds)} (${f.hours(sp.netSeconds)} h)`,
        lines: [
          `${t("result.elapsed")}: ${f.dur(sp.elapsedSeconds)} — ${dst(sp.dstDeltaSeconds, f)}`,
          `${t("result.break")}: ${f.dur(sp.breakSeconds)}`,
          `${t("input.zone")}: ${zoneName(d.zone)}`,
        ],
      };
    }
    if (s.mode === "add") {
      const a = d.add;
      return {
        label: `${mode} · ${f.clock(d.addClock)} ${s.add.op === 1 ? "+" : "−"} ${f.dur(d.addDuration)}`,
        value: `${f.clock(a.resultClock)} ${dayTag(a.dayOffset)}`,
        lines: [`${f.date(a.resultDate)}`, `${t("result.dstChange")}: ${f.signedDur(a.dstDeltaSeconds)}`, `${t("input.zone")}: ${zoneName(d.zone)}`],
      };
    }
    if (s.mode === "week") {
      const w = d.week;
      return {
        label: `${mode} · ${t("result.daysN", { n: w.workDays })}`,
        value: `${f.durHm(w.totalSeconds)} (+${f.durHm(w.overtimeSeconds)} OT)`,
        lines: [
          ...w.days.filter((x) => x.on).map((x) => `${f.weekday(x.weekday)}: ${f.durHm(x.workedSeconds)}`),
          `${t("result.regular")}: ${f.dur(w.regularSeconds)}`,
          `${t("result.overtime")}: ${f.dur(w.overtimeSeconds)}`,
          `${t("result.paidEq")}: ${f.hours(w.paidEquivalentSeconds)} h`,
        ],
      };
    }
    return {
      label: `${mode} · ${s.dec.dir === "toHms" ? `${s.dec.decimal} h` : f.dur(d.dec.seconds)}`,
      value: `${f.dur(d.dec.seconds)} = ${f.num(d.dec.decimal2)} h`,
      lines: [`${t(`round.${s.dec.round}`)} (${t("input.minutesN", { n: s.dec.inc })}): ${f.num(d.dec.rounded[s.dec.round] / 3600)} h`],
    };
  }, [d, dayTag, dst, f, s, t, zoneName]);

  const snapshot = useCallback((): HistoryEntry => {
    const sm = summary();
    // Tape value = the duration in hours, so the tape's grand total is a running sum of time.
    return { id: newEntryId(), label: sm.label, valueText: sm.value, value: d.primarySeconds / 3600, state: s };
  }, [d, s, summary]);

  const remember = useCallback(() => {
    const e = snapshot();
    if (history.items[0]?.label === e.label && history.items[0]?.valueText === e.valueText) return;
    history.add(e);
  }, [history, snapshot]);

  // Calculations are recorded automatically once the inputs settle.
  const rememberRef = useRef(remember);
  useEffect(() => {
    rememberRef.current = remember;
  });
  const loadedOnce = useRef(false);
  useEffect(() => {
    if (!loadedOnce.current) {
      loadedOnce.current = true;
      return;
    }
    const id = setTimeout(() => rememberRef.current(), 2000);
    return () => clearTimeout(id);
  }, [s]);

  const flash = (k: "result" | "link") => {
    setCopied(k);
    setTimeout(() => setCopied(null), 1800);
  };
  const copyResult = async () => {
    const sm = summary();
    try {
      await navigator.clipboard.writeText([`${t("copyHeader")} — ${sm.label}`, `= ${sm.value}`, ...sm.lines].join("\n"));
      flash("result");
      remember();
    } catch {
      /* clipboard unavailable */
    }
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(s, window.location.href));
      flash("link");
      remember();
    } catch {
      /* clipboard unavailable */
    }
  };

  const props = { s, set, d, f };
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "tc-history", label: t("nav.history") },
    { id: "tc-indicators", label: t("nav.indicators") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={<TcInput s={s} set={set} d={d} f={f} onCopy={copyResult} onShare={share} onReset={() => setState(sample())} copied={copied} />}
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <TcResult s={s} set={set} d={d} f={f} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="time-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="time-calculator" />
              <SectionNav items={navItems} />
              <SectionCard id="tc-history" title={t("history.title")} bodyClassName="p-4">
                <HistoryTape
                  entries={history.items}
                  onSelect={(e) => setState(sanitize((e as HistoryEntry).state, sample()))}
                  onDelete={history.remove}
                  onClear={history.clear}
                  formatTotal={(n) => `${tcFormatHms(Math.round(n * 3600))} · ${f.num(n)} h`}
                  emptyText={t("history.empty")}
                />
              </SectionCard>
            </div>
          }
        />
      </div>

      <section id="tc-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <TcShiftDialCard {...props} />
        <TcTimesheetStackCard {...props} />
        <TcFlowCard {...props} />
        <TcDstTimelineCard {...props} />
        <AdSpace variant="leaderboard" />
        <TcWeekBarsCard {...props} />
        <TcOvertimeGaugeCard {...props} />
        <TcDecimalCard {...props} />
        <TcRoundingTrioCard {...props} />
      </section>

      {education}
    </>
  );
}
