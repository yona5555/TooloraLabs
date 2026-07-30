import { describe, it, expect, beforeEach } from "vitest";
import { PluginLoader } from "../PluginLoader";
import type { Plugin } from "../Plugin";

function makePlugin(name: string): Plugin {
  return { name, version: "1.0.0", tools: [] };
}

describe("PluginLoader", () => {
  let loader: PluginLoader;

  beforeEach(() => {
    loader = new PluginLoader();
  });

  it("starts with no plugins", () => {
    expect(loader.all()).toEqual([]);
  });

  it("registers a plugin", () => {
    const plugin = makePlugin("test-plugin");
    loader.register(plugin);

    expect(loader.all()).toEqual([plugin]);
  });

  it("preserves registration order across multiple plugins", () => {
    const a = makePlugin("a");
    const b = makePlugin("b");
    loader.register(a);
    loader.register(b);

    expect(loader.all()).toEqual([a, b]);
  });

  it("returns a defensive copy, not the internal array", () => {
    loader.register(makePlugin("a"));
    const snapshot = loader.all();
    snapshot.push(makePlugin("b"));

    expect(loader.all()).toHaveLength(1);
  });
});
