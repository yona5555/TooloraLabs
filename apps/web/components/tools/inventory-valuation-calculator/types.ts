export type DraftBatch = { quantity: string; unitCost: string };

export type DraftItem = {
  name: string;
  unitsSold: string;
  reorderThreshold: string;
  batches: DraftBatch[];
};

export function emptyBatch(): DraftBatch {
  return { quantity: "", unitCost: "" };
}

export function emptyItem(): DraftItem {
  return { name: "", unitsSold: "", reorderThreshold: "", batches: [emptyBatch()] };
}
