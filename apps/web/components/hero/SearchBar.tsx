export default function SearchBar() {
  return (
    <div className="mt-12 w-full max-w-3xl">
      <div className="flex h-16 items-center rounded-2xl border border-zinc-200 bg-white px-6 shadow-lg transition-shadow hover:shadow-xl">

        <svg
          className="h-6 w-6 text-zinc-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>

        <input
          type="text"
          placeholder="Search for a tool..."
          className="ml-4 flex-1 bg-transparent text-lg outline-none placeholder:text-zinc-400"
        />

        <kbd className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-500">
          Ctrl + K
        </kbd>

      </div>
    </div>
  );
}
