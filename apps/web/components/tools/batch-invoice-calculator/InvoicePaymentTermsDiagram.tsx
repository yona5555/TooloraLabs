import { getTranslations } from "next-intl/server";
import SectionCard from "@/components/tool-ui/SectionCard";

/** Real Net 30 timeline: issue date to due date, tied to the invoice's own "date" field. */
const NET_DAYS = 30;
const WIDTH = 380;

export default async function InvoicePaymentTermsDiagram() {
  const t = await getTranslations("tools.batch-invoice-calculator.paymentTermsDiagram");
  const tRoot = await getTranslations("tools.batch-invoice-calculator");

  const issue = new Date(2026, 0, 1);
  const due = new Date(2026, 0, 1 + NET_DAYS);
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro", { days: NET_DAYS })}</p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1 overflow-x-auto" dir="ltr">
          <svg width={WIDTH} height={70} viewBox={`0 0 ${WIDTH} 70`} role="img" aria-label={t("title")} className="mx-auto block min-w-[300px] text-current">
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
        <div dir="ltr" className="shrink-0 rounded-xl bg-zinc-50 p-4 lg:w-56 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">{tRoot("workedExampleTitle")}</p>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-300">{t("issueDate")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmtDate(issue)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-600 dark:text-zinc-300">{t("dueDate")}</dt>
              <dd className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{fmtDate(due)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 dark:border-zinc-700">
              <dt className="font-semibold text-zinc-700 dark:text-zinc-200">{t("termLabel")}</dt>
              <dd className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{t("daysLabel", { days: NET_DAYS })}</dd>
            </div>
          </dl>
        </div>
      </div>
    </SectionCard>
  );
}
