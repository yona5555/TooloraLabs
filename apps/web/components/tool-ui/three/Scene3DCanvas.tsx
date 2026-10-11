"use client";

import { useEffect, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { usePalette3D } from "./theme3d";

export type Scene3DCanvasProps = {
  children: ReactNode;
  camera?: [number, number, number];
  autoRotate?: boolean;
  /** Set false when the scene fits its own camera to the canvas (FitWidth would fight it). */
  fitWidth?: boolean;
  /** Optional rotation limits (radians) for scenes whose labels must never line up behind each other. */
  orbit?: { minAzimuth?: number; maxAzimuth?: number; minPolar?: number; maxPolar?: number };
};

/** Tall, narrow canvases (the table sets the height) would crop the sides; widen the view instead. */
function FitWidth() {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const { camera, invalidate } = get();
    const aspect = size.width / Math.max(1, size.height);
    camera.zoom = Math.min(1, aspect / 1.15);
    camera.updateProjectionMatrix();
    invalidate();
  }, [get, size]);
  return null;
}

/** The heavy part (three + fiber + drei). Only ever imported through Scene3D's dynamic(). */
export default function Scene3DCanvas({
  children,
  camera = [6, 5, 7],
  autoRotate = false,
  fitWidth = true,
  orbit,
}: Scene3DCanvasProps) {
  const p = usePalette3D();
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: camera, fov: 40 }}
      frameloop="demand"
      gl={{ antialias: true }}
    >
      <color attach="background" args={[p.bg]} />
      <ambientLight intensity={p.dark ? 0.55 : 0.7} />
      <directionalLight position={[6, 10, 6]} intensity={p.dark ? 0.9 : 1.1} />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} />
      {fitWidth ? <FitWidth /> : null}
      {children}
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        minAzimuthAngle={orbit?.minAzimuth ?? -Infinity}
        maxAzimuthAngle={orbit?.maxAzimuth ?? Infinity}
        minPolarAngle={orbit?.minPolar ?? 0}
        maxPolarAngle={orbit?.maxPolar ?? Math.PI}
      />
    </Canvas>
  );
}
