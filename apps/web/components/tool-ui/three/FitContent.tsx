"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Keeps the whole drawn object inside the canvas: when any mesh/line (labels, grids, helpers, star
 * fields and invisible hit planes excluded) projects past `margin` of the view, the camera zooms
 * out just enough. The fit is recomputed from the base zoom (the camera's own, or whatever a
 * width/aspect fitter set), never accumulated, and it never zooms in past that base, so a scene
 * that already fits keeps its framing. Opt an object out with userData.fitIgnore.
 */
export default function FitContent({ margin = 0.94 }: { margin?: number }) {
  const tmp = useMemo(() => ({ v: new THREE.Vector3() }), []);
  const st = useRef({ frame: 0, written: NaN, factor: 1 });
  useFrame((state) => {
    const s = st.current;
    // Every frame while idle-rendering (demand loop); every 20th frame when animating continuously.
    if (state.frameloop === "always" && s.frame++ % 20 !== 0) return;
    if (state.size.width < 50 || state.size.height < 50) return;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Someone else set the zoom since our last write → that is the new base.
    const base = cam.zoom === s.written ? cam.zoom / s.factor : cam.zoom;
    cam.zoom = base;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    let m = 0;
    state.scene.traverseVisible((o) => {
      if (m > 4) return;
      const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
      if (!g || (o as THREE.Sprite).isSprite || (o as THREE.Points).isPoints || o.type === "GridHelper" || o.type === "AxesHelper") return;
      for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData.fitIgnore) return;
      const mats = ([] as THREE.Material[]).concat((o as THREE.Mesh).material ?? []);
      if (mats.length && mats.every((mt) => !mt.visible || (mt.transparent && mt.opacity < 0.05))) return;
      // drei <Line> (Line2) keeps a unit quad in "position"; its real points are the instance ends.
      const attrs = g.getAttribute("instanceStart") ? [g.getAttribute("instanceStart"), g.getAttribute("instanceEnd")] : [g.getAttribute("position")];
      for (const pos of attrs) {
        if (!pos || !pos.count) continue;
        // Real vertices (sampled) rather than box corners, so round bases are not over-counted.
        const step = Math.max(1, Math.ceil(pos.count / 1500));
        for (let i = 0; i < pos.count; i += step) {
          tmp.v.fromBufferAttribute(pos as THREE.BufferAttribute, i).applyMatrix4(o.matrixWorld).project(cam);
          if (tmp.v.z < 1) m = Math.max(m, Math.abs(tmp.v.x), Math.abs(tmp.v.y));
        }
      }
    });
    const factor = m > margin && m < 4 ? margin / m : 1;
    cam.zoom = base * factor;
    cam.updateProjectionMatrix();
    if (factor !== s.factor) state.invalidate();
    s.factor = factor;
    s.written = cam.zoom;
    state.gl.domElement.dataset.fitZoom = factor.toFixed(3);
  });
  return null;
}
