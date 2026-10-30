// The state a measurement reads, instead of a fixed wait, which lost the race on a loaded runner (dark theme colors
// read mid-transition): fonts and lazy chunks loaded, finite CSS/WAAPI animations jumped to their end, and no DOM
// change for QUIET_MS, at most MAX_MS for a page that ticks forever.
const QUIET_MS = 500;
const MAX_MS = 5000;

export async function settle(p) {
  await p.evaluate(() => document.fonts.ready);
  await p.waitForLoadState("networkidle", { timeout: MAX_MS }).catch(() => {}); // a page that polls never idles
  await p.evaluate(
    ([quietMs, maxMs]) =>
      new Promise((resolve) => {
        const finish = () => {
          for (const a of document.getAnimations()) {
            if (a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity) a.finish();
          }
        };
        const start = performance.now();
        let last = start;
        const seen = new MutationObserver(() => (last = performance.now()));
        seen.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
        const tick = () => {
          finish();
          const now = performance.now();
          if (now - last >= quietMs || now - start >= maxMs) {
            seen.disconnect();
            resolve();
          } else setTimeout(tick, 50);
        };
        tick();
      }),
    [QUIET_MS, MAX_MS],
  );
}
