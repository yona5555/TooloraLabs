import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { Solid3DDraft } from "./types";

export type SurfaceAreaLiveDims = Solid3DDraft;
export const { LiveProvider: SurfaceAreaLiveProvider, useLiveState: useSurfaceAreaLive } = createLiveToolState<SurfaceAreaLiveDims>();
