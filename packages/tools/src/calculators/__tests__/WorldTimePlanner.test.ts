import { describe, expect, it } from "vitest";
import {
  wtCityTime,
  wtConvertWallTime,
  wtNextTransition,
  wtPairOverlapMinutes,
  wtPlanMeeting,
  wtSharedWorkdays,
  wtStandardOffset,
  wtTransitionsBetween,
} from "../WorldTimePlanner";
import { WT_CITIES, wtFindCity, wtSearchCities, wtWeekendDays } from "../WorldTimeCities";

const wall = (year: number, month: number, day: number, hour: number, minute = 0) => ({ year, month, day, hour, minute, second: 0 });
const SAT_SUN = [6, 0];
const FRI_SAT = [5, 6];

describe("wtConvertWallTime across DST", () => {
  it("converts New York 09:00 to London, Riyadh and Tokyo in October 2026 (US on EDT, UK on BST)", () => {
    const c = wtConvertWallTime(wall(2026, 10, 17, 9), "America/New_York", ["Europe/London", "Asia/Riyadh", "Asia/Tokyo"]);
    expect(c.status).toBe("ok");
    expect(new Date(c.utcMs).toISOString()).toBe("2026-10-17T13:00:00.000Z");
    expect(c.rows.map((r) => r.parts.hour)).toEqual([14, 16, 22]);
    expect(c.rows[0].dst).toBe(true);
    expect(c.rows[1].dst).toBe(false);
  });

  it("uses the new offsets once London has left BST but New York has not (27 Oct 2026: 4 h gap)", () => {
    const c = wtConvertWallTime(wall(2026, 10, 27, 9), "America/New_York", ["Europe/London"]);
    expect(c.rows[0].parts.hour).toBe(13);
    expect(c.rows[0].offsetMinutes).toBe(0);
  });

  it("flags a wall time skipped by spring-forward (New York 2026-03-08 02:30) as a gap", () => {
    const c = wtConvertWallTime(wall(2026, 3, 8, 2, 30), "America/New_York", ["UTC"]);
    expect(c.status).toBe("gap");
    expect(c.gapMinutes).toBe(60);
    expect(c.resolved.hour).toBe(3);
    expect(c.resolved.minute).toBe(30);
    expect(new Date(c.utcMs).toISOString()).toBe("2026-03-08T07:30:00.000Z");
  });

  it("flags a repeated fall-back wall time (New York 2026-11-01 01:30) as an overlap with both instants", () => {
    const c = wtConvertWallTime(wall(2026, 11, 1, 1, 30), "America/New_York", ["Europe/London"]);
    expect(c.status).toBe("overlap");
    expect(new Date(c.utcMs).toISOString()).toBe("2026-11-01T05:30:00.000Z");
    expect(c.laterUtcMs).not.toBeNull();
    expect(new Date(c.laterUtcMs!).toISOString()).toBe("2026-11-01T06:30:00.000Z");
  });

  it("reports the calendar day shift across the date line (Honolulu evening = next day in Auckland)", () => {
    const c = wtConvertWallTime(wall(2026, 10, 17, 20), "Pacific/Honolulu", ["Pacific/Auckland"]);
    expect(c.rows[0].dayDelta).toBe(1); // Auckland is on NZDT (+13): 20:00 HST = 19:00 next day
    expect(c.rows[0].parts.day).toBe(18);
  });

  it("gives the Umm al-Qura Hijri date of each city's local date", () => {
    const r = wtCityTime(Date.UTC(2026, 9, 17, 12), "Asia/Riyadh");
    expect(r.hijri.year).toBe(1448);
    expect(r.weekday).toBe(6);
  });
});

describe("transitions and standard offsets", () => {
  const now = Date.UTC(2026, 9, 17, 12);
  it("finds London's and New York's next clock change after 17 Oct 2026", () => {
    const lon = wtNextTransition("Europe/London", now)!;
    expect(new Date(lon.utcMs).toISOString()).toBe("2026-10-25T01:00:00.000Z");
    expect(lon.offsetBefore - lon.offsetAfter).toBe(60);
    const ny = wtNextTransition("America/New_York", now)!;
    expect(new Date(ny.utcMs).toISOString()).toBe("2026-11-01T06:00:00.000Z");
  });

  it("returns null for zones without DST and finds Sydney's April 2027 change", () => {
    expect(wtNextTransition("Asia/Riyadh", now)).toBeNull();
    const syd = wtNextTransition("Australia/Sydney", now)!;
    expect(new Date(syd.utcMs).toISOString().slice(0, 10)).toBe("2027-04-03");
    expect(wtTransitionsBetween("Europe/Berlin", now, now + 365 * 86_400_000)).toHaveLength(2);
  });

  it("splits offsets into standard time and DST saving", () => {
    expect(wtStandardOffset("Europe/London", 2026)).toEqual({ standard: 0, saving: 60 });
    expect(wtStandardOffset("Australia/Sydney", 2026)).toEqual({ standard: 600, saving: 60 });
    expect(wtStandardOffset("Asia/Kolkata", 2026)).toEqual({ standard: 330, saving: 0 });
  });
});

