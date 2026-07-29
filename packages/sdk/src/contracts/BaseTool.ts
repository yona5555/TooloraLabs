import type { Tool, ToolContext, ToolResult } from "@tooloralabs/core";

export abstract class BaseTool<I = unknown, O = unknown>
  implements Tool<I, O>
{
  abstract metadata: Tool<I, O>["metadata"];

  abstract execute(
    input: I,
    context: ToolContext
  ): Promise<ToolResult<O>> | ToolResult<O>;
}
