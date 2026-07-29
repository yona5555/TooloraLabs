import type { Validator } from "./Validator";

export abstract class BaseValidator<T = unknown>
  implements Validator<T>
{
  abstract validate(input: unknown): T;
}
