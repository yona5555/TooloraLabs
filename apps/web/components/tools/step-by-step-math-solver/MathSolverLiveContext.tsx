import { createLiveToolState } from "@/lib/create-live-tool-state";
import type { MathSolverDraft } from "./types";

export type MathSolverLiveDims = MathSolverDraft;
export const { LiveProvider: MathSolverLiveProvider, useLiveState: useMathSolverLive } = createLiveToolState<MathSolverLiveDims>();
