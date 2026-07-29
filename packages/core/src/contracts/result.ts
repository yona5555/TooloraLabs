export interface ToolResult<T = unknown> {
  success: boolean;
  data: T;
  metadata: Record<string, unknown>;
}
