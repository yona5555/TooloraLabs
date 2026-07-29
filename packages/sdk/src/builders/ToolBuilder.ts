import type { Tool } from "@tooloralabs/core";

export class ToolBuilder<T extends Tool> {
  constructor(private readonly tool: T) {}

  build(): T {
    return this.tool;
  }
}
