export type {
  StudyTimeCalculatorError as StudyTimeError,
  StudyTimeCalculatorOutput as StudyTimeResult,
} from "@tooloralabs/tools";

export type StudySessionScenario = {
  key: string;
  totalMinutes: string;
  workMinutes: string;
  shortBreakMinutes: string;
  longBreakMinutes: string;
  pomodorosBeforeLongBreak: string;
};

/** Real, named session lengths built on the classic 25/5/15-minute Pomodoro cadence, just varying total available time. */
export const STUDY_SESSION_SCENARIOS: StudySessionScenario[] = [
  { key: "quickSession", totalMinutes: "30", workMinutes: "25", shortBreakMinutes: "5", longBreakMinutes: "15", pomodorosBeforeLongBreak: "4" },
  { key: "standardSession", totalMinutes: "120", workMinutes: "25", shortBreakMinutes: "5", longBreakMinutes: "15", pomodorosBeforeLongBreak: "4" },
  { key: "deepWorkSession", totalMinutes: "240", workMinutes: "25", shortBreakMinutes: "5", longBreakMinutes: "15", pomodorosBeforeLongBreak: "4" },
  { key: "allDaySession", totalMinutes: "480", workMinutes: "25", shortBreakMinutes: "5", longBreakMinutes: "15", pomodorosBeforeLongBreak: "4" },
];
