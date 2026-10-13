"use client";
import { Calculator, Hand } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";
import { RichText } from "@/components/tool-ui/indicator-kit/CardKit";
import { useTokenColors } from "@/components/tool-ui/indicator-kit/tokenColors";
import MolarityShareExportModal from "./MolarityShareExportModal";
import MolarityModeTabs from "./MolarityModeTabs";
import MolarityResultScene from "./MolarityResultScene";
import { shownParticles } from "./molMath";
import type { MolarityMode, MolarityResult as Result } from "./types";

type Props = {
  hasCalculated: boolean;
  result: Result;
  mode: MolarityMode;
  digitStyle: DigitStyle;
  /** Volume (L) in the concentration scene: the V field. */
  volume: number;
  /** Seed volume the scene's reset returns to (the calculator default for this mode). */
  seedVolume: number;
  onSetVolume: (v: number) => void;
  onModeChange: (mode: MolarityMode) => void;
};

const CONCENTRATION_GAUGE_MIN = -3.5;
const CONCENTRATION_GAUGE_MAX = 1.5;
const DILUTION_GAUGE_MAX = 50;

/**
 * §44: the Result card is the 3D card — the beaker scene first, directly under the header band,
 * then the molarity (or C₁ V₁ C₂ V₂) values, then the mode tabs, all inside this one card.
 */
