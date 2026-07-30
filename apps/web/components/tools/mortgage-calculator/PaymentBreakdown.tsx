import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";

type Props = {
  principalAndInterest: number;
  taxes: number;
  insurance: number;
  hoa: number;
  pmi: number;
  digitStyle: DigitStyle;
};

function formatCurrency(value: number, digitStyle: DigitStyle) {
  return formatLocalizedNumber(value, digitStyle, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function Item({
  label,
  value,
  digitStyle,
}: {
  label: string;
  value: number;
  digitStyle: DigitStyle;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <span className="font-semibold">{formatCurrency(value, digitStyle)}</span>
    </div>
  );
}

export default function PaymentBreakdown({
  principalAndInterest,
  taxes,
  insurance,
  hoa,
  pmi,
  digitStyle,
}: Props) {
  const t = useTranslations("tools.mortgage-calculator.breakdown");

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{t("heading")}</h2>

      <div className="grid gap-3">
        <Item
          label={t("principalAndInterest")}
          value={principalAndInterest}
          digitStyle={digitStyle}
        />

        <Item
          label={t("propertyTax")}
          value={taxes}
          digitStyle={digitStyle}
        />

        <Item
          label={t("homeInsurance")}
          value={insurance}
          digitStyle={digitStyle}
        />

        <Item
          label={t("hoa")}
          value={hoa}
          digitStyle={digitStyle}
        />

        <Item
          label={t("pmi")}
          value={pmi}
          digitStyle={digitStyle}
        />
      </div>
    </section>
  );
}
