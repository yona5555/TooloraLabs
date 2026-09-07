export type {
  KinematicsMode,
  KinematicsSolveForTime,
  KinematicsSolveForDistance,
  KinematicsCalculatorOutput as KinematicsResult,
} from "@tooloralabs/tools";
import type { KinematicsMode, KinematicsSolveForTime, KinematicsSolveForDistance } from "@tooloralabs/tools";

export const KINEMATICS_MODES: KinematicsMode[] = ["timeBased", "distanceBased"];
export const KINEMATICS_SOLVE_FOR_TIME: KinematicsSolveForTime[] = ["v", "v0", "a", "t"];
export const KINEMATICS_SOLVE_FOR_DISTANCE: KinematicsSolveForDistance[] = ["v", "v0", "a", "dx"];
