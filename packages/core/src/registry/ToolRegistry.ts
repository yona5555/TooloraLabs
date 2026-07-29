import type { Tool } from "../contracts/tool";

export class ToolRegistry {
  private readonly tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.metadata.slug, tool);
  }

  get(slug: string): Tool | undefined {
    return this.tools.get(slug);
  }

  has(slug: string): boolean {
    return this.tools.has(slug);
  }

  all(): Tool[] {
    return [...this.tools.values()];
  }
}
