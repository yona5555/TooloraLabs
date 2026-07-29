import { BaseTool } from "@tooloralabs/sdk";

export abstract class BaseCalculator<I = unknown, O = unknown>
  extends BaseTool<I, O> {}
