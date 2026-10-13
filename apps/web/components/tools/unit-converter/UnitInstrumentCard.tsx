"use client";
import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import UnitScene from "./UnitScene";

/** The category's measuring instrument (ruler, balance, thermometer…), wired to the Value field. */
export default function UnitInstrumentCard(props: Omit<ComponentProps<typeof UnitScene>, "grow">) {
  const t = useTranslations("tools.unit-converter.sideCards");
  return (
    <div data-ph-visual className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard id="unit-instrument" title={t("instrumentTitle")} className="flex flex-col lg:flex-1" bodyClassName="flex flex-1 flex-col p-4">
        <UnitScene {...props} grow />
      </SectionCard>
    </div>
  );
}
