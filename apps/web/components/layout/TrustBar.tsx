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
    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-start dark:border-zinc-800 dark:bg-zinc-900">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <item.icon size={18} className={item.color} />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
