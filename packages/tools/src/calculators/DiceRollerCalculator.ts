import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type DiceFaces = 4 | 6 | 8 | 10 | 12 | 20;

export type DiceRollerInput = {
  diceCount: number;
  faces: DiceFaces;
  /** Injectable RNG for deterministic testing; defaults to Math.random. */
  randomFn?: () => number;
};

export type DiceRollerError = "invalid-dice-count" | "invalid-faces";

export type DiceRollerOutput = {
  error: DiceRollerError | null;
  rolls: number[];
  total: number;
  diceCount: number;
  faces: DiceFaces;
};

const VALID_FACES: DiceFaces[] = [4, 6, 8, 10, 12, 20];
const MAX_DICE_COUNT = 20;

export class DiceRollerCalculator extends BaseCalculator<DiceRollerInput, DiceRollerOutput> {
  metadata = {
    id: "dice-roller",
    slug: "dice-roller",
    name: "Dice Roller",
    category: "date-time",
    description: "Roll one or more virtual dice with customizable face counts.",
    version: "1.0.0",
  };

  execute(input: DiceRollerInput, _context: ToolContext): ToolResult<DiceRollerOutput> {
    const { diceCount, faces } = input;
    const randomFn = input.randomFn ?? Math.random;

    if (!Number.isInteger(diceCount) || diceCount < 1 || diceCount > MAX_DICE_COUNT) {
      return this.error("invalid-dice-count", diceCount, faces);
    }

    if (!VALID_FACES.includes(faces)) {
      return this.error("invalid-faces", diceCount, faces);
    }

    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(randomFn() * faces) + 1);
    }
    const total = rolls.reduce((sum, r) => sum + r, 0);

    return {
      success: true,
      data: { error: null, rolls, total, diceCount, faces },
      metadata: {},
    };
  }

  private error(
    error: DiceRollerError,
    diceCount: number,
    faces: DiceFaces,
  ): ToolResult<DiceRollerOutput> {
    return {
      success: true,
      data: { error, rolls: [], total: 0, diceCount, faces },
      metadata: {},
    };
  }
}
