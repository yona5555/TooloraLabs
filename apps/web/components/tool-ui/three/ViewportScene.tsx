"use client";
import { createContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useWebGL } from "./webgl";

/**
 * Viewport-gated WebGL slots for a tool page: a scene mounts its
 * canvas only while it is on screen AND holds one of at most two slots; otherwise (off screen,
 * no free slot, or no WebGL at all) it shows the 2D version of the same indicator — never a
 * blank box. A released slot is handed on only after a cool-down, so the leaving canvas has
 * really lost its context first (live contexts never exceed two while scrolling).
 */
const MAX_LIVE = 2;
const COOL_DOWN_MS = 650;
const holders = new Set<symbol>();
const cooling = new Set<symbol>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function acquire(id: symbol): boolean {
  if (holders.has(id)) return true;
  if (holders.size + cooling.size >= MAX_LIVE) return false;
  holders.add(id);
  return true;
}
function release(id: symbol) {
  if (!holders.delete(id)) return;
  const token = Symbol("cooling");
  cooling.add(token);
  setTimeout(() => {
    cooling.delete(token);
    notify();
  }, COOL_DOWN_MS);
}


/** Set by DemandCanvas3D once its first frame exists; until then the 2D twin stays visible. */
export const SceneReadyContext = createContext<(() => void) | null>(null);

export function ViewportScene({ render3d, fallback, className = "", testId }: { render3d: () => ReactNode; fallback: ReactNode; className?: string; testId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [live, setLive] = useState(false);
  const gl = useWebGL() === true;
  const id = useRef<symbol>(Symbol(testId));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const me = id.current;
    if (!visible || !gl) return;
    const tryGet = () => {
      if (acquire(me)) setLive(true);
    };
    tryGet();
    listeners.add(tryGet);
    return () => {
      listeners.delete(tryGet);
      release(me);
      setLive(false);
    };
  }, [visible, gl]);

  const [ready, setReady] = useState(false);
  const show3d = live && visible && gl;
  const on3d = show3d && ready;
  if (!show3d && ready) setReady(false);
  return (
    <div ref={ref} data-ph-scene={testId} data-ph-mode={on3d ? "3d" : "2d"} data-preview="visual" data-preview-ready={on3d || !gl ? "true" : "false"} className={`relative flex w-full flex-col ${className}`}>
      <div className="flex w-full flex-1 flex-col" hidden={on3d}>
        {fallback}
      </div>
      {show3d && (
        <SceneReadyContext.Provider value={() => setReady(true)}>
          <div className="absolute inset-0" style={{ visibility: on3d ? "visible" : "hidden" }}>
            {render3d()}
          </div>
        </SceneReadyContext.Provider>
      )}
    </div>
  );
}
