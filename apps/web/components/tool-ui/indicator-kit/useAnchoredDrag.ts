"use client";
import { useRef } from "react";

/**
 * Drag measured from where it started (pointer delta projected on the value axis), so a layout
 * shift above the visual while the calculator re-renders can never make the marker jump.
 */
export function useAnchoredDrag(value: number, axis: () => [number, number] | null, set: (v: number) => void, onActive?: (on: boolean) => void, span = 14) {
  const start = useRef<{ x: number; y: number; v: number; ax: [number, number] } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      const ax = axis();
      if (e.button !== 0 || !ax) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      start.current = { x: e.clientX, y: e.clientY, v: value, ax };
      onActive?.(true);
      e.stopPropagation();
      e.preventDefault();
    },
    onPointerMove: (e: React.PointerEvent) => {
      const st = start.current;
      if (!st) return;
      const [dx, dy] = st.ax;
      const t = ((e.clientX - st.x) * dx + (e.clientY - st.y) * dy) / (dx * dx + dy * dy || 1);
      set(st.v + t * span);
    },
    onPointerUp: () => {
      start.current = null;
      onActive?.(false);
    },
    onPointerCancel: () => {
      start.current = null;
      onActive?.(false);
    },
  };
}
