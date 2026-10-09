"use client";
import { useEffect, useState } from "react";

export type Loaded<T> = { status: "loading" } | { status: "error" } | { status: "unsupported" } | { status: "ready"; data: T };

/** One request per URL per page view: several indicators read the same history without refetching. */
const requests = new Map<string, Promise<Response>>();
function fetchOnce(url: string): Promise<Response> {
  let p = requests.get(url);
  if (!p) {
    p = fetch(url);
    requests.set(url, p);
    // A failed request may be retried later.
    p.then((r) => !r.ok && r.status !== 404 && requests.delete(url)).catch(() => requests.delete(url));
  }
  return p.then((r) => r.clone());
}

export function useJson<T>(url: string | null, pick: (json: unknown) => T | null): Loaded<T> {
  const [state, setState] = useState<{ url: string; value: Loaded<T> } | null>(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetchOnce(url)
      .then(async (res) => {
        const json = (await res.json()) as unknown;
        if (cancelled) return;
        const data = res.ok ? pick(json) : null;
        const value: Loaded<T> = res.status === 404 ? { status: "unsupported" } : data ? { status: "ready", data } : { status: "error" };
        setState({ url, value });
      })
      .catch(() => !cancelled && setState({ url, value: { status: "error" } }));
    return () => {
      cancelled = true;
    };
    // `pick` is a pure parser; re-running on its identity would refetch every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  if (!url) return { status: "unsupported" };
  return state && state.url === url ? state.value : { status: "loading" };
}
