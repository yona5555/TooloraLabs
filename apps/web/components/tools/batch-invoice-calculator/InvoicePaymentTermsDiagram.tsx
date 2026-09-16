import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real Net 30 timeline: issue date to due date, tied to the invoice's own "date" field. */
const NET_DAYS = 30;
const WIDTH = 380;

export default async function InvoicePaymentTermsDiagram() {
  const t = await getTranslations("tools.batch-invoice-calculator.paymentTermsDiagram");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { days: NET_DAYS })}</p>
      <div dir="ltr" className="mt-4 overflow-x-auto">
        <svg width={WIDTH} height={70} viewBox={`0 0 ${WIDTH} 70`} role="img" aria-label={t("title")} className="mx-auto block min-w-[320px] text-current">
          <line x1={20} y1={35} x2={WIDTH - 20} y2={35} stroke="currentColor" strokeWidth={2} opacity={0.25} />
          <circle cx={20} cy={35} r={5} className="fill-blue-600 dark:fill-blue-400" />
          <text x={20} y={20} textAnchor="start" fontSize={10} fontWeight={700} fill="currentColor">
            {t("issueDate")}
          </text>
          <circle cx={WIDTH - 20} cy={35} r={5} className="fill-amber-500 dark:fill-amber-400" />
          <text x={WIDTH - 20} y={20} textAnchor="end" fontSize={10} fontWeight={700} fill="currentColor">
            {t("dueDate")}
          </text>
          <text x={WIDTH / 2} y={55} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.7}>
            {t("daysLabel", { days: NET_DAYS })}
          </text>
        </svg>
      </div>
    </SectionCard>
  );
}
