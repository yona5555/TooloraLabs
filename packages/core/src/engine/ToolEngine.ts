import type { ToolContext } from "../contracts/context";
import type { Tool } from "../contracts/tool";
import { ToolRegistry } from "../registry/ToolRegistry";

export class ToolEngine {
  constructor(private readonly registry: ToolRegistry) {}

  execute(
    slug: string,
    input: unknown,
    context: ToolContext
  ) {
    const tool = this.registry.get(slug) as Tool<unknown, unknown>;

    if (!tool) {
      throw new Error(`Tool "${slug}" not found.`);
    }

    return tool.execute(input, context);
  }
}
