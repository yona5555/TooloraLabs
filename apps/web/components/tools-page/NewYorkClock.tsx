"use client";
import { useSyncExternalStore } from "react";

/**
 * The current time in a zone, from the browser's own clock through Intl.DateTimeFormat (the
 * world-time-converter's approach) — no network request. The server snapshot is null, so the
 * server never renders a time that would be stale or mismatch on hydration.
 */
function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000);

export default function NewYorkClock({ locale, zone }: { locale: string; zone: string }) {
  const minute = useSyncExternalStore(subscribe, minuteNow, () => null);
  if (minute === null) return <span className="text-xs">&nbsp;</span>;
  const at = new Date(minute * 60_000);
  const time = new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(at);
  const tz = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" }).formatToParts(at).find((p) => p.type === "timeZoneName")?.value;
  return (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span dir="ltr" className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{time}</span>
      {tz && <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{tz}</span>}
    </span>
  );
}
