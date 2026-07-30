import { useTranslations } from "next-intl";
import { Wrench, LayoutGrid, Sparkles, Globe } from "lucide-react";

export default function Stats() {
  const t = useTranslations("stats");

  const stats = [
    {
      value: "1,000+",
      label: t("tools"),
      icon: Wrench,
      iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      value: "120+",
      label: t("categories"),
      icon: LayoutGrid,
      iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      value: "100%",
      label: t("free"),
      icon: Sparkles,
      iconClass: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    },
    {
      value: "24/7",
      label: t("available"),
      icon: Globe,
      iconClass: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
  ];

  return (
    <div className="mt-16 grid w-full max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="group rounded-3xl border border-zinc-200 bg-white p-7 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/40 dark:hover:shadow-none"
        >
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl transition group-hover:scale-110 ${item.iconClass}`}
          >
            <item.icon size={28} strokeWidth={2} />
          </div>
          <h3 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {item.value}
          </h3>
          <p className="mt-2 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
