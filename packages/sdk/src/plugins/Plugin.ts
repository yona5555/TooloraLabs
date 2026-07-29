import type { Tool } from "@tooloralabs/core";

export interface Plugin {
  name: string;
  version: string;
  tools: Tool[];
}
