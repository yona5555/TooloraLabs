export type { DiceFaces, DiceRollerOutput } from "@tooloralabs/tools";

export const FACE_OPTIONS = [4, 6, 8, 10, 12, 20] as const;

export type RollHistoryEntry = {
  id: string;
  faces: number;
  rolls: number[];
  total: number;
};
