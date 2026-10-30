"use client";
import { useSyncExternalStore } from "react";
import { useRenderedAt } from "./RenderClock";
import { subscribeVisibleClock } from "@/components/tool-ui/motion/motion";

export const SPARK_W = 112;
export const SPARK_H = 34;

/** A small price path ending at the latest value; a pulsing placeholder while `values` loads. */
export default function Sparkline({ values, up, width = SPARK_W, height = SPARK_H }: { values: number[] | null; up: boolean; width?: number; height?: number }) {
  if (!values || values.length < 2) {
    return <div style={{ width, height }} className="animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />;
  }
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const coords = values.map((p, i) => [(i / (values.length - 1)) * width, height - 2 - ((p - min) / range) * (height - 4)]);
  const d = `M ${coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ")}`;
  const [lx, ly] = coords[coords.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={d} fill="none" strokeWidth={1.5} className={up ? "stroke-emerald-500" : "stroke-red-500"} />
      <circle cx={lx} cy={ly} r={2.5} className={up ? "fill-emerald-500" : "fill-red-500"} />
    </svg>
  );
}

const MINUTE = 60_000;
const minuteNow = () => Math.floor(Date.now() / MINUTE) * MINUTE;
// tool-ui/motion: each minute while the page is visible, nothing while hidden
const subscribeMinutes = (tick: () => void) => subscribeVisibleClock(MINUTE, tick);

/** "now" / "5 minutes ago" for a timestamp, re-rendered every minute. Hydrates on the server's clock. */
export function useRelativeUpdatedLabel(lastUpdated: number, locale: string): string {
  const renderedAt = useRenderedAt();
  const now = useSyncExternalStore(subscribeMinutes, minuteNow, () => renderedAt ?? minuteNow());

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const minutes = Math.max(0, Math.round((now - lastUpdated) / MINUTE));
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  return hours < 48 ? rtf.format(-hours, "hour") : rtf.format(-Math.round(hours / 24), "day");
}
