"use client";

import { Children, isValidElement, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Screen-space text label for the 3D scenes, drawn on a canvas sprite.
 *
 * Replaces drei <Html>: every <Html> mounts its own ReactDOM root and unmounts it
 * synchronously from inside the fiber commit, which React 19 reports as
 * "Attempted to synchronously unmount a root while React was already rendering".
 * A sprite stays inside the single fiber tree, so mounting/unmounting is clean.
 * The sprite keeps a constant pixel size (like Html), always draws on top and
 * the browser shapes Arabic/RTL text in fillText.
 * Labels of one scene never overlap: each frame a shared resolver projects every label,
 * then drops any label that would touch a higher one just below it (opt out with avoid={false}).
 */
export type Label3DProps = {
  position: [number, number, number];
  color: string;
  children?: ReactNode;
  text?: string;
  /** Pill background; omit for bare text. */
  bg?: string;
  /** Pill border colour (defaults to the text colour, translucent). */
  border?: string | false;
  fontSize?: number;
  weight?: number;
  opacity?: number;
  visible?: boolean;
  /** Screen offset in CSS pixels (+x right, +y up) from the anchor. */
  offset?: [number, number];
  /** "center" (default) or anchor the label's left/right edge on the point. */
  align?: "center" | "left" | "right";
  /**
   * World point to push the label away from: the label then sits beside its anchor, on the
   * screen side facing away from this point, `gap` px clear (e.g. arrow-tip labels pushed
   * out of a solid). The vector may be mutated every frame.
   */
  away?: THREE.Vector3;
  gap?: number;
  /** Take part in the scene's overlap resolver (default true). */
  avoid?: boolean;
};

/** One label's screen box for the current frame, before and after de-overlapping (CSS px, y up). */
type Entry = {
  active: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  dy: number;
  /** Render frame in which the resolver last placed this label. */
  frame: number;
  measure: (camera: THREE.Camera, width: number, height: number) => void;
};
type Registry = { entries: Set<Entry>; frame: number };
const registries = new WeakMap<THREE.Object3D, Registry>();
const STACK_GAP = 3;

function registryFor(scene: THREE.Object3D): Registry {
  let r = registries.get(scene);
  if (!r) {
    r = { entries: new Set(), frame: -1 };
    registries.set(scene, r);
  }
  return r;
}

/**
 * Highest label first; each later label takes the nearest free slot (stepping one label height
 * down, then up, alternately) that keeps it inside the canvas, so no two labels ever overlap.
 */
function resolve(entries: Set<Entry>, camera: THREE.Camera, width: number, height: number, frame: number) {
  const list: Entry[] = [];
  for (const e of entries) {
    e.dy = 0;
    if (!e.active) continue;
    e.measure(camera, width, height);
    e.frame = frame;
    list.push(e);
  }
  list.sort((a, b) => b.y - a.y || a.x - b.x);
  const placed: Entry[] = [];
  const free = (e: Entry, y: number) =>
    !placed.some((q) => Math.abs(q.x - e.x) < (q.w + e.w) / 2 + STACK_GAP && Math.abs(q.y + q.dy - y) < (q.h + e.h) / 2 + STACK_GAP);
  for (const e of list) {
    const step = e.h + STACK_GAP;
    const inside = (y: number) => y - e.h / 2 >= 0 && y + e.h / 2 <= height;
    let best = e.y;
    for (let k = 1; k <= 24 && !free(e, best); k++) {
      const down = e.y - Math.ceil(k / 2) * step;
      const up = e.y + Math.ceil(k / 2) * step;
      const y = k % 2 ? down : up;
      const alt = k % 2 ? up : down;
      if (inside(y) && free(e, y)) best = y;
      else if (inside(alt) && free(e, alt)) best = alt;
    }
    e.dy = best - e.y;
    placed.push(e);
  }
}

const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const RES = 3; // canvas pixels per CSS pixel, crisp on retina

function flatten(node: ReactNode): string {
  let out = "";
  Children.forEach(node, (c) => {
    if (typeof c === "string" || typeof c === "number") out += String(c);
    else if (isValidElement<{ children?: ReactNode }>(c)) out += flatten(c.props.children);
  });
  return out;
}

const withAlpha = (color: string, a: string) => (/^#[0-9a-f]{6}$/i.test(color) ? color + a : color);

export default function Label3D({
  position,
  color,
  children,
  text,
  bg,
  border,
  fontSize = 11,
  weight = 600,
  opacity = 1,
  visible = true,
  offset = [0, 0],
  align = "center",
  away,
  gap = 8,
  avoid = true,
}: Label3DProps) {
  const label = text ?? flatten(children);
  const sprite = useRef<THREE.Sprite>(null);
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), s: new THREE.Vector3() }), []);

  const { texture, w, h } = useMemo(() => {
    const padX = bg ? 6 : 1;
    const padY = bg ? 2 : 1;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const font = `${weight} ${fontSize * RES}px ${FONT}`;
    ctx.font = font;
    const tw = Math.ceil(ctx.measureText(label).width / RES);
    const cw = Math.max(2, tw + padX * 2 + 2);
    const ch = Math.ceil(fontSize * 1.35) + padY * 2 + 2;
    canvas.width = cw * RES;
    canvas.height = ch * RES;
    ctx.scale(RES, RES);
    if (bg) {
      ctx.beginPath();
      ctx.roundRect(1, 1, cw - 2, ch - 2, 6);
      ctx.fillStyle = bg;
      ctx.fill();
      if (border !== false) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = border ?? withAlpha(color, "66");
        ctx.stroke();
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2 + RES * 0.5);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return { texture: tex, w: cw, h: ch };
  }, [label, color, bg, border, fontSize, weight]);

  useEffect(() => () => texture.dispose(), [texture]);

  const scene = useThree((st) => st.scene);
  const boxRef = useRef<Entry>({ active: false, x: 0, y: 0, w: 0, h: 0, dy: 0, frame: -1, measure: () => {} });

  useEffect(() => {
    if (!avoid) return;
    const box = boxRef.current;
    const reg = registryFor(scene);
    reg.entries.add(box);
    return () => {
      reg.entries.delete(box);
    };
  }, [scene, avoid]);

  // Every render refreshes the measuring closure (latest props), before any frame can use it.
  useEffect(() => {
    const box = boxRef.current;
    box.active = visible && opacity > 0;
    // Screen centre (CSS px from the canvas bottom-left) incl. offset/away/align, before de-overlapping.
    box.measure = (camera3, width, height) => {
      const s = sprite.current;
      if (!s) return;
      s.getWorldPosition(tmp.a).project(camera3);
      let ox = offset[0];
      let oy = offset[1];
      if (away) {
        tmp.b.copy(away).project(camera3);
        const dx = (tmp.a.x - tmp.b.x) * width;
        const dy = (tmp.a.y - tmp.b.y) * height;
        const len = Math.hypot(dx, dy);
        if (len > 1e-3) {
          const ux = dx / len;
          const uy = dy / len;
          // Distance from the box centre to its edge along (ux, uy), plus the gap.
          const edge = Math.min(Math.abs(ux) > 1e-6 ? w / 2 / Math.abs(ux) : Infinity, Math.abs(uy) > 1e-6 ? h / 2 / Math.abs(uy) : Infinity);
          ox += ux * (edge + gap);
          oy += uy * (edge + gap);
        }
      }
      const ax = align === "left" ? 0 : align === "right" ? 1 : 0.5;
      box.x = ((tmp.a.x + 1) / 2) * width + ox + (0.5 - ax) * w;
      box.y = ((tmp.a.y + 1) / 2) * height + oy;
      box.w = w;
      box.h = h;
    };
  });

  // Constant pixel size: with sizeAttenuation off, scale 1 spans the view height at distance 1.
  useFrame(({ camera, size, gl }) => {
    const s = sprite.current;
    if (!s) return;
    const cam = camera as THREE.PerspectiveCamera;
    const unit = cam.isPerspectiveCamera ? (2 * Math.tan((cam.fov * Math.PI) / 360)) / (size.height * cam.zoom) : 2 / size.height;
    // Sprites inherit their parents' scale; cancel it so the label keeps its pixel size.
    if (s.parent) s.parent.getWorldScale(tmp.s);
    else tmp.s.set(1, 1, 1);
    s.scale.set((w * unit) / (tmp.s.x || 1), (h * unit) / (tmp.s.y || 1), 1);
    const box = boxRef.current;

    box.active = visible && opacity > 0;

    if (avoid) {
      // The first label to run in a frame resolves the whole scene; the rest read their result.
      const reg = registryFor(scene);
      const frame = gl.info.render.frame;
      if (reg.frame !== frame) {
        reg.frame = frame;
        resolve(reg.entries, camera, size.width, size.height, frame);
      }
    }
    // Not placed by this frame's resolver (opted out, hidden, or mounted mid-frame): stand alone.
    if (!avoid || !box.active || box.frame !== gl.info.render.frame) {
      box.dy = 0;
      box.measure(camera, size.width, size.height);
    }

    // Back from the resolved screen centre to the sprite's anchor-relative centre.
    s.getWorldPosition(tmp.a).project(camera);
    const cx = box.x - ((tmp.a.x + 1) / 2) * size.width;
    const cy = box.y + box.dy - ((tmp.a.y + 1) / 2) * size.height;
    s.center.set(0.5 - cx / w, 0.5 - cy / h);
  });

  return (
    <sprite ref={sprite} position={position} visible={visible} renderOrder={1000}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        sizeAttenuation={false}
        toneMapped={false}
      />
    </sprite>
  );
}
