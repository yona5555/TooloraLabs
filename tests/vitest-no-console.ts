// Shared Vitest setup (packages/*/vitest.config.mts): a test that writes to console.warn/console.error or
// raises a Node process warning fails, so warnings can never pile up silently in test output.
import { afterEach, beforeEach, vi, type MockInstance } from "vitest";

const emitted: string[] = [];
let spies: MockInstance[] = [];

process.on("warning", (warning) => {
  emitted.push(`process warning: ${warning.name}: ${warning.message}`);
});

beforeEach(() => {
  emitted.length = 0;
  spies = (["warn", "error"] as const).map((method) =>
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      emitted.push(`console.${method}: ${args.map(String).join(" ")}`);
    }),
  );
});

afterEach(() => {
  for (const spy of spies) spy.mockRestore();
  if (emitted.length > 0) {
    throw new Error(`The test emitted warnings or errors:\n${emitted.join("\n")}`);
  }
});
