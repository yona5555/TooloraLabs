export type {
  DayCode,
  ClassScheduleBuilderError as ScheduleError,
  ClassScheduleBuilderOutput as ScheduleResult,
  ScheduleConflict,
} from "@tooloralabs/tools";
export { DAY_CODES } from "@tooloralabs/tools";

export type DraftClass = {
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
};

export function emptyClass(): DraftClass {
  return { name: "", days: [], startTime: "09:00", endTime: "10:00" };
}

export type ScheduleScenario = { key: string; classes: DraftClass[] };

/** Real, hand-verified sample schedules spanning light / typical / heavy weekly course loads, plus one that deliberately overlaps to demo conflict detection. */
export const SCHEDULE_SCENARIOS: ScheduleScenario[] = [
  {
    key: "lightLoad",
    classes: [
      { name: "Intro to Psychology", days: ["mon", "wed"], startTime: "09:00", endTime: "10:15" },
      { name: "Studio Art I", days: ["thu"], startTime: "13:00", endTime: "15:30" },
    ],
  },
  {
    key: "typicalLoad",
    classes: [
      { name: "Calculus II", days: ["mon", "wed", "fri"], startTime: "09:00", endTime: "09:50" },
      { name: "General Chemistry", days: ["tue", "thu"], startTime: "10:00", endTime: "11:15" },
      { name: "World History", days: ["mon", "wed"], startTime: "13:00", endTime: "14:15" },
      { name: "English Composition", days: ["tue", "thu"], startTime: "14:30", endTime: "15:45" },
      { name: "Intro to Psychology", days: ["mon", "wed"], startTime: "15:00", endTime: "16:15" },
    ],
  },
  {
    key: "heavyLoad",
    classes: [
      { name: "Organic Chemistry", days: ["mon", "wed", "fri"], startTime: "08:00", endTime: "08:50" },
      { name: "Organic Chemistry Lab", days: ["tue", "thu"], startTime: "13:00", endTime: "16:00" },
      { name: "Physics II", days: ["mon", "wed", "fri"], startTime: "10:00", endTime: "10:50" },
      { name: "Linear Algebra", days: ["tue", "thu"], startTime: "09:00", endTime: "10:15" },
      { name: "Biology", days: ["tue", "thu"], startTime: "11:00", endTime: "12:15" },
      { name: "German I", days: ["mon", "wed", "fri"], startTime: "13:00", endTime: "13:50" },
      { name: "Seminar", days: ["fri"], startTime: "14:00", endTime: "16:00" },
    ],
  },
  {
    key: "conflictDemo",
    classes: [
      { name: "Macroeconomics", days: ["mon", "wed"], startTime: "09:00", endTime: "10:30" },
      { name: "Statistics", days: ["mon"], startTime: "09:30", endTime: "10:30" },
    ],
  },
];

export const DEFAULT_SCHEDULE_CLASSES: DraftClass[] = [
  { name: "Math 101", days: ["mon", "wed"], startTime: "09:00", endTime: "10:30" },
  { name: "Physics 201", days: ["mon"], startTime: "10:00", endTime: "11:00" },
];
