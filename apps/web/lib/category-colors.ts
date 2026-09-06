export const categoryIconColors: Record<string, string> = {
  "financial-calculators": "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  "business-finance": "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  "financial-markets": "bg-lime-50 text-lime-600 dark:bg-lime-500/10 dark:text-lime-400",
  math: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  physics: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  chemistry: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  "health-fitness": "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  weather: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  "date-time": "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  "fun-entertainment": "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  "student-productivity": "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  converters: "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
  "developer-tools": "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  "file-tools": "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  "text-tools": "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  "website-tools": "bg-zinc-100 text-zinc-500 dark:bg-zinc-500/10 dark:text-zinc-400",
};

export function getCategoryIconColor(categorySlug: string): string {
  return categoryIconColors[categorySlug] ?? categoryIconColors["financial-calculators"];
}
