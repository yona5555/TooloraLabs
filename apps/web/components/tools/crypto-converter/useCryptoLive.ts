"use client";
import { useEffect, useRef, useState } from "react";

export type NetworkKind = "blocks" | "fees" | "tip" | "fng";
export type Polled<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T; fetchedAt: number };

/**
 * Polls `/api/crypto/network?kind=…` every `intervalMs`. A failed refresh keeps the last good
 * data on screen; only a failure before any data arrives surfaces as an error state.
 */
export function useNetworkData<T>(kind: NetworkKind, intervalMs: number): Polled<T> {
  const [state, setState] = useState<Polled<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch(`/api/crypto/network?kind=${kind}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status));
          const json = (await res.json()) as { data: T; fetchedAt: number };
          if (!cancelled) setState({ status: "ready", data: json.data, fetchedAt: json.fetchedAt });
        })
        .catch(() => {
          if (!cancelled) setState((prev) => (prev.status === "ready" ? prev : { status: "error" }));
        });
    load();
    const id = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [kind, intervalMs]);

  return state;
}

export type LiveTick = { price: number; direction: "up" | "down" | null; at: number };

const WS_URL = "wss://ws-feed.exchange.coinbase.com";
const UI_THROTTLE_MS = 1000;

/**
 * Live USD prices from Coinbase Exchange's public, keyless WebSocket ticker. Each symbol is
 * subscribed separately so one unlisted coin can't fail the others; coins Coinbase doesn't list
 * simply never tick and the caller keeps showing its snapshot price. Updates are throttled to
 * one render per second per coin.
 */
export function useLiveTicks(symbols: string[]): Record<string, LiveTick> {
  const [ticks, setTicks] = useState<Record<string, LiveTick>>({});
  const pending = useRef<Record<string, number>>({});
  const key = [...new Set(symbols.map((s) => s.toUpperCase()))].sort().join(",");

  useEffect(() => {
    if (!key || typeof WebSocket === "undefined") return;
    const products = key.split(",").map((s) => `${s}-USD`);
    let ws: WebSocket | null = null;
    let closed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        for (const id of products) ws?.send(JSON.stringify({ type: "subscribe", product_ids: [id], channels: ["ticker"] }));
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as { type?: string; product_id?: string; price?: string };
          if (msg.type === "ticker" && msg.product_id && msg.price) pending.current[msg.product_id.replace(/-USD$/, "")] = Number(msg.price);
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        if (!closed) retryTimer = setTimeout(connect, 5000);
      };
    };
    connect();

    const flush = setInterval(() => {
      const batch = pending.current;
      if (Object.keys(batch).length === 0) return;
      pending.current = {};
      setTicks((prev) => {
        const next = { ...prev };
        for (const [sym, price] of Object.entries(batch)) {
          const before = prev[sym];
          if (before && before.price === price) continue;
          next[sym] = { price, direction: before ? (price > before.price ? "up" : "down") : null, at: Date.now() };
        }
        return next;
      });
    }, UI_THROTTLE_MS);

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      clearInterval(flush);
      ws?.close();
    };
  }, [key]);

  return ticks;
}
