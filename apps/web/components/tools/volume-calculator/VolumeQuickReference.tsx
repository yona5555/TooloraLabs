"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

export default function VolumeQuickReference() {
  const t = useTranslations("tools.volume-calculator.aboveFold.quickReference");

  return (
    <SectionCard title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div dir="ltr" className="mt-4 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Cube: side³</p>
        <p>Rectangular Prism: length × width × height</p>
        <p>Sphere: (4/3) × π × r³</p>
        <p>Cylinder: π × r² × height</p>
        <p>Cone: (1/3) × π × r² × height</p>
        <p>Square Pyramid: (1/3) × base² × height</p>
      </div>
    </SectionCard>
  );
}
