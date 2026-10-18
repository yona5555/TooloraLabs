import type { ReactNode } from "react";
import { hasWords } from "@/components/tool-ui/MixedText";

export type WxRow = { label: string; value: string; emphasize?: boolean; /** Long value (a substituted formula): its own full-width line. */ wide?: boolean };

function Cell({ r }: { r: WxRow }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 py-1.5">
      <dt className="break-words text-zinc-500 dark:text-zinc-400">{r.label}</dt>
      <dd
        dir={hasWords(r.value) ? "auto" : "ltr"}
        className={`max-w-[12rem] text-end font-semibold break-words ${r.emphasize ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}
      >
        {r.value}
      </dd>
    </div>
  );
}

function Wide({ r }: { r: WxRow }) {
  return (
    <div className="py-1.5">
      <dt className="break-words text-zinc-500 dark:text-zinc-400">{r.label}</dt>
      <dd dir="ltr" className="mt-1 rounded-md bg-white px-2 py-1 text-start font-mono text-xs leading-5 break-words text-blue-800 dark:bg-zinc-900 dark:text-blue-200">
        {r.value}
      </dd>
    </div>
  );
}

/**
 * Weather card body under the conditional layout rule (visuals.md). Side by side: a fixed 320px
 * info table at the reading-direction START, the drawing in the remaining width at the END.
 * Stacked (layout="stacked", for a card measured with a side-by-side gap): drawing on top at
 * full width, rows in a 3/2/1-column grid, wide rows (the substituted formula) in a full-width
 * bottom row. At ≤ 768 px the drawing comes first and the table below. Labels wrap, never clip.
 */
export default function WxSplit({ title, rows, chart, layout = "side" }: { title: string; rows: WxRow[]; chart: ReactNode; layout?: "side" | "stacked" }) {
  const stacked = layout === "stacked";
  const heading = <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{title}</p>;

  if (stacked) {
    const cells = rows.filter((r) => !r.wide);
    const wide = rows.filter((r) => r.wide);
    return (
      <div data-split="stacked" className="flex flex-col gap-4">
        <div data-part="drawing" className="min-w-0">{chart}</div>
        <div data-part="table" data-bp-inner className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
          {heading}
          <dl className="mt-2 grid grid-cols-1 gap-x-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {cells.map((r, i) => (
              <div key={i} className="border-b border-zinc-200 dark:border-zinc-700">
                <Cell r={r} />
              </div>
            ))}
          </dl>
          {wide.length > 0 && (
            <dl className="mt-2 text-sm">
              {wide.map((r, i) => (
                <Wide key={i} r={r} />
              ))}
            </dl>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-split="side" className="flex flex-col gap-4 min-[769px]:flex-row min-[769px]:items-start">
      <div data-part="table" data-bp-inner className="order-2 w-full rounded-xl bg-zinc-50 p-4 min-[769px]:order-1 min-[769px]:w-[320px] min-[769px]:shrink-0 dark:bg-zinc-800/40">
        {heading}
        <dl className="mt-2 divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
          {rows.map((r, i) => (r.wide ? <Wide key={i} r={r} /> : <Cell key={i} r={r} />))}
        </dl>
      </div>
      <div data-part="drawing" className="order-1 flex min-w-0 flex-1 justify-center min-[769px]:order-2">
        {chart}
      </div>
    </div>
  );
}
