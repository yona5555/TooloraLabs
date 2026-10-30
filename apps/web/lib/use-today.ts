import { useSyncExternalStore } from "react";
import { useRenderedAt } from "@/components/tools/markets/RenderClock";

const subscribe = () => () => {};
const pad = (n: number) => String(n).padStart(2, "0");

/** A Date's local calendar day as YYYY-MM-DD. */
export const localISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Today's date (YYYY-MM-DD) for a tool's date-dependent defaults. Tool pages are prerendered, so a
 * "today" read on the server is the build day: on any later visit it would not match the browser's
 * date, React would reject the hydration (#418) and re-render the whole document, which drops the
 * dark theme. The server and the hydrating render both use the page's render day (RenderClockProvider,
 * sent in the RSC payload, read as UTC so the server's and the browser's time zones agree); right after
 * hydration the browser's own local day takes over (its UTC day with `utc`, for UTC-dated data).
 */
export function useTodayISO({ utc = false }: { utc?: boolean } = {}): string {
  const renderedAt = useRenderedAt();
  return useSyncExternalStore(subscribe, () => (utc ? new Date().toISOString().slice(0, 10) : localISO(new Date())), () => {
    if (renderedAt === null) throw new Error("useTodayISO needs the tool page's RenderClockProvider");
    return new Date(renderedAt).toISOString().slice(0, 10);
  });
}

/** A YYYY-MM-DD day moved by `days` (calendar arithmetic in UTC, so no time zone or DST shift). */
export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}
