/**
 * The clock every server data path reads (render time, fetch timestamps, "served at"). In production it is
 * the wall clock. The lock/audit fixture build (tests/fixtures/offline-fetch.mjs, replay mode) sets
 * TOOLORA_FIXED_NOW to the locks' page clock, so the server picks the same forecast hour, candle window and
 * "today" on every build and every day, and agrees with the browser's fixed clock.
 */
export function dataNow(): number {
  const fixed = process.env.TOOLORA_FIXED_NOW;
  return fixed ? Date.parse(fixed) : Date.now();
}
