export type AgeScenarioExample = { key: string; birthDate: string };

/** Real fixed birth dates spanning different generations (used by the education life-stage widget). */
export const AGE_SCENARIOS: AgeScenarioExample[] = [
  { key: "genZExample", birthDate: "2005-03-20" },
  { key: "millennialExample", birthDate: "1994-06-15" },
  { key: "genXExample", birthDate: "1975-11-02" },
  { key: "boomerExample", birthDate: "1958-08-09" },
];
