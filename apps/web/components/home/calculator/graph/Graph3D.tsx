"use client";

import dynamic from "next/dynamic";
import type { Graph3DSceneProps } from "./Graph3DScene";

function Fallback() {
  return <div className="h-full w-full animate-pulse bg-gradient-to-br from-blue-50 to-zinc-100 calcdark:from-zinc-800 calcdark:to-zinc-900" />;
}

// three/fiber/drei live in their own chunk, fetched only when 3D mode is opened.
const Graph3DScene = dynamic(() => import("./Graph3DScene"), { ssr: false, loading: Fallback });

export default function Graph3D(props: Graph3DSceneProps) {
  return (
    <div dir="ltr" className="h-full w-full cursor-grab touch-none active:cursor-grabbing" data-testid="graph-3d">
      <Graph3DScene {...props} />
    </div>
  );
}
