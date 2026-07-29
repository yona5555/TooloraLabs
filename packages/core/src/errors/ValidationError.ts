import { ToolError } from "./ToolError";

export class ValidationError extends ToolError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
