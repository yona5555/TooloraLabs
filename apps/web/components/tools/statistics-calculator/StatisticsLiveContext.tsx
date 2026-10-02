import { createLiveToolState } from "@/lib/create-live-tool-state";

export type StatisticsLiveDims = { rawData: string };
export const { LiveProvider: StatisticsLiveProvider, useLiveState: useStatisticsLive } = createLiveToolState<StatisticsLiveDims>();
