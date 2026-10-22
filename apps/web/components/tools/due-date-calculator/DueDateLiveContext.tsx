"use client";
import { createContext, useContext, useMemo } from "react";
import { useLocale } from "next-intl";
import { DAY_MS, type DueSnap } from "./dueDate";

/**
 * The calculator's last valid result (method, entered date, cycle length and the dates the
 * calculator returned), shared with the input-column key dates, the Result card and the eight
 * indicator cards. The cycle-length card writes back, so dragging it moves the cycle input, the
 * due date, the Result table and the 3D week path together.
 */
export type DueLive = {
  snap: DueSnap;
  setCycle: (days: number) => void;
};

export const DueDateLiveContext = createContext<DueLive | null>(null);

export function useDueLive(): DueLive {
  const v = useContext(DueDateLiveContext);
  if (!v) throw new Error("useDueLive outside DueDateLiveContext");
  return v;
}

/** Localized date labels with Western digits (like the other health cards), from day numbers. */
export function useDateFmt() {
  const locale = useLocale();
  return useMemo(() => {
    const loc = `${locale}-u-nu-latn`;
    const mk = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(loc, { timeZone: "UTC", ...o });
    const long = mk({ day: "numeric", month: "short", year: "numeric" });
    const short = mk({ day: "numeric", month: "short" });
    const num = mk({ day: "2-digit", month: "2-digit", year: "numeric" });
    const month = mk({ month: "long", year: "numeric" });
    const monthShort = mk({ month: "short" });
    const weekday = mk({ weekday: "narrow" });
    const strip = (s: string) => s.replace(/[‎‏؜]/g, "");
    const at = (day: number) => new Date(day * DAY_MS);
    return {
      long: (day: number) => strip(long.format(at(day))),
      short: (day: number) => strip(short.format(at(day))),
      /** Numbers only (for 3D labels, which must not hold words). */
      num: (day: number) => strip(num.format(at(day))),
      month: (day: number) => strip(month.format(at(day))),
      monthShort: (day: number) => strip(monthShort.format(at(day))),
      /** Narrow weekday name, 0 = Sunday. */
      weekday: (i: number) => strip(weekday.format(new Date(Date.UTC(2023, 0, 1 + i)))),
    };
  }, [locale]);
}
export type DateFmt = ReturnType<typeof useDateFmt>;
