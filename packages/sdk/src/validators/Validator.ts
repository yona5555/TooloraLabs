export interface Validator<T = unknown> {
  validate(input: unknown): T;
}
