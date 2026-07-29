import { ToolError } from "./ToolError";

export class ExecutionError extends ToolError {
  constructor(message: string) {
    super(message, "EXECUTION_ERROR");
    this.name = "ExecutionError";
  }
}
