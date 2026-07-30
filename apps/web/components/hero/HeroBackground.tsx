export default function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="hero-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" className="fill-zinc-300/40 dark:fill-zinc-700/40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />
      <div className="absolute -right-10 top-10 h-56 w-56 rounded-full bg-purple-200/20 blur-3xl dark:bg-purple-500/10" />
      <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full border border-blue-200/40 dark:border-blue-500/20" />
      <div className="absolute right-1/4 top-1/3 h-24 w-24 rounded-full border border-zinc-300/40 dark:border-zinc-600/30" />
    </div>
  );
}
