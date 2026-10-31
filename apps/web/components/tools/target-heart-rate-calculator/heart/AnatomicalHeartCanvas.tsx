"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import PreviewReady from "@/components/tool-ui/three/PreviewReady";
import { beat, createHeartObject } from "./heartModel";

/**
 * The heavy part (three + fiber + drei): only ever imported through HeartViewer's dynamic().
 * Lit by in-code studio lightformers (no HDR files), drawn at DPR ≤ 2. Frames are drawn on demand only: the heart
 * beats for BEAT_SECONDS after a BPM change, never on load, then rests, so nothing renders while the page is idle.
 * The beat pauses while `running` is false (off screen, page hidden). The shared motion layer of PR #28
 * (tool-ui/motion) replaces this local episode when it merges; this component then takes that layer's version.
 */
const BEAT_SECONDS = 8;

export type AnatomicalHeartCanvasProps = { bpm: number; running: boolean; reduced: boolean; dark: boolean };

function Heart({ bpm, running, reduced }: { bpm: number; running: boolean; reduced: boolean }) {
  const heart = useMemo(() => createHeartObject(), []);
  useEffect(() => () => heart.dispose(), [heart]);
  const invalidate = useThree((s) => s.invalidate);
  const period = 60 / Math.min(240, Math.max(30, bpm || 60));
  const phase = useRef(0);
  const shownPeriod = useRef(period);
  const beatLeft = useRef(0);
  useEffect(() => {
    if (period !== shownPeriod.current) {
      shownPeriod.current = period;
      beatLeft.current = BEAT_SECONDS;
    }
    if (reduced) {
      beatLeft.current = 0;
      heart.setBeat(0, 0);
    }
    invalidate();
  }, [reduced, running, period, heart, invalidate]);

  useFrame((_, dt) => {
    if (!running || reduced || beatLeft.current <= 0) return;
    const step = Math.min(dt, 0.1);
    beatLeft.current -= step;
    // Phase advances with the current period, so a BPM change never jumps mid-beat.
    phase.current = beatLeft.current > 0 ? (phase.current + step / period) % 1 : 0;
    const b = beatLeft.current > 0 ? beat(phase.current) : { atr: 0, ven: 0 };
    heart.setBeat(b.atr, b.ven);
    invalidate();
  });

  return (
    // Turned slightly to the patient's left so the LV, the apex and the arch read in depth.
    <group position={[-0.08, -0.42, 0]} rotation={[0.08, -0.32, 0.04]} scale={1.02}>
      <primitive object={heart.group} />
    </group>
  );
}

export default function AnatomicalHeartCanvas({ bpm, running, reduced, dark }: AnatomicalHeartCanvasProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 6.2], fov: 36 }}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      {/* Soft studio lighting: big key softbox, cool fill, warm rim, plus matching reflections. */}
      <ambientLight intensity={dark ? 0.18 : 0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#fff4ec" />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.7} color="#dbe6ff" />
      <directionalLight position={[0, 3, -5]} intensity={1.3} color="#ffd9c4" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[2.5, 3, 4]} scale={[4, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#cfdcff" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffe2d2" position={[0, 4, -4]} scale={2.5} />
        <Lightformer form="rect" intensity={0.6} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} />
      </Environment>
      <Heart bpm={bpm} running={running} reduced={reduced} />
      <PreviewReady />
      <OrbitControls makeDefault enablePan={false} enableZoom zoomSpeed={0.6} minDistance={3.2} maxDistance={9} rotateSpeed={0.8} />
    </Canvas>
  );
}
