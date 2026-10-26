"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { Graph3DSceneProps } from "./Graph3DScene";
import { useWebGL } from "@/components/tool-ui/three/webgl";

function Fallback() {
  return <div className="h-full w-full animate-pulse bg-gradient-to-br from-blue-50 to-zinc-100 calcdark:from-zinc-800 calcdark:to-zinc-900" />;
}

// three/fiber/drei live in their own chunk, fetched only when 3D mode is opened.
const Graph3DScene = dynamic(() => import("./Graph3DScene"), { ssr: false, loading: Fallback });

export default function Graph3D(props: Graph3DSceneProps) {
  const gl = useWebGL();
  const t = useTranslations("common.live3d");
  // Without WebGL the fiber canvas would throw and take the page down: a still note instead.
  if (gl === false) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-zinc-100 p-4 text-center text-sm text-zinc-600 calcdark:from-zinc-800 calcdark:to-zinc-900 calcdark:text-zinc-300" data-testid="graph-3d">
        {t("unavailable")}
      </div>
    );
  }
  return (
    <div dir="ltr" className="h-full w-full cursor-grab touch-none active:cursor-grabbing" data-testid="graph-3d">
      {gl ? <Graph3DScene {...props} /> : <Fallback />}
    </div>
  );
}
