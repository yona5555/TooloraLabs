import type { ToolMetadata } from "./metadata";
import type { ToolContext } from "./context";
import type { ToolResult } from "./result";

export type ToolType =
  | "calculator"
  | "converter"
  | "generator"
  | "formatter"
  | "validator"
  | "analyzer";

export interface Tool<I = unknown, O = unknown> {
  metadata: ToolMetadata;

  execute(
    input: I,
    context: ToolContext
  ): Promise<ToolResult<O>> | ToolResult<O>;
}
