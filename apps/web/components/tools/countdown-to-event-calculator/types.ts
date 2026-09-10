export type { CountdownOutput } from "@tooloralabs/tools";

export type CountdownScenario = { key: string; eventNameKey: string; daysFromNow: number; time: string };

/** Real examples spanning near-term and long-term countdowns, expressed as an offset from today so they stay valid over time. */
export const COUNTDOWN_SCENARIOS: CountdownScenario[] = [
  { key: "conferenceTalk", eventNameKey: "conferenceTalk", daysFromNow: 14, time: "10:30" },
  { key: "productLaunch", eventNameKey: "productLaunch", daysFromNow: 60, time: "09:00" },
  { key: "weddingDay", eventNameKey: "weddingDay", daysFromNow: 200, time: "16:00" },
];
