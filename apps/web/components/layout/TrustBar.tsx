import { useTranslations } from "next-intl";
import { UserX, ShieldCheck, Smartphone, Gift } from "lucide-react";

export default function TrustBar() {
  const t = useTranslations("trustBar");

  const items = [
    {
      icon: UserX,
      label: t("noSignup"),
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: ShieldCheck,
      label: t("secure"),
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Smartphone,
      label: t("anyDevice"),
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Gift,
      label: t("alwaysFree"),
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="grid grid-cols-2 gap-6 rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <item.icon size={22} className={item.color} />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
