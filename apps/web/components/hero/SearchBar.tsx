type SearchBarProps = {
  placeholder: string;
  searchLabel: string;
};

export default function SearchBar({ placeholder, searchLabel }: SearchBarProps) {
  return (
    <div className="mt-12 w-full max-w-4xl">
      <form className="group flex h-18 items-center gap-4 rounded-full border border-zinc-200 bg-white p-2 shadow-xl transition-all duration-300 hover:border-blue-300 hover:shadow-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none dark:hover:border-blue-500 dark:focus-within:ring-blue-500/20">
        <div className="flex items-center pl-5 text-zinc-400 dark:text-zinc-500">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="h-14 flex-1 bg-transparent text-lg text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <kbd className="hidden rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 md:block">
          Ctrl K
        </kbd>
        <button
          type="submit"
          className="rounded-full bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          {searchLabel}
        </button>
      </form>
    </div>
  );
}
