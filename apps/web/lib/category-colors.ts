export const categoryIconColors: Record<string, string> = {
  calculators: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  converters: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  "developer-tools": "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  "text-tools": "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  "file-tools": "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  "financial-markets": "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

export function getCategoryIconColor(categorySlug: string): string {
  return categoryIconColors[categorySlug] ?? categoryIconColors.calculators;
}
