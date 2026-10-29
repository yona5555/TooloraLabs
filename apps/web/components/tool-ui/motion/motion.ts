"use client";
/**
 * The one animation layer of the site. Every requestAnimationFrame loop, every animation interval and every
 * three.js frame request goes through it, so nothing renders while the page is idle:
 *   - motion runs only during an episode: started by the visitor (play) or by a change of the data it shows,
 *     never on load, and it ends by itself (the loop's own end, or EPISODE_MS at most);
 *   - it is paused while its element is off screen (IntersectionObserver) or the page is hidden
 *     (visibilitychange), and resumes where it was;
 *   - prefers-reduced-motion: no motion at all; the drawing shows its resting state.
 * three.js scenes use useSceneFrame (scene-motion.tsx) inside a shared canvas, which also stops the canvas
 * itself (frameloop "never") while it is off screen or the page is hidden.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type DependencyList, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** The longest an episode runs before the drawing comes to rest (a loop may end sooner). */
export const EPISODE_MS = 8000;

function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}
/** True while the page is visible (server snapshot: visible). */
export function usePageVisible(): boolean {
  return useSyncExternalStore(subscribeVisibility, () => document.visibilityState !== "hidden", () => true);
}

/** True while the element is within `rootMargin` of the viewport (always true for `null`: a value with no element). */
export function useInView(ref: RefObject<Element | null> | null, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(ref === null);
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** May the element at `ref` move now: on screen, page visible, no reduced-motion preference. */
export function useMotionAllowed(ref: RefObject<Element | null> | null): boolean {
  const inView = useInView(ref);
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();
  return inView && visible && !reduced;
}

/**
 * A motion episode: `active` turns true when `deps` change after the first render (new data) or when `play()`
 * is called (the visitor), and false after EPISODE_MS or when `stop()` is called (the animation reached its end).
 * Never active on load.
 */
export function useMotionEpisode(deps: DependencyList = []): { active: boolean; play: () => void; stop: () => void } {
  const [active, setActive] = useState(false);
  const first = useRef(true);
  const play = useCallback(() => setActive(true), []);
  const stop = useCallback(() => setActive(false), []);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller's data is the trigger
  }, deps);
  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => setActive(false), EPISODE_MS);
    return () => clearTimeout(id);
  }, [active]);
  return { active, play, stop };
}

/**
 * The shared requestAnimationFrame loop: calls `frame(dtSeconds)` each frame while `active` and motion is
 * allowed for the element at `ref`; `frame` returns false when the animation is over (the loop stops and
 * `onEnd` runs). Off screen or hidden it pauses without losing its place (dt skips the paused time). With
 * prefers-reduced-motion an active animation ends at once (`onEnd`), leaving the drawing at rest.
 */
export function useMotionLoop(ref: RefObject<Element | null> | null, frame: (dt: number) => boolean | void, active: boolean, onEnd?: () => void) {
  const inView = useInView(ref);
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();
  const allowed = inView && visible && !reduced;
  const cb = useRef(frame);
  const end = useRef(onEnd);
  useEffect(() => {
    cb.current = frame;
    end.current = onEnd;
  });
  useEffect(() => {
    if (active && reduced) end.current?.();
  }, [active, reduced]);
  useEffect(() => {
    if (!active || !allowed) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      const dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      if (cb.current(dt) === false) {
        end.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, allowed]);
}

/**
 * setInterval for content that changes with time (clocks, countdowns, tickers): runs only while the element at
 * `ref` is on screen and the page is visible, and fires once on resume so the content is current. For pure
 * animation (motion) pass `motion: true`: it then also stops for prefers-reduced-motion.
 */
export function useVisibleInterval(ref: RefObject<Element | null> | null, tick: () => void, ms: number, { motion = false, active = true }: { motion?: boolean; active?: boolean } = {}) {
  const inView = useInView(ref);
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();
  const cb = useRef(tick);
  useEffect(() => {
    cb.current = tick;
  });
  const run = active && inView && visible && !(motion && reduced);
  useEffect(() => {
    if (!run) return;
    if (!motion) cb.current();
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [run, ms, motion]);
}

/**
 * A number that eases (cubic out, `ms`) from its shown value to each new `target` through useMotionLoop: a
 * change of data is the episode; reduced motion or a hidden page shows the target at once.
 */
export function useTween(target: number, ms: number, ref: RefObject<Element | null> | null = null): number {
  const [value, setValue] = useState(target);
  const anim = useRef({ from: target, to: target, t: 0 });
  useMotionLoop(
    ref,
    (dt) => {
      const a = anim.current;
      if (a.to !== target) Object.assign(a, { from: value, to: target, t: 0 });
      a.t = Math.min(1, a.t + (dt * 1000) / ms);
      setValue(a.from + (a.to - a.from) * (1 - (1 - a.t) ** 3));
      return a.t < 1;
    },
    value !== target,
    () => {
      anim.current = { from: target, to: target, t: 1 };
      setValue(target);
    },
  );
  return value;
}

/**
 * A clock subscription (useSyncExternalStore or an effect): calls `cb` every `ms` while the page is visible,
 * stops while it is hidden, and calls `cb` at once when it becomes visible again, so the time shown is current.
 */
export function subscribeVisibleClock(ms: number, cb: () => void): () => void {
  let id: ReturnType<typeof setInterval> | null = null;
  const start = () => {
    if (id === null) id = setInterval(cb, ms);
  };
  const stop = () => {
    if (id !== null) clearInterval(id);
    id = null;
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") stop();
    else {
      cb();
      start();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  if (document.visibilityState !== "hidden") start();
  return () => {
    stop();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
