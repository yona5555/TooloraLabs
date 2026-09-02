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
