import { describe, it, expect } from "vitest";
import { CsvJsonConverter } from "../CsvJsonConverter";
import type { CsvJsonConverterInput } from "../CsvJsonConverter";

const tool = new CsvJsonConverter();
const ctx = { locale: "en-US" };
const BASE: CsvJsonConverterInput = { text: "", mode: "csvToJson", delimiter: ",", hasHeader: true };

describe("CsvJsonConverter - CSV to JSON", () => {
  it("converts simple CSV to JSON", () => {
    const output = tool.execute({ ...BASE, text: "name,age\nAlice,30\nBob,25" }, ctx);
    expect(output.success).toBe(true);
    expect(JSON.parse(output.data.result)).toEqual([
      { name: "Alice", age: "30" },
      { name: "Bob", age: "25" },
    ]);
  });

  it("handles quoted fields containing commas", () => {
    const output = tool.execute({ ...BASE, text: 'name,city\n"Doe, John","New York"' }, ctx);
    expect(JSON.parse(output.data.result)).toEqual([{ name: "Doe, John", city: "New York" }]);
  });

  it("handles escaped double quotes inside a quoted field", () => {
    const output = tool.execute({ ...BASE, text: 'quote\n"She said ""hi"""' }, ctx);
    expect(JSON.parse(output.data.result)).toEqual([{ quote: 'She said "hi"' }]);
  });

  it("returns a failure for empty input", () => {
    const output = tool.execute({ ...BASE, text: "   " }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("EMPTY_INPUT");
  });

  it("parses semicolon-delimited CSV when selected", () => {
    const output = tool.execute({ ...BASE, text: "name;age\nAlice;30", delimiter: ";" }, ctx);
    expect(JSON.parse(output.data.result)).toEqual([{ name: "Alice", age: "30" }]);
  });

  it("parses tab-delimited CSV when selected", () => {
    const output = tool.execute({ ...BASE, text: "name\tage\nAlice\t30", delimiter: "\t" }, ctx);
    expect(JSON.parse(output.data.result)).toEqual([{ name: "Alice", age: "30" }]);
  });

  it("auto-detects the delimiter from the first line", () => {
    const output = tool.execute({ ...BASE, text: "name;age\nAlice;30", delimiter: "auto" }, ctx);
    expect(output.data.resolvedDelimiter).toBe(";");
    expect(JSON.parse(output.data.result)).toEqual([{ name: "Alice", age: "30" }]);
  });

  it("generates column1/column2 keys when the CSV has no header row", () => {
    const output = tool.execute({ ...BASE, text: "Alice,30\nBob,25", hasHeader: false }, ctx);
    expect(JSON.parse(output.data.result)).toEqual([
      { column1: "Alice", column2: "30" },
      { column1: "Bob", column2: "25" },
    ]);
  });
});

describe("CsvJsonConverter - JSON to CSV", () => {
  it("converts an array of objects to CSV", () => {
    const output = tool.execute(
      { ...BASE, mode: "jsonToCsv", text: JSON.stringify([{ name: "Alice", age: 30 }, { name: "Bob", age: 25 }]) },
      ctx
    );
    expect(output.success).toBe(true);
    expect(output.data.result).toBe("name,age\nAlice,30\nBob,25");
  });

  it("quotes fields containing a comma", () => {
    const output = tool.execute({ ...BASE, mode: "jsonToCsv", text: JSON.stringify([{ name: "Doe, John" }]) }, ctx);
    expect(output.data.result).toBe('name\n"Doe, John"');
  });

  it("returns a failure for invalid JSON", () => {
    const output = tool.execute({ ...BASE, mode: "jsonToCsv", text: "{not valid" }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("INVALID_JSON");
  });

  it("returns a failure when the JSON is not an array", () => {
    const output = tool.execute({ ...BASE, mode: "jsonToCsv", text: '{"a":1}' }, ctx);
    expect(output.success).toBe(false);
    expect(output.metadata.error).toBe("EXPECTED_ARRAY");
  });

  it("flattens nested objects into dot-notation columns", () => {
    const output = tool.execute(
      { ...BASE, mode: "jsonToCsv", text: JSON.stringify([{ name: "Alice", address: { city: "Cairo", zip: "12345" } }]) },
      ctx
    );
    expect(output.data.result).toBe('name,address.city,address.zip\nAlice,Cairo,12345');
  });

  it("stringifies array values into a single cell", () => {
    const output = tool.execute({ ...BASE, mode: "jsonToCsv", text: JSON.stringify([{ name: "Alice", tags: ["a", "b"] }]) }, ctx);
    expect(output.data.result).toBe('name,tags\nAlice,"[""a"",""b""]"');
  });

  it("writes CSV with the selected delimiter", () => {
    const output = tool.execute({ ...BASE, mode: "jsonToCsv", text: JSON.stringify([{ name: "Alice", age: 30 }]), delimiter: ";" }, ctx);
    expect(output.data.result).toBe("name;age\nAlice;30");
  });
});

describe("CsvJsonConverter - round trip", () => {
  it("round-trips CSV -> JSON -> CSV", () => {
    const csv = "name,age\nAlice,30\nBob,25";
    const toJson = tool.execute({ ...BASE, text: csv }, ctx);
    const backToCsv = tool.execute({ ...BASE, mode: "jsonToCsv", text: toJson.data.result }, ctx);
    expect(backToCsv.data.result).toBe(csv);
  });
});
