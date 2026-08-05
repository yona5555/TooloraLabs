import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

export type EquipmentItem = {
  name: string;
  description: string;
  affiliateUrl?: string;
};

type EquipmentSectionProps = {
  title: string;
  intro?: string;
  items: EquipmentItem[];
};

export default function EquipmentSection({ title, intro, items }: EquipmentSectionProps) {
  const t = useTranslations("common");

  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      {intro && <p className="mt-2">{intro}</p>}
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={item.name} className="rounded-sm border border-current/20 p-4">
            <p className="font-semibold">{item.name}</p>
            <p className="mt-1 text-sm opacity-80">{item.description}</p>
            {item.affiliateUrl && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <a
                  href={item.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-blue-700"
                >
                  {t("shopNowCta")}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
                <span className="rounded-full border border-current/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide opacity-70">
                  {t("affiliateLabel")}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
