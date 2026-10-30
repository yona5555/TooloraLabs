"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import GpaHonorsGauge from "./GpaHonorsGauge";
import { courseLetter, type Derived, type Formatters, type PlannerState } from "./planner";

type Props = { state: PlannerState; d: Derived; f: Formatters };

export default function GpaPlannerResult({ state, d, f }: Props) {
  const t = useTranslations("tools.gpa-calculator.planner");
  const lastSem = state.semesters[state.semesters.length - 1];
  const last = d.last;
  const semGpa = last?.gpa ?? 0;
  const priorQp = d.priorGpa * d.priorCredits;

  const verdict =
    d.plan.status === "impossible"
      ? d.plan.semestersAtMax === null
        ? t("verdict.never")
        : t("verdict.impossible", { n: d.plan.semestersAtMax })
      : d.plan.status === "guaranteed"
        ? t("verdict.guaranteed")
        : t("verdict.achievable", { gpa: f.gpa(d.plan.required) });

  const groups: LiveTableGroup[] = [
    {
      title: t("result.groupSemester", { n: state.semesters.length }),
      rows: [
        ...lastSem.courses.map((c, i) => {
          const { credits, points: p } = d.terms[d.terms.length - 1][i];
          return {
            label: `${c.name || t("input.courseN", { n: i + 1 })} · ${courseLetter(state, c)}`,
            formula: `${f.num(credits)} × ${f.gpa(p)}`,
            value: f.num(credits * p),
          };
        }),
        {
          label: t("result.semesterGpa"),
          formula: `${f.num(last?.qualityPoints ?? 0)} ÷ ${f.num(last?.credits ?? 0)}`,
          value: f.gpa(semGpa),
          emphasize: true,
        },
      ],
    },
    {
      title: t("result.groupCumulative"),
      rows: [
        { label: t("result.priorPoints"), formula: `${f.gpa(d.priorGpa)} × ${f.num(d.priorCredits)}`, value: f.num(priorQp) },
        { label: t("result.totalCredits"), formula: `${f.num(d.priorCredits)} + ${d.timeline.map((p) => f.num(p.credits)).join(" + ")}`, value: f.num(d.cumulativeCredits) },
        {
          label: t("result.newCumulative"),
          formula: `${f.num(d.cumulativeQualityPoints)} ÷ ${f.num(d.cumulativeCredits)}`,
          value: f.gpa(d.cumulativeGpa),
          emphasize: true,
        },
        ...d.timeline.map((p, i) => ({
          label: t("semesterN", { n: i + 1 }),
          formula: t("result.semCumFormula", { sem: f.gpa(p.gpa), cum: f.gpa(p.cumulativeGpa) }),
          value: f.gpa(p.cumulativeGpa),
        })),
      ],
    },
    {
      title: t("result.groupTarget"),
      rows: [
        { label: t("result.target"), formula: `${f.num(d.plannedCredits)} ${t("result.creditsUnit")}`, value: f.gpa(d.target) },
        {
          label: t("result.required"),
          formula: `(${f.gpa(d.target)} × ${f.num(d.cumulativeCredits + d.plannedCredits)} − ${f.num(d.cumulativeQualityPoints)}) ÷ ${f.num(d.plannedCredits)}`,
          value: f.gpa(d.plan.required),
          emphasize: true,
        },
        { label: t("result.verdict"), formula: t("result.bestThisSemester", { gpa: f.gpa(d.plan.bestThisSemester) }), value: verdict },
      ],
    },
    {
      title: t("result.groupHonors"),
      rows: d.honorPlans.map((h) => ({
        label: t(`honors.${h.key}`),
        formula: `≥ ${f.gpa(h.min)}`,
        value: h.met ? t("result.met") : t("result.gap", { gap: f.gpa(h.gap) }),
      })),
    },
  ];

  const standing = d.honors.current ? t(`honors.${d.honors.current}`) : t("honors.none");

  return (
    <SectionCard phoneRole="output" title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div className="mb-3 grid grid-cols-3 gap-2 text-center" data-bp-inner>
        {[
          { k: t("result.semesterGpa"), v: f.gpa(semGpa) },
          { k: t("result.newCumulative"), v: f.gpa(d.cumulativeGpa) },
          { k: t("result.totalCredits"), v: f.num(d.cumulativeCredits) },
        ].map((s) => (
          <div key={s.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10">
            <p className="text-xs leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{s.k}</p>
            <p dir="ltr" className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{s.v}</p>
          </div>
        ))}
      </div>
      <LiveTableFill>
        <LiveTable3DLayout
          headings={[t("result.colItem"), t("result.colCalc"), t("result.colValue")]}
          groups={groups}
          drawing={
            <GpaHonorsGauge
              scale={d.scale}
              cumulative={d.cumulativeGpa}
              semester={semGpa}
              target={d.target}
              valueLabel={f.gpa(d.cumulativeGpa)}
              semesterLabel={t("result.gaugeSemester", { gpa: f.gpa(semGpa) })}
              targetLabel={t("result.gaugeTarget", { gpa: f.gpa(d.target) })}
            />
          }
          caption={t("result.gaugeCaption", { standing, scale: t(`scales.${state.scale}`) })}
        />
      </LiveTableFill>
    </SectionCard>
  );
}
