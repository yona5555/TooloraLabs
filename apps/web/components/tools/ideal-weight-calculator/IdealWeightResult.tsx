"use client";
import dynamic from "next/dynamic";
import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import type { Gender } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import IdealWeightShareExportModal from "./IdealWeightShareExportModal";
import { useIdealWeightLive } from "./IdealWeightLiveContext";
import { FORMULAS, GROUPS, IDEAL_COLOR, WHO_HI, WHO_LO, bmiOf, coefOf, groupOf, inchesOver60, weightAt } from "./iw";

// three/drei live only in this dynamically imported chunk (the BMI figure, reused).
const FigureScene3D = dynamic(() => import("../bmi-calculator/BMIFigureScene3D"), { ssr: false });

type Props = {
  /** The current fields are invalid: the last good result stays, with a short note. */
  invalid: boolean;
  gender: Gender;
  heightCm: string;
  digitStyle: DigitStyle;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function IdealWeightResult({ invalid, gender, heightCm, digitStyle, fill = false }: Props) {
  const t = useTranslations("tools.ideal-weight-calculator");
  const tv = useTranslations("tools.ideal-weight-calculator.visuals.result");
  const tg = useTranslations("tools.ideal-weight-calculator.visuals.groups");
  const { gender: g, heightCm: h, current, currentGiven, r } = useIdealWeightLive();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Fill mode: the table box fills whatever height the column leaves, so its bottom edge would
  // usually slice a row in half. Pull the bottom up to the last row that fits whole (the rest
  // stays reachable by scrolling). Runs after every render and on every resize of the column.
  useLayoutEffect(() => {
    const root = wrapRef.current;
    const box = root?.querySelector("table")?.closest<HTMLElement>(".overflow-auto");
    if (!root || !box) return;
    const snap = () => {
      box.style.bottom = "";
      if (getComputedStyle(box).position !== "absolute" || box.scrollHeight <= box.clientHeight + 1) return;
      const top = box.getBoundingClientRect().top + box.clientTop - box.scrollTop;
      const limit = box.clientHeight;
      let fit = 0;
      box.querySelectorAll("tr").forEach((tr) => {
        const bottom = tr.getBoundingClientRect().bottom - top;
        if (bottom <= limit + 0.5 && bottom > fit) fit = bottom;
      });
      if (fit > 0 && limit - fit > 0.5) box.style.bottom = `${Math.floor(limit - fit)}px`;
    };
    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(root);
    return () => ro.disconnect();
  });

  const fmt = (value: number, d = 1) => formatLocalizedNumber(value, digitStyle, { minimumFractionDigits: d, maximumFractionDigits: d });
  const kg = (value: number) => `${fmt(value)} kg`;
  const sgn = (v: number) => `${v >= 0 ? "+" : "−"}${fmt(Math.abs(v))}`;
  const male = g === "male";
  const m = h / 100;
  const in60 = inchesOver60(h);
  const values = FORMULAS.map((f) => r[f.key]);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const whoLo = weightAt(WHO_LO, h);
  const whoHi = weightAt(WHO_HI, h);
  const avgBmi = bmiOf(r.average, h);
  const curBmi = bmiOf(current, h);
  const curGroup = groupOf(curBmi);
  const diff = current - r.average;
  const toRange = current > whoHi ? current - whoHi : current < whoLo ? current - whoLo : 0;

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: t("form.genderLabel"), formula: tv("given"), value: male ? t("form.genderMale") : t("form.genderFemale") },
        { label: tv("height"), formula: `${fmt(h / 2.54)} in`, value: fmt(h), unit: "cm" },
        { label: tv("over60"), formula: `${fmt(h)} ÷ 2.54 − 60`, value: fmt(in60, 2), unit: "in" },
        ...(currentGiven ? [{ label: tv("current"), formula: `${fmt(current * 2.20462)} lb`, value: fmt(current), unit: "kg" }] : []),
      ],
    },
    {
      title: tv("groupFormulas"),
      rows: FORMULAS.map((f) => {
        const k = coefOf(f.key, g);
        return { label: t(`aboveFold.${f.label}`), formula: `${k.base} + ${k.inc} × ${fmt(in60, 2)}`, value: fmt(r[f.key]), unit: "kg" };
      }),
    },
    {
      title: tv("groupSummary"),
      rows: [
        { label: t("aboveFold.averageLabel"), formula: `(${values.map((v) => fmt(v)).join(" + ")}) ÷ 4`, value: fmt(r.average), unit: "kg", emphasize: true },
        { label: t("aboveFold.spreadLabel"), formula: `${fmt(hi)} − ${fmt(lo)}`, value: fmt(hi - lo), unit: "kg" },
        { label: tv("inPounds"), formula: `${fmt(r.average)} × 2.20462`, value: fmt(r.average * 2.20462), unit: "lb" },
        { label: tv("bmiAtAverage"), formula: `${fmt(r.average)} ÷ ${fmt(m, 2)}²`, value: fmt(avgBmi) },
      ],
    },
    {
      title: tv("groupWho"),
      rows: [
        { label: tv("whoLow"), formula: `18.5 × ${fmt(m, 2)}²`, value: fmt(whoLo), unit: "kg" },
        { label: tv("whoMid"), formula: `22 × ${fmt(m, 2)}²`, value: fmt(weightAt(22, h)), unit: "kg" },
        { label: tv("whoHigh"), formula: `24.9 × ${fmt(m, 2)}²`, value: fmt(whoHi), unit: "kg", emphasize: true },
        { label: tv("whoWidth"), formula: `${fmt(whoHi)} − ${fmt(whoLo)}`, value: fmt(whoHi - whoLo), unit: "kg" },
      ],
    },
    ...(currentGiven
      ? [
          {
            title: tv("groupCurrent"),
            rows: [
              { label: tv("currentBmi"), formula: `${fmt(current)} ÷ ${fmt(m, 2)}²`, value: fmt(curBmi) },
              { label: tv("whoGroup"), formula: tv("whoBands"), value: tg(curGroup.key) },
              { label: tv("vsAverage"), formula: `${fmt(current)} − ${fmt(r.average)}`, value: sgn(diff), unit: "kg", emphasize: true },
              { label: tv("vsRange"), formula: `${fmt(whoLo)}–${fmt(whoHi)} kg`, value: toRange === 0 ? tv("inside") : sgn(toRange), unit: toRange === 0 ? undefined : "kg" },
              ...FORMULAS.map((f) => ({ label: tv("vsFormula", { name: t(`aboveFold.${f.label}`) }), formula: `${fmt(current)} − ${fmt(r[f.key])}`, value: sgn(current - r[f.key]), unit: "kg" })),
            ],
          },
        ]
      : []),
  ];

  // The solid body is the lighter of the two weights; the translucent shell widens it to the heavier.
  const above = currentGiven && current > r.average;
  const below = currentGiven && current < r.average;
  const solidBmi = below ? curBmi : avgBmi;
  const shellBmi = above ? curBmi : below ? avgBmi : null;
  const solidColor = below ? curGroup.color : IDEAL_COLOR;
  const shellColor = above ? curGroup.color : IDEAL_COLOR;
  const caption = !currentGiven || (!above && !below)
    ? tv("captionIdeal", { kg: kg(r.average), bmi: fmt(avgBmi) })
    : tv(above ? "captionAbove" : "captionBelow", { ideal: kg(r.average), current: kg(current), diff: `${fmt(Math.abs(diff))} kg` });

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={caption}
      drawing={
        <Scene3D camera={[1.6, 0.6, 3.8]}>
          <FigureScene3D
            heightCm={h}
            bmi={Math.min(45, Math.max(13, solidBmi))}
            color={solidColor}
            labels={{
              height: `${fmt(h, 0)} cm`,
              bmi: currentGiven ? `BMI ${fmt(avgBmi)} · ${fmt(curBmi)}` : `BMI ${fmt(avgBmi)}`,
              weight: currentGiven ? `${fmt(r.average)} · ${fmt(current)} kg` : kg(r.average),
            }}
            fatLayer={shellBmi === null ? undefined : { thickness: Math.sqrt(shellBmi / solidBmi) - 1, color: shellColor, opacity: 0.4 }}
          />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={t("aboveFold.resultTitle")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={
        <IdealWeightShareExportModal
          inputRows={[
            { label: t("form.genderLabel"), value: gender === "male" ? t("form.genderMale") : t("form.genderFemale") },
            { label: t("form.heightLabel"), value: `${heightCm} cm` },
          ]}
          resultRows={FORMULAS.map((f) => ({ label: t(`aboveFold.${f.label}`), value: kg(r[f.key]) }))}
          heroLabel={t("aboveFold.averageLabel")}
          heroValue={kg(r.average)}
          sentence={t("aboveFold.sentence", { value: kg(r.average) })}
          gauge={{
            zones: GROUPS.map((z) => ({ from: Math.max(14, z.min), to: Math.min(40, z.max), color: z.color })),
            domainMin: 14,
            domainMax: 40,
            value: Math.min(40, Math.max(14, avgBmi)),
            ticks: [14, 18.5, 25, 30, 40],
            valueLabel: `BMI ${fmt(avgBmi)}`,
            caption: tg(groupOf(avgBmi).key),
          }}
        />
      }
    >
      {invalid && <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">{tv("invalid")}</p>}
      <div ref={wrapRef} className={fill ? "lg:flex lg:flex-1 lg:flex-col" : undefined}>
        {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
      </div>
    </SectionCard>
  );
}
