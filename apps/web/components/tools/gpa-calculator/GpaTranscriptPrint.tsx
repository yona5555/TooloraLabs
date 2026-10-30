"use client";
import { useTranslations } from "next-intl";
import { useTodayDate } from "@/components/tool-ui/TodayDate";
import { courseLetter, type Derived, type Formatters, type PlannerState } from "./planner";

/** Transcript-style summary, invisible on screen and the only thing printed (global [data-print-area] print CSS). */
export default function GpaTranscriptPrint({ state, d, f }: { state: PlannerState; d: Derived; f: Formatters }) {
  const t = useTranslations("tools.gpa-calculator.planner");
  const th = "border border-zinc-400 px-2 py-1 text-start";
  const td = "border border-zinc-300 px-2 py-1";
  const today = useTodayDate();

  return (
    <div data-print-area className="hidden bg-white text-black">
      <div className="text-xl font-bold">{t("print.title")}</div>
      <p className="text-sm">
        {t(`scales.${state.scale}`)} · {t("print.date", { date: today })}
      </p>
      {d.priorCredits > 0 && (
        <p className="mt-3 text-sm">
          {t("print.prior", { gpa: f.gpa(d.priorGpa), credits: f.num(d.priorCredits) })}
        </p>
      )}
      {state.semesters.map((s, si) => {
        const p = d.timeline[si];
        return (
          <section key={s.id} className="mt-4 break-inside-avoid">
            <h2 className="font-bold">{t("semesterN", { n: si + 1 })}</h2>
            <table className="mt-1 w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className={th}>{t("input.course")}</th>
                  <th className={th}>{t("input.credits")}</th>
                  <th className={th}>{t("input.grade")}</th>
                  <th className={th}>{t("print.points")}</th>
                </tr>
              </thead>
              <tbody>
                {s.courses.map((c, ci) => {
                  const g = d.terms[si][ci];
                  return (
                    <tr key={c.id}>
                      <td className={td}>{c.name || t("input.courseN", { n: ci + 1 })}</td>
                      <td className={td}>{f.num(g.credits)}</td>
                      <td className={td}>
                        {courseLetter(state, c)}
                        {state.entry === "percent" ? ` (${c.percent}%)` : ""}
                      </td>
                      <td className={td}>{f.num(g.credits * g.points)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-1 text-sm">
              {t("print.semLine", { sem: f.gpa(p.gpa), credits: f.num(p.credits), cum: f.gpa(p.cumulativeGpa), total: f.num(p.cumulativeCredits) })}
            </p>
          </section>
        );
      })}
      <p className="mt-4 border-t border-black pt-2 font-bold">
        {t("print.final", { cum: f.gpa(d.cumulativeGpa), total: f.num(d.cumulativeCredits), max: d.scale.max.toFixed(2) })}
      </p>
      <p className="text-sm">{d.honors.current ? t(`honors.${d.honors.current}`) : t("honors.none")}</p>
      <p className="mt-3 text-xs">{t("print.disclaimer")}</p>
    </div>
  );
}
