"use client";
import { useTranslations } from "next-intl";
import type { TimeOperation } from "./types";

type Props = {
  h1: number; m1: number; s1: number;
  h2: number; m2: number; s2: number;
  operation: TimeOperation;
  resultSeconds: number;
};

const WIDTH = 320;
const BAR_HEIGHT = 28;
const GAP = 6;

function toSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s;
}

function pad(n: number): string {
  return String(Math.abs(n)).padStart(2, "0");
}

/**
 * Live bar model of the exact add/subtract operation currently entered
 * above — time1 and time2 drawn as proportionally-sized segments of the
 * combined total, joined by the active operator, distinct from
 * TimeClockDiagram (which only shows the final result on a clock face)
 * and TimeDurationScaleGauge (a self-contained example-passage widget).
 */
export default function TimeAddSubtractBarDiagram({ h1, m1, s1, h2, m2, s2, operation, resultSeconds }: Props) {
  const d = useTranslations("tools.time-calculator.addSubtractDiagram");

  const sec1 = toSeconds(h1, m1, s1);
  const sec2 = toSeconds(h2, m2, s2);
  const total = Math.max(sec1, sec2, Math.abs(resultSeconds), 1);

  const w1 = Math.max((sec1 / total) * WIDTH, 6);
  const w2 = Math.max((sec2 / total) * WIDTH, 6);
  const wResult = Math.max((Math.abs(resultSeconds) / total) * WIDTH, 6);

  const label1 = `${pad(h1)}:${pad(m1)}:${pad(s1)}`;
  const label2 = `${pad(h2)}:${pad(m2)}:${pad(s2)}`;
  const rh = Math.floor(Math.abs(resultSeconds) / 3600);
  const rm = Math.floor((Math.abs(resultSeconds) % 3600) / 60);
  const rs = Math.abs(resultSeconds) % 60;
  const labelResult = `${pad(rh)}:${pad(rm)}:${pad(rs)}`;

  return (
    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">{d("caption")}</p>
      <div dir="ltr" className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-8 shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400">{d("time1Label")}</span>
          <div className="h-7 rounded-md bg-blue-500 dark:bg-blue-400" style={{ width: w1, height: BAR_HEIGHT }} />
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{label1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 shrink-0 text-center text-sm font-bold text-zinc-400 dark:text-zinc-500">
            {operation === "add" ? "+" : "−"}
          </span>
          <div
            className="h-7 rounded-md bg-amber-500 dark:bg-amber-400"
            style={{ width: w2, height: BAR_HEIGHT, marginTop: GAP }}
          />
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{label2}</span>
        </div>
        <div className="mt-1 flex items-center gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
          <span className="w-8 shrink-0 text-center text-sm font-bold text-zinc-400 dark:text-zinc-500">=</span>
          <div className="h-7 rounded-md bg-emerald-600 dark:bg-emerald-400" style={{ width: wResult, height: BAR_HEIGHT }} />
          <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">{labelResult}</span>
        </div>
      </div>
    </div>
  );
}