export default function MolarityResult({ hasCalculated, result, mode, digitStyle, volume, seedVolume, onSetVolume, onModeChange }: Props) {
  const t = useTranslations("tools.molarity-calculator.result");
  const tForm = useTranslations("tools.molarity-calculator.form");
  const tc = useTranslations("tools.ph-calculator.visuals.common");
  const fmt = (value: number) => formatLocalizedNumber(value, digitStyle, { maximumFractionDigits: 4 });
  const zone = useTokenColors(["--chem-solvent", "--chem-tint", "--chem-solute", "--ph-neutral", "--chem-stock", "--chem-hot"]);
  const z = (k: string) => zone?.[k] ?? "currentColor";
  const valid = hasCalculated && !result.error;
  const errorKey = result.error === "zero-volume" ? "zeroVolume" : result.error === "zero-molar-mass" ? "zeroMolarMass" : result.error === "zero-denominator" ? "zeroDenominator" : null;
  const operationLabel = tForm(`mode.${mode}`);
  const dil = mode === "dilution";

  // Scene state: what the beakers show (falls back to the seed before the first calculation).
  const sceneVolume = dil ? (valid ? result.v2 : 1) : volume;
  const sceneMoles = dil ? (valid ? result.c1 * result.v1 : 1) : valid ? result.moles : 0.5;
  const scene = {
    mode,
    volume: sceneVolume > 0 ? sceneVolume : seedVolume,
    molarity: dil ? (valid ? result.c2 : 1) : valid ? result.molarity : 0.25,
    particles: shownParticles(sceneMoles),
    stockVolume: valid ? result.v1 : 0.5,
    stockMolarity: valid ? result.c1 : 2,
  };

  const dilutionFactor = result.v1 > 0 ? result.v2 / result.v1 : 1;
  const concValue = `${fmt(result.molarity)} mol/L`;
  const share = !valid ? null : dil ? (
    <MolarityShareExportModal
      operationLabel={operationLabel}
      inputRows={[
        { label: t("c1"), value: fmt(result.c1) },
        { label: t("v1"), value: fmt(result.v1) },
      ]}
      resultRows={[
        { label: t("c2"), value: fmt(result.c2) },
        { label: t("v2"), value: fmt(result.v2) },
      ]}
      heroLabel={t("dilutionFactor")}
      heroValue={`${fmt(dilutionFactor)}×`}
      sentence={`C1V1=C2V2 — C1 ${fmt(result.c1)}, V1 ${fmt(result.v1)}, C2 ${fmt(result.c2)}, V2 ${fmt(result.v2)}`}
      gauge={{
        zones: [
          { from: 1, to: 5, color: z("--ph-neutral") },
          { from: 5, to: 20, color: z("--chem-stock") },
          { from: 20, to: DILUTION_GAUGE_MAX, color: z("--chem-hot") },
        ],
        domainMin: 1,
        domainMax: DILUTION_GAUGE_MAX,
        value: Math.max(1, Math.min(DILUTION_GAUGE_MAX, dilutionFactor)),
        ticks: [1, 5, 20, DILUTION_GAUGE_MAX],
      }}
    />
  ) : (
    <MolarityShareExportModal
      operationLabel={operationLabel}
      inputRows={[{ label: tForm("molesLabel"), value: `${fmt(result.moles)} mol` }]}
      resultRows={[{ label: t("molarity"), value: concValue }]}
      heroLabel={t("molarity")}
      heroValue={concValue}
      sentence={t("molesSummary", { moles: fmt(result.moles) })}
      gauge={{
        zones: [
          { from: CONCENTRATION_GAUGE_MIN, to: -1.5, color: z("--chem-solvent") },
          { from: -1.5, to: 0.5, color: z("--chem-tint") },
          { from: 0.5, to: CONCENTRATION_GAUGE_MAX, color: z("--chem-solute") },
        ],
        domainMin: CONCENTRATION_GAUGE_MIN,
        domainMax: CONCENTRATION_GAUGE_MAX,
        value: Math.log10(Math.max(result.molarity, 1e-4)),
        ticks: [CONCENTRATION_GAUGE_MIN, -1.5, 0.5, CONCENTRATION_GAUGE_MAX],
      }}
    />
  );

  const dtClass = "text-xs font-semibold tracking-wide text-zinc-600 normal-case dark:text-zinc-300";
  const ddClass = "text-xs font-semibold whitespace-nowrap tabular-nums text-zinc-800 sm:text-sm dark:text-zinc-100";

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="mol-result"
        title={t("heading")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {share}
          </span>
        }
      >
        <MolarityResultScene p={scene} seed={seedVolume} onSetVolume={onSetVolume} />

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-result-values>
          {!hasCalculated ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Calculator size={28} className="text-zinc-400 dark:text-zinc-500" />
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{t("emptyStateMessage")}</p>
            </div>
          ) : errorKey ? (
            <p className="text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300">{t(errorKey)}</p>
          ) : dil ? (
            <>
              <p dir="ltr" data-testid="mol-result-main" className="text-center text-4xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {fmt(result.c2)} <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">mol/L</span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {t("dilutionFactor")}: <bdi dir="ltr">{fmt(dilutionFactor)}×</bdi>
              </p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <dl dir="ltr" data-ph-subvalues className="grid grid-cols-4 gap-3 text-center text-sm">
                {(["c1", "v1", "c2", "v2"] as const).map((k) => (
                  <div key={k}>
                    <dt className={dtClass}>
                      <RichText text={t(k)} />
                    </dt>
                    <dd className={ddClass}>{`${fmt(result[k])} ${k.startsWith("c") ? "M" : "L"}`}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <>
              <p dir="ltr" data-testid="mol-result-main" className="text-center text-4xl font-bold tabular-nums text-blue-700 dark:text-blue-400">
                {fmt(result.molarity)} <span className="text-xl font-semibold text-blue-600 dark:text-blue-300">mol/L</span>
              </p>
              <p className="mt-1 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">{t("molesSummary", { moles: fmt(result.moles) })}</p>
              <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
              <dl dir="ltr" data-ph-subvalues className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <dt className={dtClass}>{tForm("molesLabel")}</dt>
                  <dd className={ddClass}>{fmt(result.moles)}</dd>
                </div>
                <div>
                  <dt className={dtClass}>{tForm("volumeLabel")}</dt>
                  <dd className={ddClass}>{fmt(volume)}</dd>
                </div>
                <div>
                  <dt className={dtClass}>{t("molarity")}</dt>
                  <dd className={ddClass}>{fmt(result.molarity)}</dd>
                </div>
              </dl>
            </>
          )}
        </div>

        <hr data-ph-divider className="my-3 border-zinc-200 dark:border-zinc-800" />
        <div data-ph-mode-tabs>
          <MolarityModeTabs mode={mode} onModeChange={onModeChange} />
        </div>
      </SectionCard>
    </div>
  );
}
