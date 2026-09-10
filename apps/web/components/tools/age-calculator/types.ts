import type { AgeResult } from "@tooloralabs/tools";

export type CalendarSystem = "gregorian" | "hijri";

export type AgeExtendedResult = AgeResult;

export type AgeScenario = { key: string; birthDate: string };

/** Real fixed birth dates spanning different generations, so the milestone/generation content varies meaningfully between presets. */
export const AGE_SCENARIOS: AgeScenario[] = [
  { key: "genZExample", birthDate: "2005-03-20" },
  { key: "millennialExample", birthDate: "1994-06-15" },
  { key: "genXExample", birthDate: "1975-11-02" },
  { key: "boomerExample", birthDate: "1958-08-09" },
];
