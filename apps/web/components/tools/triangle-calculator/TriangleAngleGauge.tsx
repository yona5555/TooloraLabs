"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { solveSSS } from "@tooloralabs/tools";
import RatioGauge from "@/components/tool-ui/RatioGauge";
import SectionCard from "@/components/tool-ui/SectionCard";
import TriangleWorkedExampleNote from "./TriangleWorkedExampleNote";
import TriangleSinCosLiveCurve from "./TriangleSinCosLiveCurve";
import { round } from "./triangleEducationMath";
import { TRIANGLE_SCENARIOS } from "./types";

type ShapeKey = "acute" | "right" | "obtuse";

const ZONES: { key: ShapeKey; from: number; to: number; colorClass: string }[] = [
  { key: "acute", from: 0, to: 85, colorClass: "stroke-green-500 dark:stroke-green-400" },
  { key: "right", from: 85, to: 95, colorClass: "stroke-blue-500 dark:stroke-blue-400" },
  { key: "obtuse", from: 95, to: 180, colorClass: "stroke-amber-500 dark:stroke-amber-400" },
];

const CAPTION_COLOR: Record<ShapeKey, string> = {
  acute: "fill-green-500 dark:fill-green-400",
  right: "fill-blue-500 dark:fill-blue-400",
  obtuse: "fill-amber-500 dark:fill-amber-400",
};

const DOMAIN_MIN = 0;
const DOMAIN_MAX = 180;
const TICKS = [0, 85, 95, 180];

function shapeForAngle(angle: number): ShapeKey {
  const zone = ZONES.find((z) => angle < z.to) ?? ZONES[ZONES.length - 1];
  return zone.key;
}

export default function TriangleAngleGauge() {
  const t = useTranslations("tools.triangle-calculator.education.intro.angleGauge");
  const tScenarios = useTranslations("tools.triangle-calculator.scenarios");
  const tShapes = useTranslations("tools.triangle-calculator.education.intro.angleGauge.shapes");
  const [selectedKey, setSelectedKey] = useState("rightTriangle");

  const solved = useMemo(() => {
    const map = new Map<string, ReturnType<typeof solveSSS>>();
    for (const s of TRIANGLE_SCENARIOS) {
      const [a, b, c] = s.sides.map(Number);
      map.set(s.key, solveSSS(a, b, c));
    }
    return map;
  }, []);

  const selected = solved.get(selectedKey);
  const selectedAngle = selected ? Math.max(selected.angleA, selected.angleB, selected.angleC) : 0;
  const shape = shapeForAngle(selectedAngle);
  const classification = tShapes(shape);

  return (
    <SectionCard title={t("title")}>
      <p className="mb-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{t("intro")}</p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="shrink-0">
          <div dir="ltr">
            <RatioGauge
              value={selectedAngle}
              domainMin={DOMAIN_MIN}
              domainMax={DOMAIN_MAX}
              zones={ZONES}
              valueLabel={`${Math.round(selectedAngle)}°`}
              caption={classification}
              captionColorClass={CAPTION_COLOR[shape]}
              ticks={TICKS}
            />
          </div>

          <div role="tablist" className="mt-2 flex flex-wrap justify-center gap-2">
            {TRIANGLE_SCENARIOS.map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={selectedKey === s.key}
                onClick={() => setSelectedKey(s.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  selectedKey === s.key
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-current/20 bg-transparent text-current/70 hover:border-blue-300 hover:text-current"
                }`}
              >
                {tScenarios(s.key)}
              </button>
            ))}
          </div>
        </div>

        {selected && selected.valid && (
          <TriangleWorkedExampleNote
            title={t("worked.title")}
            rows={[
              { label: t("worked.angleA"), value: `${round(selected.angleA, 1)}°` },
              { label: t("worked.angleB"), value: `${round(selected.angleB, 1)}°` },
              { label: t("worked.angleC"), value: `${round(selected.angleC, 1)}°` },
              { label: t("worked.largest"), value: `${round(selectedAngle, 1)}°`, emphasize: true, note: classification },
            ]}
          />
        )}
      </div>

      {selected && selected.valid && (
        <TriangleSinCosLiveCurve angles={[{ label: "A", deg: selected.angleA }, { label: "B", deg: selected.angleB }, { label: "C", deg: selected.angleC }]} />
      )}

      <p className="mt-4 text-center text-sm leading-6">{t("verdict", { example: tScenarios(selectedKey), classification })}</p>
      <p className="mt-1 text-center text-sm leading-6 opacity-80">{t("fact", { angle: Math.round(selectedAngle) })}</p>
    </SectionCard>
  );
}
