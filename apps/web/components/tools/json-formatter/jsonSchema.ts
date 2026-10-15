/**
 * Pure JSON Schema (draft 2020-12 subset) inference from a real parsed JSON value: the visitor's
 * own document or the input panel's default sample, never a hypothetical shape. No DOM.
 */
type Schema = {
  type?: string | string[];
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
};

function typeNameOf(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v; // "string" | "boolean" | "object"
}

function mergeSchemas(a: Schema, b: Schema): Schema {
  const typesA = Array.isArray(a.type) ? a.type : a.type ? [a.type] : [];
  const typesB = Array.isArray(b.type) ? b.type : b.type ? [b.type] : [];
  const types = Array.from(new Set([...typesA, ...typesB]));
  const out: Schema = { type: types.length === 1 ? types[0] : types };
  if (a.properties || b.properties) {
    out.properties = { ...a.properties, ...b.properties };
    const req = (a.required ?? []).filter((k) => (b.required ?? []).includes(k));
    if (req.length) out.required = req;
  }
  if (a.items || b.items) out.items = a.items && b.items ? mergeSchemas(a.items, b.items) : (a.items ?? b.items);
  return out;
}

function schemaOf(value: unknown): Schema {
  const type = typeNameOf(value);
  if (type === "object") {
    const obj = value as Record<string, unknown>;
    const properties: Record<string, Schema> = {};
    for (const k of Object.keys(obj)) properties[k] = schemaOf(obj[k]);
    const required = Object.keys(obj);
    return { type: "object", properties, ...(required.length ? { required } : {}) };
  }
  if (type === "array") {
    const arr = value as unknown[];
    if (arr.length === 0) return { type: "array" };
    const items = arr.map(schemaOf).reduce((a, b) => mergeSchemas(a, b));
    return { type: "array", items };
  }
  return { type };
}

/** A real JSON-Schema document (draft 2020-12 `$schema`) inferred from `value`. */
export function inferJSONSchema(value: unknown): Record<string, unknown> {
  return { $schema: "https://json-schema.org/draft/2020-12/schema", ...schemaOf(value) };
}
