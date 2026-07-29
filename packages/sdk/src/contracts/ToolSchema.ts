export interface ToolSchema<T = unknown> {
  parse(input: unknown): T;
}
