// One shard split for the gates that measure pages and the ratchet that checks them, so "the pages of shard i/n"
// has one definition. SHARD=i/n takes items i, i+n, … (i from 1) of the list, in its order.
//   site-audit shards locale-free paths (every listed locale of a path lands in the same shard).
//   perf-budget shards locale-prefixed pages.

export const sliceShard = (list, shard = "1/1") => {
  const [i, n] = shard.split("/").map(Number);
  return list.filter((_, k) => k % n === i - 1);
};

const localeFree = (page) => page.replace(/^\/[^/]+/, "");

/** The locale-prefixed pages of one shard, from the gate's page list (PAGES, sitemap order). */
export function shardPages(kind, pages, shard) {
  if (kind === "perf-budget") return sliceShard(pages, shard);
  const paths = new Set(sliceShard([...new Set(pages.map(localeFree))], shard));
  return pages.filter((p) => paths.has(localeFree(p)));
}
