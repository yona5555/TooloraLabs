import type { Plugin } from "./Plugin";
import { PluginLoader } from "./PluginLoader";
import { ToolRegistry } from "@tooloralabs/core";

export class AutoRegistrar {
  constructor(
    private readonly loader: PluginLoader,
    private readonly registry: ToolRegistry
  ) {}

  registerAll(): void {
    for (const plugin of this.loader.all()) {
      for (const tool of plugin.tools) {
        this.registry.register(tool);
      }
    }
  }
}
