import { describe, expect, it } from "vitest";
import { analyzeCsvText, analyzeJsonRecords, inferType } from "../csvAnalysis";

const CSV = `sku,product,price,stock,in_stock,updated
A-100,"Notebook, A5",3.5,120,true,2026-10-01
A-101,Pen,1.25,0,false,2026-10-02
A-102,"Desk ""Pro"" lamp",24,8,true,`;

describe("csvAnalysis", () => {
  it("profiles columns from CSV", () => {
    const a = analyzeCsvText(CSV, ",", true);
    expect(a.headers).toEqual(["sku", "product", "price", "stock", "in_stock", "updated"]);
    expect(a.rows[0][1]).toBe("Notebook, A5");
    expect(a.rows[2][1]).toBe('Desk "Pro" lamp');
    expect(a.columns.map((c) => c.type)).toEqual(["text", "text", "decimal", "integer", "boolean", "date"]);
    expect(a.columns[5].empty).toBe(1);
    expect(a.columns[3].numeric).toEqual({ min: 0, max: 120, mean: 128 / 3 });
    expect(a.rowLengths).toEqual([6, 6, 6]);
    expect(a.quotedFields).toBe(2);
    expect(a.delimiterCounts[","][0]).toBe(5);
    expect(a.jsonBytes.keys + a.jsonBytes.values + a.jsonBytes.punctuation).toBe(a.sizes.jsonMin);
    expect(a.sizes.jsonPretty).toBeGreaterThan(a.sizes.jsonMin);
  });

  it("builds the same table from JSON records", () => {
    const a = analyzeJsonRecords([{ name: "Alice", geo: { city: "Cairo" } }, { name: "Bob", tags: ["x"] }], ",");
    expect(a.headers).toEqual(["name", "geo.city", "tags"]);
    expect(a.rows[1]).toEqual(["Bob", "", '["x"]']);
    expect(a.columns[1].empty).toBe(1);
  });

  it("infers types", () => {
    expect(inferType(["1", "-2", ""])).toBe("integer");
    expect(inferType(["1.5", "2"])).toBe("decimal");
    expect(inferType(["", ""])).toBe("empty");
  });
});
