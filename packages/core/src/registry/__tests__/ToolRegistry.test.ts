import { describe, it, expect, beforeEach } from "vitest";
import { ToolRegistry } from "../ToolRegistry";
import type { Tool } from "../../contracts/tool";

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
    execute: () => ({ success: true, data: null }) as never,
  };
}

describe("ToolRegistry", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it("registers and retrieves a tool by slug", () => {
    const tool = makeTool("age-calculator");
    registry.register(tool);

    expect(registry.get("age-calculator")).toBe(tool);
  });

  it("returns undefined for an unregistered slug", () => {
    expect(registry.get("does-not-exist")).toBeUndefined();
  });

  it("reports has() correctly", () => {
    registry.register(makeTool("bmi-calculator"));

    expect(registry.has("bmi-calculator")).toBe(true);
    expect(registry.has("missing-tool")).toBe(false);
  });

  it("overwrites a tool registered with the same slug", () => {
    const first = makeTool("mortgage-calculator");
    const second = makeTool("mortgage-calculator");
    registry.register(first);
    registry.register(second);

    expect(registry.get("mortgage-calculator")).toBe(second);
    expect(registry.all()).toHaveLength(1);
  });

  it("returns all registered tools", () => {
    registry.register(makeTool("age-calculator"));
    registry.register(makeTool("bmi-calculator"));

    const all = registry.all();
    expect(all).toHaveLength(2);
    expect(all.map((t) => t.metadata.slug).sort()).toEqual([
      "age-calculator",
      "bmi-calculator",
    ]);
  });
});
