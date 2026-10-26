"use client";
import { useContext, useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Label3D from "@/components/tool-ui/three/Label3D";
import { SceneReadyContext } from "./ViewportScene";
import PreviewReady from "./PreviewReady";
import FitContent from "./FitContent";

/** The page font (Inter via --glass-font) resolved to a real family list the canvas can draw with. */
let pageFont: string | null = null;
function resolvePageFont(): string {
  if (pageFont) return pageFont;
  const el = document.createElement("span");
  el.style.fontFamily = "var(--glass-font)";
  el.style.display = "none";
  document.body.appendChild(el);
  pageFont = getComputedStyle(el).fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif";
  el.remove();
  return pageFont;
}

/** Label3D in the site font (Inter), not the shared default monospace. */
export function SiteLabel3D(props: ComponentProps<typeof Label3D>) {
  const [font] = useState(resolvePageFont);
  return <Label3D font={font} {...props} />;
}

/** Narrow canvases would crop the sides: zoom out until `fitAspect` (scene width / height) fits. */
function FitAspect({ fitAspect }: { fitAspect: number }) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const { camera, invalidate } = get();
    camera.zoom = Math.min(1, size.width / Math.max(1, size.height) / fitAspect);
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, size, fitAspect]);
  return null;
}

/** Re-renders once when inputs change (frameloop "demand": nothing runs while idle). */
export function Invalidate({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate);
  const key = JSON.stringify(deps);
  useEffect(() => {
    invalidate();
  }, [key, invalidate]);
  return null;
}

/** Shared demand-frameloop canvas: transparent (card surface shows through), demand frameloop, orbit + zoom. */
export default function DemandCanvas3D({
  children,
  camera,
  minDistance = 4,
  maxDistance = 11,
  azimuth = 0.9,
  fitAspect = 1,
  testId,
}: {
  children: ReactNode;
  camera: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
  azimuth?: number;
  fitAspect?: number;
  testId: string;
}) {
  const onReady = useContext(SceneReadyContext);
  return (
    <Canvas
      data-testid={testId}
      dpr={[1, 2]}
      frameloop="demand"
      camera={{ position: camera, fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      className="cursor-grab touch-none active:cursor-grabbing"
      onCreated={({ gl }) => {
        // Ready once the first frame is on screen, so the 2D twin never gives way to an empty canvas.
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
        gl.domElement.dataset.phLive = "1";
      }}
    >
      <FitContent />
      <PreviewReady />
      <FitAspect fitAspect={fitAspect} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 8, 6]} intensity={1.1} />
      <directionalLight position={[-6, 3, -4]} intensity={0.35} />
      {children}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minAzimuthAngle={-azimuth}
        maxAzimuthAngle={azimuth}
        minPolarAngle={0.55}
        maxPolarAngle={1.75}
      />
    </Canvas>
  );
}
