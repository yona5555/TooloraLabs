type LiveFallbackProps = {
  status: "loading" | "error";
  loading: string;
  error: string;
  /** Keeps the card the same height as its loaded state so the page doesn't jump. */
  height: number;
};

/** Placeholder shown while a live indicator loads, or when its free upstream API is unreachable. */
export default function LiveFallback({ status, loading, error, height }: LiveFallbackProps) {
  return (
    <div
      role="status"
      style={{ minHeight: height }}
      className={`mt-4 flex items-center justify-center rounded-xl bg-zinc-50 px-6 text-center text-sm dark:bg-zinc-800/40 ${
        status === "loading" ? "animate-pulse text-zinc-400" : "text-zinc-600 dark:text-zinc-300"
      }`}
    >
      {status === "loading" ? loading : error}
    </div>
  );
}
