import { SDKError } from "./SDKError";

export class ValidationError extends SDKError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
