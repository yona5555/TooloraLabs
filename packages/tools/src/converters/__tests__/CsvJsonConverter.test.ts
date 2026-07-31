import { describe, it, expect } from "vitest";
import { CsvJsonConverter } from "../CsvJsonConverter";

const tool = new CsvJsonConverter();
const ctx = { locale: "en-US" };

describe("CsvJsonConverter - CSV to JSON", () => {
  it("converts simple CSV to JSON", () => {
    const output = tool.execute(
      { text: "name,age\nAlice,30\nBob,25", mode: "csvToJson" },
      ctx
    );
    expect(output.success).toBe(true);
    expect(JSON.parse(output.data.result)).toEqual([
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ]);
  });

  it("handles quoted fields containing commas", () => {
    const output = tool.execute(
      { text: 'name,city\n"Doe, John","New York"', mode: "csvToJson" },
      ctx
    );
    expect(JSON.parse(output.data.result)).toEqual([
      { name: "Doe, John", city: "New York" },
    ]);
  });

  it("handles escaped double quotes inside a quoted field", () => {
    const output = tool.execute(
      { text: 'quote\n"She said ""hi"""', mode: "csvToJson" },
      ctx
    );
    expect(JSON.parse(output.data.result)).toEqual([{ quote: 'She said "hi"' }]);
  });

  it("returns a failure for empty input", () => {
    const output = tool.execute({ text: "   ", mode: "csvToJson" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("EMPTY_INPUT");
  });
});

describe("CsvJsonConverter - JSON to CSV", () => {
  it("converts an array of objects to CSV", () => {
    const output = tool.execute(
      {
        text: JSON.stringify([
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 },
        ]),
        mode: "jsonToCsv",
      },
      ctx
    );
    expect(output.success).toBe(true);
    expect(output.data.result).toBe("name,age\nAlice,30\nBob,25");
  });

  it("quotes fields containing a comma", () => {
    const output = tool.execute(
      { text: JSON.stringify([{ name: "Doe, John" }]), mode: "jsonToCsv" },
      ctx
    );
    expect(output.data.result).toBe('name\n"Doe, John"');
  });

  it("returns a failure for invalid JSON", () => {
    const output = tool.execute({ text: "{not valid", mode: "jsonToCsv" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("INVALID_JSON");
  });

  it("returns a failure when the JSON is not an array", () => {
    const output = tool.execute({ text: '{"a":1}', mode: "jsonToCsv" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("EXPECTED_ARRAY");
  });
});

describe("CsvJsonConverter - round trip", () => {
  it("round-trips CSV -> JSON -> CSV", () => {
    const csv = "name,age\nAlice,30\nBob,25";
    const toJson = tool.execute({ text: csv, mode: "csvToJson" }, ctx);
    const backToCsv = tool.execute(
      { text: toJson.data.result, mode: "jsonToCsv" },
      ctx
    );
    expect(backToCsv.data.result).toBe(csv);
  });
});
