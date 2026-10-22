"use client";

import { useId } from "react";

/**
 * 2D anatomical heart (anterior view, apex low on the viewer's right) for browsers without WebGL.
 * Atria pulse just before the ventricles at the target BPM; still under reduced motion or off screen.
 */
export default function HeartSvg({ bpm, reduced, paused }: { bpm: number; reduced: boolean; paused: boolean }) {
  const id = useId().replace(/:/g, "");
  const period = `${(60 / Math.min(240, Math.max(30, bpm || 60))).toFixed(3)}s`;
  const anim = (name: string, origin: string) =>
    reduced
      ? undefined
      : { animation: `${name}-${id} ${period} ease-in-out infinite`, animationPlayState: paused ? "paused" : "running", transformOrigin: origin, transformBox: "view-box" as const };
  const g = (s: string) => `url(#${s}-${id})`;

  return (
    <svg viewBox="0 0 300 330" className="absolute inset-0 m-auto h-[88%] w-[88%]" role="img" aria-hidden="true">
      <style>{`
        @keyframes atr-${id} { 0%,100% { transform: scale(1) } 6% { transform: scale(0.95) } 14% { transform: scale(1) } }
        @keyframes ven-${id} { 0%,10%,100% { transform: scale(1) } 26% { transform: scale(0.93, 0.95) } 44% { transform: scale(1.01) } 52% { transform: scale(1) } }
      `}</style>
      <defs>
        <radialGradient id={`muscle-${id}`} cx="38%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#c0353a" />
          <stop offset="55%" stopColor="#8a1c21" />
          <stop offset="100%" stopColor="#4e0d11" />
        </radialGradient>
        <radialGradient id={`atrium-${id}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#b8383f" />
          <stop offset="100%" stopColor="#5f1218" />
        </radialGradient>
        <linearGradient id={`aorta-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e05a5f" />
          <stop offset="100%" stopColor="#9d2228" />
        </linearGradient>
        <linearGradient id={`pulm-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7184d0" />
          <stop offset="100%" stopColor="#36488f" />
        </linearGradient>
        <linearGradient id={`cava-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2b3a7c" />
          <stop offset="60%" stopColor="#5266b8" />
          <stop offset="100%" stopColor="#2b3a7c" />
        </linearGradient>
        <radialGradient id={`gloss-${id}`} cx="35%" cy="28%" r="40%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Great vessels (behind the body) */}
      <path d="M58 150 C56 110 58 70 60 18" stroke={g("cava")} strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M128 128 C120 90 118 66 136 50 C158 30 196 34 210 60 C220 80 222 110 222 150" stroke={g("aorta")} strokeWidth="28" fill="none" strokeLinecap="round" />
      <path d="M140 46 L128 8 M168 38 L172 4 M196 46 L214 10" stroke={g("aorta")} strokeWidth="11" strokeLinecap="round" />
      <path d="M150 140 C150 112 160 96 172 86 C186 76 212 78 252 82" stroke={g("pulm")} strokeWidth="24" fill="none" strokeLinecap="round" />
      <path d="M170 88 C150 84 120 84 90 88" stroke={g("pulm")} strokeWidth="18" fill="none" strokeLinecap="round" />

      {/* Atria */}
      <g style={anim("atr", "50% 40%")}>
        <ellipse cx="72" cy="150" rx="46" ry="50" fill={g("atrium")} />
        <path d="M84 112 C100 100 122 106 126 122 C112 126 96 126 84 112 Z" fill="#9e2a31" />
        <path d="M224 128 C244 120 258 132 252 146 C240 150 228 144 224 128 Z" fill="#9e2a31" />
      </g>

      {/* Ventricles */}
      <g style={anim("ven", "48% 50%")}>
        <path
          d="M80 168 C76 130 120 118 160 124 C206 130 246 140 250 178 C254 222 236 262 214 292 C204 306 196 318 188 322 C170 300 132 270 108 240 C90 218 82 194 80 168 Z"
          fill={g("muscle")}
        />
        {/* RV / LV divide: anterior interventricular groove with fat, LAD and great cardiac vein. */}
        <path d="M162 130 C168 180 178 250 188 318" stroke="#d8b25c" strokeOpacity="0.75" strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M162 130 C168 180 178 250 188 318" stroke="#c0262b" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        <path d="M170 132 C176 182 186 250 192 310" stroke="#3d4f9a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* Diagonals and marginals */}
        <path d="M168 176 C190 184 212 196 232 214 M174 222 C192 232 206 246 218 262" stroke="#c0262b" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M100 170 C104 200 116 226 136 252 M130 160 C128 190 136 214 150 240" stroke="#3d4f9a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* AV groove fat + RCA / circumflex */}
        <path d="M84 162 C120 142 170 138 214 140 C232 142 246 150 250 160" stroke="#d8b25c" strokeOpacity="0.8" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M86 164 C120 146 168 140 212 142 C232 144 246 152 250 162" stroke="#c0262b" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M92 172 C96 200 104 222 118 244" stroke="#c0262b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M80 168 C76 130 120 118 160 124 C206 130 246 140 250 178 C254 222 236 262 214 292 C204 306 196 318 188 322 C170 300 132 270 108 240 C90 218 82 194 80 168 Z" fill={g("gloss")} />
      </g>
    </svg>
  );
}
