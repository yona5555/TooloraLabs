"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Flags the canvas data-preview-ready="true" once `frames` frames have rendered, so the tool-card
 * preview generator (scripts/generate-tool-previews.mts) never captures a half-drawn scene. With a
 * "demand" frame loop it asks for the extra frames itself, then goes idle again. Only that generator
 * (window.__capturePreview): on a visitor's page those frames would keep rendering after the page has
 * settled, seconds later on a slow device.
 */
export default function PreviewReady({ frames = 30 }: { frames?: number }) {
  const n = useRef(0);
  useFrame((state) => {
    if (n.current >= frames || !(window as { __capturePreview?: boolean }).__capturePreview) return;
    n.current += 1;
    state.gl.domElement.dataset.previewReady = n.current >= frames ? "true" : "false";
    if (n.current < frames) state.invalidate();
  });
  return null;
}
