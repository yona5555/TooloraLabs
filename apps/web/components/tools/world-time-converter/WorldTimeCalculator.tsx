"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatIsoDate } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SectionCard from "@/components/tool-ui/SectionCard";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import HistoryTape, { type TapeEntry } from "@/components/tool-ui/HistoryTape";
import { newEntryId, usePersistedList } from "@/lib/use-persisted-list";
import WorldTimeInput from "./WorldTimeInput";
import WorldTimeResult from "./WorldTimeResult";
import WorldClockGrid from "./WorldClockGrid";
import WorldTimeDisclaimer from "./WorldTimeDisclaimer";
import { WtDayNightMapCard, WtMeetingCard, WtOffsetBarsCard, WtOverlapBarsCard } from "./WtIndicatorsA";
import { WtDaylightCard, WtDstTimelineCard, WtHijriCard, WtWeekCard } from "./WtIndicatorsB";
import { buildShareUrl, DEFAULT_STATE, makeFmt, sanitize, useDerived, useNowMinute, useWorldTimeState, type WtState } from "./state";

type HistoryEntry = TapeEntry & { state: WtState };

export default function WorldTimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.world-time-converter.nav");
  const t = useTranslations("tools.world-time-converter.wt");
  const locale = useLocale();
  const f = useMemo(() => makeFmt(locale), [locale]);
  const [s, setState] = useWorldTimeState();
  const set = useCallback((patch: Partial<WtState>) => setState((prev) => sanitize({ ...prev, ...patch })), [setState]);
  const now = useNowMinute();
  const d = useDerived(s, now);
  const [copied, setCopied] = useState<"result" | "link" | null>(null);
  const history = usePersistedList<HistoryEntry>("tooloralabs:world-time:history:v1", 30);

  const snapshot = useCallback((): HistoryEntry => {
    const p = d.conv.rows[0].parts;
    const frozen: WtState = { ...s, mode: "custom", date: formatIsoDate(p), time: `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}` };
    return {
      id: newEntryId(),
      label: `${f.city(d.from)} ${f.date(d.conv.utcMs, d.from.zone)} ${f.time(d.conv.utcMs, d.from.zone)}`,
      valueText: d.all
        .slice(1)
        .map((c) => `${f.city(c).split(" / ")[0]} ${f.time(d.conv.utcMs, c.zone)}`)
        .join(" · "),
      value: d.all.length - 1,
      state: frozen,
    };
  }, [d, f, s]);

  const remember = useCallback(() => {
    const e = snapshot();
    if (history.items[0]?.label === e.label && history.items[0]?.valueText === e.valueText) return;
    history.add(e);
  }, [history, snapshot]);

  // Custom conversions are recorded automatically once the inputs settle.
  const rememberRef = useRef(remember);
  useEffect(() => {
    rememberRef.current = remember;
  });
  const autoKey = s.mode === "custom" ? `${s.from}|${s.cities.join(",")}|${s.date}T${s.time}` : "";
  useEffect(() => {
    if (!autoKey) return;
    const id = setTimeout(() => rememberRef.current(), 1500);
    return () => clearTimeout(id);
  }, [autoKey]);

  const flash = (k: "result" | "link") => {
    setCopied(k);
    setTimeout(() => setCopied(null), 1800);
  };
  const copyResult = async () => {
    const lines = d.all.map((c, i) => {
      const r = d.conv.rows[i];
      return `${f.city(c)}: ${f.time(d.conv.utcMs, c.zone)} — ${f.date(d.conv.utcMs, c.zone)} (${f.offset(r.offsetMinutes)}) · ${f.hijri(d.conv.utcMs, c.zone)}`;
    });
    try {
      await navigator.clipboard.writeText([`${t("copyHeader")} — UTC ${f.time(d.conv.utcMs, "UTC")}`, ...lines].join("\n"));
      flash("result");
      remember();
    } catch {
      /* clipboard unavailable */
    }
  };
  const share = async () => {
    const p = d.conv.rows[0].parts;
    const frozen: WtState = s.mode === "custom" ? s : { ...s, mode: "custom", date: formatIsoDate(p), time: `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}` };
    try {
      await navigator.clipboard.writeText(buildShareUrl(frozen, window.location.href));
      flash("link");
      remember();
    } catch {
      /* clipboard unavailable */
    }
  };

  const props = { s, set, d, f, now };
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "world-clock", label: tNav("worldClock") },
    { id: "wt-map", label: t("nav.map") },
    { id: "meeting-planner", label: tNav("meetingPlanner") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={<WorldTimeInput s={s} set={set} d={d} f={f} now={now} onCopy={copyResult} onShare={share} onReset={() => setState(DEFAULT_STATE)} copied={copied} />}
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <WorldTimeResult s={s} d={d} f={f} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="world-time-converter" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="world-time-converter" />
              <SectionNav items={navItems} />
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <WorldClockGrid {...props} />
                </div>
                <SectionCard title={t("history.title")} bodyClassName="p-4">
                  <HistoryTape
                    entries={history.items}
                    onSelect={(e) => setState(sanitize((e as HistoryEntry).state))}
                    onDelete={history.remove}
                    onClear={history.clear}
                    formatTotal={(n) => t("history.total", { n })}
                    emptyText={t("history.empty")}
                  />
                </SectionCard>
              </div>
            </div>
          }
        />
      </div>

      <section id="wt-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
        <WtDayNightMapCard {...props} />
        <WtMeetingCard {...props} />
        <WtOverlapBarsCard {...props} />
        <WtOffsetBarsCard {...props} />
        <AdSpace variant="leaderboard" />
        <WtDstTimelineCard {...props} />
        <WtHijriCard {...props} />
        <WtDaylightCard {...props} />
        <WtWeekCard {...props} />
      </section>

      {education}

      <section className="mt-8">
        <WorldTimeDisclaimer />
      </section>
    </>
  );
}
