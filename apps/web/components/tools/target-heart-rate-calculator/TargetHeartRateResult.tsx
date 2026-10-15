import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import TargetHeartRateShareExportModal from "./TargetHeartRateShareExportModal";
import type { HRSnapshot } from "./HRLiveContext";
import { BELOW_COLOR, ZONES, tanaka, targetAt, zoneColor, zoneIndex } from "./hr";
import type { TargetHeartRateError } from "./types";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const HeartScene3D = dynamic(() => import("./HeartScene3D"), { ssr: false });

type Props = {
  snap: HRSnapshot;
  /** The current input's error, if any: the table keeps the last good result under it. */
  error: TargetHeartRateError | null;
  intensity: number;
  digitStyle: DigitStyle;
  age: string;
  useRestingHeartRate: boolean;
  restingHeartRate: string;
  /** Page mode: the table fills the stretched Result column (§27). */
  fill?: boolean;
};

export default function TargetHeartRateResult({ snap, error, intensity, digitStyle, age, useRestingHeartRate, restingHeartRate, fill = false }: Props) {
  const t = useTranslations("tools.target-heart-rate-calculator.result");
  const tForm = useTranslations("tools.target-heart-rate-calculator.form");
  const tZones = useTranslations("tools.target-heart-rate-calculator.zones");
  const tv = useTranslations("tools.target-heart-rate-calculator.visuals.result");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 0 });
  const fmt1 = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 1 });

  const { data, rest } = snap;
  const ageNum = snap.age;
  const max = data.maxHeartRate;
  const karvonen = rest !== null;
  const r = rest ?? 0;
  const bpm = t("bpm");
  const target = targetAt(intensity, max, rest);
  const zi = zoneIndex(intensity);
  const zoneName = zi < 0 ? tv("belowZones") : tZones(ZONES[zi].key);
  const color = zoneColor(intensity);
  const pctMax = (target / max) * 100;
  const p = fmt1(intensity / 100);

  const inputRows = [
    { label: tForm("age"), value: age },
    ...(useRestingHeartRate ? [{ label: tForm("restingHeartRate"), value: restingHeartRate }] : []),
  ];
  const resultRows = data.zones.map((z) => ({ label: `${tZones(z.key)} (${fmt(z.lowPercent)}-${fmt(z.highPercent)}%)`, value: `${fmt(z.lowBpm)}-${fmt(z.highBpm)} ${bpm}` }));
  const sentence = t("sentence", { maxHr: fmt(max) });

  const zoneFormula = (lo: number, hi: number) =>
    karvonen ? `(${fmt(max)} − ${fmt(r)}) × ${fmt(lo)}–${fmt(hi)}% + ${fmt(r)}` : `${fmt(max)} × ${fmt(lo)}–${fmt(hi)}%`;

  const groups: LiveTableGroup[] = [
    {
      title: tv("groupInputs"),
      rows: [
        { label: tForm("age"), formula: tv("given"), value: fmt(ageNum) },
        { label: tv("method"), formula: tv("given"), value: karvonen ? tv("methodKarvonen") : tv("methodSimple") },
        ...(karvonen ? [{ label: tv("resting"), formula: tv("given"), value: fmt(r), unit: bpm }] : []),
        { label: tv("intensity"), formula: tv("intensityFormula"), value: `${fmt(intensity)}%` },
      ],
    },
    {
      title: tv("groupResult"),
      rows: [
        { label: t("maxHeartRate"), formula: `220 − ${fmt(ageNum)}`, value: fmt(max), unit: bpm, emphasize: true },
        { label: tv("maxTanaka"), formula: `208 − 0.7 × ${fmt(ageNum)}`, value: fmt(tanaka(ageNum)), unit: bpm },
        ...(karvonen ? [{ label: tv("reserve"), formula: `${fmt(max)} − ${fmt(r)}`, value: fmt(data.heartRateReserve ?? max - r), unit: bpm }] : []),
        {
          label: tv("target"),
          formula: karvonen ? `(${fmt(max)} − ${fmt(r)}) × ${p} + ${fmt(r)}` : `${fmt(max)} × ${p}`,
          value: fmt(target),
          unit: bpm,
          emphasize: true,
        },
        { label: tv("zone"), formula: zi < 0 ? "< 50%" : `${fmt(ZONES[zi].lo)}–${fmt(ZONES[zi].hi)}%`, value: zoneName, emphasize: true },
        { label: tv("pctMax"), formula: `${fmt(target)} ÷ ${fmt(max)}`, value: `${fmt(pctMax)}%` },
        { label: tv("beat"), formula: `60 ÷ ${fmt(target)}`, value: fmt1(60 / target), unit: "s" },
      ],
    },
    {
      title: tv("groupZones"),
      rows: data.zones.map((z) => ({
        label: `${tZones(z.key)} · ${fmt(z.lowPercent)}–${fmt(z.highPercent)}%`,
        formula: zoneFormula(z.lowPercent, z.highPercent),
        value: `${fmt(z.lowBpm)}–${fmt(z.highBpm)}`,
        unit: bpm,
        emphasize: z.key === ZONES[zi]?.key,
      })),
    },
  ];

  const layout = (
    <LiveTable3DLayout
      headings={[tv("colQuantity"), tv("colFormula"), tv("colValue")]}
      groups={groups}
      hint={tv("hint")}
      caption={tv("caption", { bpm: fmt(target), pct: fmt(intensity), zone: zoneName })}
      drawing={
        <Scene3D camera={[0.9, 0.5, 4.2]}>
          <HeartScene3D
            bpm={target}
            color={zi < 0 ? BELOW_COLOR : color}
            labels={{ bpm: `${fmt(target)} ${bpm}`, pct: `${fmt(intensity)}% · ${fmt(pctMax)}% HRmax`, max: `HRmax ${fmt(max)}` }}
          />
        </Scene3D>
      }
    />
  );

  return (
    <SectionCard
      title={t("heading")}
      className={fill ? "lg:flex lg:flex-1 lg:flex-col" : ""}
      bodyClassName={fill ? "p-4 lg:flex lg:flex-1 lg:flex-col lg:p-6" : undefined}
      action={<TargetHeartRateShareExportModal inputRows={inputRows} resultRows={resultRows} heroLabel={t("maxHeartRate")} heroValue={`${fmt(max)} ${bpm}`} sentence={sentence} />}
    >
      {error && (
        <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          {t(`errors.${error}`)} {tv("keptLast")}
        </p>
      )}
      {fill ? <LiveTableFill>{layout}</LiveTableFill> : layout}
    </SectionCard>
  );
}
