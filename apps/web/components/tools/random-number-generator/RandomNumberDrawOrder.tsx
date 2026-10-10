"use client";
import { useTranslations } from "next-intl";
import { duplicateProbability, upDownCounts } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { Draw } from "./RandomNumberIndicators";
import { pc, type RngFormatters } from "./format";

const MAX_BARS = 60;

/** The draw in the order it happened (before any sort), with the quick odds that go with it. */
export default function RandomNumberDrawOrder({ d, f }: { d: Draw; f: RngFormatters }) {
  const t = useTranslations("tools.random-number-generator.order");
  const bars = d.drawn.slice(0, MAX_BARS);
  const span = d.hi - d.lo || 1;
  const { ups, downs, ties } = upDownCounts(d.drawn);
  const repeat = d.allowDuplicates ? duplicateProbability(d.n, d.k) : 0;
  const muPos = ((d.mu - d.lo) / span) * 100;

  return (
    <SectionCard title={t("title")}>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("intro", { shown: f.int(bars.length), k: f.int(d.k) })}</p>
      <div dir="ltr" className="relative mt-2 flex h-16 items-end gap-px rounded-lg bg-zinc-50 p-1 dark:bg-zinc-800/40" data-testid="rng-order">
        {bars.map((v, i) => (
          <div key={i} className="min-w-0 flex-1 rounded-t-sm bg-blue-500 transition-all duration-500 dark:bg-blue-400" style={{ height: pc(Math.max(4, ((v - d.lo) / span) * 100)) }} title={String(v)} />
        ))}
        <div className="pointer-events-none absolute inset-x-1 border-t-2 border-dashed border-amber-500" style={{ bottom: pc(muPos * 0.9 + 4) }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {[
          { id: "first", k: t("first"), v: `${f.int(d.drawn[0])} → ${f.int(d.drawn[d.drawn.length - 1])}` },
          { id: "updown", k: t("upDown"), v: `${f.int(ups)} ↑ · ${f.int(downs)} ↓${ties ? ` · ${f.int(ties)} =` : ""}` },
          { id: "single", k: t("single"), v: `1 ÷ ${f.int(d.n)} = ${f.pct(1 / d.n, 2)}` },
          { id: "repeat", k: t("repeat"), v: f.pct(repeat, 2) },
        ].map((row) => (
          <div key={row.id} className="rounded-lg bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/50">
            <dt className="text-[11px] text-zinc-500 dark:text-zinc-400">{row.k}</dt>
            <dd dir="ltr" className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100" data-testid={`rng-order-${row.id}`}>
              {row.v}
            </dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
