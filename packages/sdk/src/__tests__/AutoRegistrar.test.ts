import { describe, it, expect } from "vitest";
import { ToolRegistry } from "@tooloralabs/core";
import type { Tool } from "@tooloralabs/core";
import { PluginLoader } from "../plugins/PluginLoader";
import { AutoRegistrar } from "../plugins/AutoRegistrar";
import type { Plugin } from "../plugins/Plugin";

function makeTool(slug: string): Tool {
  return {
    metadata: {
      id: slug,
      slug,
      name: slug,
      category: "test",
      description: "test tool",
      version: "1.0.0",
    },
    execute: () => ({ success: true, data: null, metadata: {} }),
  };
}

describe("AutoRegistrar", () => {
  it("registers all tools from all loaded plugins", () => {
    const registry = new ToolRegistry();
    const loader = new PluginLoader();

    const pluginA: Plugin = {
      name: "plugin-a",
      version: "1.0.0",
      tools: [makeTool("tool-1"), makeTool("tool-2")],
    };
    const pluginB: Plugin = {
      name: "plugin-b",
      version: "1.0.0",
      tools: [makeTool("tool-3")],
    };
    loader.register(pluginA);
    loader.register(pluginB);

    new AutoRegistrar(loader, registry).registerAll();

    expect(registry.all()).toHaveLength(3);
    expect(registry.has("tool-1")).toBe(true);
    expect(registry.has("tool-2")).toBe(true);
    expect(registry.has("tool-3")).toBe(true);
  });

  it("does nothing when no plugins are loaded", () => {
    const registry = new ToolRegistry();
    const loader = new PluginLoader();

    new AutoRegistrar(loader, registry).registerAll();

    expect(registry.all()).toHaveLength(0);
  });
});
