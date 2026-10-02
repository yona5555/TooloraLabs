import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { SignificantFiguresOperation } from "./types";

export type SignificantFiguresLiveDims = {
  operation: SignificantFiguresOperation;
  rawValueA: string;
  rawValueB: string;
  roundToDigits: number;
};
export const { LiveProvider: SignificantFiguresLiveProvider, useLiveState: useSignificantFiguresLive } = createLiveToolState<SignificantFiguresLiveDims>();
