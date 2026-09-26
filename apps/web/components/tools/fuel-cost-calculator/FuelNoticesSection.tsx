"use client";
import { useTranslations } from "next-intl";
import InfoSection from "@/components/tool-ui/InfoSection";
import { useFuelLiveInputs } from "./FuelLiveInputsContext";

type Props = { title: string };

/**
 * The currency selector's own "approximate conversion" note is suppressed
 * inline (see FuelInputPanel.tsx) and rendered here instead — no
 * warning/notice of any kind belongs inside the calculator/result area
 * itself, so it's relocated to this consolidated, plain-text section at the
 * page bottom, conditional on the same `currency !== "USD"` state the
 * selector itself used to gate it on. Renders nothing at all (not an empty
 * heading) when there is currently no notice to show.
 */
export default function FuelNoticesSection({ title }: Props) {
  const t = useTranslations("common.currency");
  const live = useFuelLiveInputs();
  const currency = live?.currency ?? "USD";

  if (currency === "USD") return null;

  return (
    <InfoSection id="notices" title={title}>
      <ul className="list-disc space-y-3 ps-5 text-sm leading-6 opacity-80">
        <li>{t("approximateNote")}</li>
      </ul>
    </InfoSection>
  );
}
