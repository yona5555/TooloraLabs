"use client";
/**
 * three.js side of the animation layer (motion.ts). A shared canvas (DemandCanvas3D, Scene3DCanvas, the heart
 * and graph canvases) calls useSceneHost(ref) on its wrapper: the canvas runs frameloop "demand" while on screen
 * with the page visible and "never" otherwise (fully stopped), and provides whether motion is allowed. Scenes
 * never call state.invalidate() in a loop themselves: they animate with useSceneFrame, which asks for the next
 * frame only during an active episode (useMotionEpisode) while motion is allowed.
 */
import { createContext, useContext, useEffect, type ReactNode, type RefObject } from "react";
import { useFrame, useThree, type RootState } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useInView, usePageVisible } from "./motion";

const SceneMotionContext = createContext(false);

/** For the canvas wrapper at `ref`: its frameloop and whether its scenes may move. */
export function useSceneHost(ref: RefObject<Element | null>): { frameloop: "demand" | "never"; motion: boolean } {
  const inView = useInView(ref);
  const visible = usePageVisible();
  const reduced = usePrefersReducedMotion();
  return { frameloop: inView && visible ? "demand" : "never", motion: inView && visible && !reduced };
}

/** Inside <Canvas>: provides the motion flag and redraws once when the canvas comes back on screen. */
export function SceneMotion({ motion, frameloop, children }: { motion: boolean; frameloop: "demand" | "never"; children: ReactNode }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (frameloop === "demand") invalidate();
  }, [frameloop, invalidate]);
  return <SceneMotionContext.Provider value={motion}>{children}</SceneMotionContext.Provider>;
}

/** True when scenes in this canvas may move (on screen, page visible, no reduced-motion preference). */
export function useSceneMotionAllowed(): boolean {
  return useContext(SceneMotionContext);
}

/**
 * A scene's animation frame: runs `frame(state, dt)` and requests the next frame only while `active` and motion
 * is allowed; `frame` returns false when the motion is over. Without motion the scene draws its resting state
 * (the frame is still called once per demanded render with dt 0, so it can place things at rest).
 */
export function useSceneFrame(frame: (state: RootState, dt: number) => boolean | void, active: boolean) {
  const allowed = useSceneMotionAllowed();
  const invalidate = useThree((s) => s.invalidate);
  const moving = active && allowed;
  useFrame((state, dt) => {
    const more = frame(state, moving ? Math.min(dt, 0.1) : 0);
    if (moving && more !== false) state.invalidate();
  });
  useEffect(() => {
    if (moving) invalidate();
  }, [moving, invalidate]);
}
