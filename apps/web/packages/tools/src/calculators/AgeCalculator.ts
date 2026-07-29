import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export class AgeCalculator extends BaseCalculator<
  { birthDate: string },
  { age: number }
> {
  metadata = {
    id: "age-calculator",
    slug: "age-calculator",
    name: "Age Calculator",
    category: "calculators",
    description: "Calculate age from birth date.",
    version: "1.0.0",
  };

  execute(
    input: { birthDate: string },
    _context: ToolContext
  ): ToolResult<{ age: number }> {
    const birth = new Date(input.birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return {
      success: true,
      data: { age },
      metadata: {},
    };
  }
}
