"use client";
import { useSyncExternalStore } from "react";

let webgl: boolean | null = null;
function hasWebGL(): boolean {
  if (webgl === null) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") ?? c.getContext("webgl");
      webgl = !!gl;
      (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}
const noop = () => () => {};

/**
 * Whether this browser can create a WebGL context: null while unknown (server render and hydration),
 * then true or false. A fiber <Canvas> without one throws and takes the whole page down, so every 3D
 * mount checks this first and shows its 2D twin or a short note when it is false.
 */
export function useWebGL(): boolean | null {
  return useSyncExternalStore(noop, hasWebGL, () => null);
}
