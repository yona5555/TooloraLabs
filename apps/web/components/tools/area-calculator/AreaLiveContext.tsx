import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { AreaDraft } from "./types";

export type AreaLiveDims = AreaDraft;
export const { LiveProvider: AreaLiveProvider, useLiveState: useAreaLive } = createLiveToolState<AreaLiveDims>();
