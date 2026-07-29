export class Pipeline<T> {
  private readonly steps: Array<(value: T) => T> = [];

  use(step: (value: T) => T): this {
    this.steps.push(step);
    return this;
  }

  run(value: T): T {
    return this.steps.reduce((current, step) => step(current), value);
  }
}