describe("wtPlanMeeting overlap", () => {
  const work = [9 * 60, 17 * 60] as const;

  it("New York and London share 3 working hours on a weekday in October (5 h apart)", () => {
    const plan = wtPlanMeeting(
      [
        { zone: "America/New_York", weekend: SAT_SUN },
        { zone: "Europe/London", weekend: SAT_SUN },
      ],
      "America/New_York",
      { year: 2026, month: 10, day: 14 },
      ...work,
    );
    expect(plan.slots).toHaveLength(48);
    expect(plan.allOverlapMinutes).toBe(180);
    expect(plan.maxAvailable).toBe(2);
    expect(plan.bestWindow).toEqual({ start: 18, end: 23 }); // 09:00–11:30 slots in New York
    expect(wtPairOverlapMinutes(plan, 0, 1)).toBe(180);
  });

  it("respects the Fri–Sat weekend: Riyadh has no overlap with London on a Friday, but does on Thursday", () => {
    const cities = [
      { zone: "Europe/London", weekend: SAT_SUN },
      { zone: "Asia/Riyadh", weekend: FRI_SAT },
    ];
    const fri = wtPlanMeeting(cities, "Europe/London", { year: 2026, month: 10, day: 16 }, ...work);
    expect(fri.allOverlapMinutes).toBe(0);
    expect(fri.slots.every((s) => s.statuses[1] === "weekend")).toBe(true);
    const thu = wtPlanMeeting(cities, "Europe/London", { year: 2026, month: 10, day: 15 }, ...work);
    expect(thu.allOverlapMinutes).toBe(360); // Riyadh is 2 h ahead of BST: London 09:00–15:00 = Riyadh 11:00–17:00
  });

  it("finds no full overlap between New York and Tokyo but still ranks the best slots", () => {
    const plan = wtPlanMeeting(
      [
        { zone: "America/New_York", weekend: SAT_SUN },
        { zone: "Asia/Tokyo", weekend: SAT_SUN },
      ],
      "America/New_York",
      { year: 2026, month: 10, day: 14 },
      ...work,
    );
    expect(plan.allOverlapMinutes).toBe(0);
    expect(plan.maxAvailable).toBe(1);
    // The top-ranked slot keeps the other city in its 07:00–22:00 shoulder, never at night.
    expect(plan.slots[plan.bestSlots[0]].statuses).not.toContain("night");
  });

  it("covers 25 hours on the fall-back day in the reference zone", () => {
    const plan = wtPlanMeeting([{ zone: "America/New_York", weekend: SAT_SUN }], "America/New_York", { year: 2026, month: 11, day: 1 }, ...work);
    expect(plan.slots).toHaveLength(50);
  });

  it("computes shared workdays across weekends", () => {
    expect(wtSharedWorkdays([SAT_SUN, FRI_SAT])).toEqual([1, 2, 3, 4]);
    expect(wtSharedWorkdays([SAT_SUN, SAT_SUN])).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("city catalogue", () => {
  it("uses IANA zones accepted by Intl and real weekends", () => {
    for (const c of WT_CITIES) expect(() => new Intl.DateTimeFormat("en", { timeZone: c.zone })).not.toThrow();
    expect(wtFindCity("Asia/Riyadh")!.weekend).toBe("fri-sat");
    expect(wtFindCity("Asia/Dubai")!.weekend).toBe("sat-sun");
    expect(wtWeekendDays("thu-fri")).toEqual([4, 5]);
    expect(wtSearchCities("riy").map((c) => c.id)).toContain("Asia/Riyadh");
    expect(wtSearchCities("الرياض")[0].id).toBe("Asia/Riyadh");
  });
});
