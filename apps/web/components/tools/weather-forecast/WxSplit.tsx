import type { ReactNode } from "react";
import { hasWords } from "@/components/tool-ui/MixedText";

export type WxRow = { label: string; value: string; emphasize?: boolean; /** Long value (a substituted formula): shown on its own line under the label. */ wide?: boolean };

/**
 * Weather card body: deep info table at the START side (right in Arabic, left in LTR) with a fixed
 * comfortable width, the drawing in the remaining width at the END side. Logical layout only, so
 * RTL mirrors by itself. At ≤ 768 px the drawing comes first and the table below, both full width.
 * Labels wrap instead of being clipped.
 */
export default function WxSplit({ title, rows, chart }: { title: string; rows: WxRow[]; chart: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 min-[769px]:flex-row min-[769px]:items-start">
      <div data-bp-inner className="order-2 w-full rounded-xl bg-zinc-50 p-4 min-[769px]:order-1 min-[769px]:w-[320px] min-[769px]:shrink-0 dark:bg-zinc-800/40">
        <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{title}</p>
        <dl className="mt-2 divide-y divide-zinc-200 text-sm dark:divide-zinc-700">
          {rows.map((r, i) =>
            r.wide ? (
              <div key={i} className="py-1.5">
                <dt className="break-words text-zinc-500 dark:text-zinc-400">{r.label}</dt>
                <dd dir="ltr" className="mt-1 rounded-md bg-white px-2 py-1 text-start font-mono text-xs leading-5 break-words text-blue-800 dark:bg-zinc-900 dark:text-blue-200">{r.value}</dd>
              </div>
            ) : (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 py-1.5">
                <dt className="break-words text-zinc-500 dark:text-zinc-400">{r.label}</dt>
                <dd
                  dir={hasWords(r.value) ? "auto" : "ltr"}
                  className={`max-w-[11rem] text-end font-semibold break-words ${r.emphasize ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"}`}
                >
                  {r.value}
                </dd>
              </div>
            ),
          )}
        </dl>
      </div>
      <div className="order-1 flex min-w-0 flex-1 justify-center min-[769px]:order-2">{chart}</div>
    </div>
  );
}
