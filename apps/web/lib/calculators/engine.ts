import type {
  CalculatorDefinition,
  ResultAnalysis,
} from "./types";

export class CalculatorEngine {
  constructor(private readonly definition: CalculatorDefinition) {}

  public getDefinition(): CalculatorDefinition {
    return this.definition;
  }

  public getLevel(level: string): ResultAnalysis | undefined {
    return this.definition.resultLevels.find(
      (item) => item.level === level
    );
  }

  public getAllLevels(): ResultAnalysis[] {
    return this.definition.resultLevels;
  }
}
