import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { FractionOperation } from "./types";

export type FractionLiveDims = {
  operation: FractionOperation;
  numeratorA: number;
  denominatorA: number;
  numeratorB: number;
  denominatorB: number;
};
export const { LiveProvider: FractionLiveProvider, useLiveState: useFractionLive } = createLiveToolState<FractionLiveDims>();
