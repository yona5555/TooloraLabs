"use client";
import { useCallback, useMemo, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { countdownPresets, type CountdownPreset, type CountdownPresetKey } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import AdSpace from "@/components/tool-ui/AdSpace";
import SectionCard from "@/components/tool-ui/SectionCard";
import HistoryTape, { type TapeEntry } from "@/components/tool-ui/HistoryTape";
import { newEntryId, usePersistedList } from "@/lib/use-persisted-list";
import CountdownInput from "./CountdownInput";
import CountdownLiveResult from "./CountdownLiveResult";
import { CdBusinessSplitCard, CdRingsCard, CdTimelineCard, CdWeekdayBarsCard } from "./CountdownIndicatorsA";
import { CdHijriYearCard, CdLogScaleCard, CdRankedCard, CdZoneEquivalenceCard } from "./CountdownIndicatorsB";
import {
  applyPreset,
  fmtInZone,
  hms,
  num,
  resolveState,
  sampleState,
  STORAGE_KEY,
  useCountdownState,
  useDerived,
  useNow,
  useViewerZone,
  zoneName,
  type CdState,
  type SavedCountdown,
} from "./model";

const DAY_MS = 86_400_000;

export default function CountdownToEventCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.countdown-to-event-calculator.nav");
  const t = useTranslations("tools.countdown-to-event-calculator.pro");
  const locale = useLocale();
  const titleFor = useCallback((k: CountdownPresetKey) => t(`presets.${k}`), [t]);

  const [state, setState] = useCountdownState(locale, titleFor);
  const nowMs = useNow();
  const viewerZone = useViewerZone();
  const saved = usePersistedList<SavedCountdown>(STORAGE_KEY, 30);
  const d = useDerived(state, nowMs, viewerZone, saved.items);
  const nowMinute = Math.floor(nowMs / 60_000);
  // Preset dates only change at midnight; recompute at most once a minute.
  const presets = useMemo(() => countdownPresets(nowMinute * 60_000, state.zone), [nowMinute, state.zone]);
  const onPreset = (p: CountdownPreset) => setState(applyPreset(state, p, titleFor(p.key), nowMs));

  const title = state.title || t("saved.untitled");
  const resultText = d
    ? t(d.b.isPast ? "result.sentencePast" : "result.sentenceFuture", {
        event: title,
        days: num(d.b.days),
        hms: hms(d.b.hours, d.b.minutes, d.b.seconds),
        date: fmtInZone(locale, d.target.utcMs, state.zone),
        zone: zoneName(locale, state.zone),
        business: num(d.days.businessDays),
      })
    : "";

  const save = () => {
    if (!d) return;
    const dup = saved.items.find((x) => x.title === state.title && x.date === state.date && x.time === state.time && x.zone === state.zone);
    if (dup) saved.remove(dup.id);
    saved.add({ ...state, id: newEntryId() });
  };

  const entries: TapeEntry[] = saved.items.map((x) => {
    const r = resolveState(x, nowMs);
    const diff = r ? r.target.utcMs - nowMs : 0;
    const abs = Math.abs(diff);
    const days = Math.floor(abs / DAY_MS);
    const rest = Math.floor((abs % DAY_MS) / 1000);
    return {
      id: x.id,
      label: `${x.title || t("saved.untitled")} · ${r ? fmtInZone(locale, r.target.utcMs, x.zone) : x.date} · ${zoneName(locale, x.zone)}`,
      value: r ? Math.sign(diff) * days : 0,
      valueText: r ? `${diff < 0 ? "+" : ""}${num(days)} · ${hms(Math.floor(rest / 3600), Math.floor((rest % 3600) / 60), rest % 60)}${diff < 0 ? ` ${t("saved.ago")}` : ""}` : t("input.invalid"),
    };
  });

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "countdown-indicators", label: t("nav.indicators") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];
  const props = d ? { state, setState, d } : null;

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchResult
          input={
            <div className="flex flex-col gap-3">
              <CountdownInput
                state={state}
                onChange={setState}
                d={d}
                presets={presets}
                onPreset={onPreset}
                onReset={() => setState(sampleState(locale, Date.now(), viewerZone, titleFor))}
                onSave={save}
                viewerZone={viewerZone}
                nowMs={nowMs}
                resultText={resultText}
              />
              <SectionCard title={t("saved.title")} bodyClassName="p-3">
                <HistoryTape
                  entries={entries}
                  onSelect={(e) => {
                    const hit = saved.items.find((x) => x.id === e.id);
                    if (hit) {
                      const next: Partial<SavedCountdown> = { ...hit };
                      delete next.id;
                      setState(next as CdState);
                    }
                  }}
                  onDelete={saved.remove}
                  onClear={saved.clear}
                  formatTotal={(n) => t("saved.daysTotal", { n: num(n) })}
                  emptyText={t("saved.empty")}
                  maxHeightClass="max-h-[260px]"
                />
              </SectionCard>
            </div>
          }
          result={
            <div className="flex flex-col gap-3 lg:flex-1">
              <CountdownLiveResult state={state} d={d} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="countdown-to-event-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="countdown-to-event-calculator" />
              <SectionNav items={navItems} />
            </div>
          }
        />
      </div>

      {props && (
        <section id="countdown-indicators" className="mt-8 grid scroll-mt-32 grid-cols-1 items-start gap-6">
          <CdRingsCard {...props} />
          <CdTimelineCard {...props} />
          <CdBusinessSplitCard {...props} />
          <CdZoneEquivalenceCard {...props} />
          <AdSpace variant="leaderboard" />
          <CdHijriYearCard {...props} />
          <CdWeekdayBarsCard {...props} />
          <CdLogScaleCard {...props} />
          <CdRankedCard {...props} presets={presets} onPreset={onPreset} />
        </section>
      )}

      {education}
    </>
  );
}
