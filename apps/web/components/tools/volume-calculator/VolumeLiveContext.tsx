import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { Solid3DDraft } from "./types";

export type VolumeLiveDims = Solid3DDraft;
export const { LiveProvider: VolumeLiveProvider, useLiveState: useVolumeLive } = createLiveToolState<VolumeLiveDims>();
