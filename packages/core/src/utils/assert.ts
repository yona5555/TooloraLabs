import { ValidationError } from "../errors/ValidationError";

export function assert(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new ValidationError(message);
  }
}
