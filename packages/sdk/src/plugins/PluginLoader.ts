import type { Plugin } from "./Plugin";

export class PluginLoader {
  private readonly plugins: Plugin[] = [];

  register(plugin: Plugin): void {
    this.plugins.push(plugin);
  }

  all(): Plugin[] {
    return [...this.plugins];
  }
}
