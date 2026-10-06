"use client";
/**
 * Card 2: the common-angles reference table. The row nearest the live theta is the bold
 * key-result row (§42); hovering a row highlights that same angle's marker on the unit-circle
 * card above (and vice versa) via the shared hoverAngle state from ScientificSidebarPanels.
 */
import { useTranslations } from "next-intl";
import { GlassHeroCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import "@/components/tool-ui/glass/glass-tokens.css";
import { COMMON_ANGLES, nearestCommonAngle, round4 } from "./scientificAngleData";

export default function ScientificCommonAnglesCard({
  theta,
  hoverAngle,
  setHoverAngle,
}: {
  theta: number;
  hoverAngle: number | null;
  setHoverAngle: (deg: number | null) => void;
}) {
  const t = useTranslations("tools.scientific-calculator.sidebar.commonAngles");
  const nearest = nearestCommonAngle(theta);

  const rows = COMMON_ANGLES.map((a) => {
    const rad = (a.deg * Math.PI) / 180;
    const sinDec = round4(Math.sin(rad));
    const cosDec = round4(Math.cos(rad));
    const tanDec = a.deg % 90 === 0 && a.deg % 180 !== 0 ? "∞" : round4(Math.tan(rad));
    return {
      angle: `${a.deg}° · ${a.radLabel}`,
      sin: `${a.sinExact} · ${sinDec}`,
      cos: `${a.cosExact} · ${cosDec}`,
      tan: a.tanExact === "∞" ? "∞" : `${a.tanExact} · ${tanDec}`,
      rowKey: String(a.deg),
      isKeyResult: a.deg === nearest,
    };
  });

  return (
    <GlassHeroCard n={21} title={t("title")} subtitle={t("subtitle")} compact>
      {/* §41: this card's own height is capped and internally scrollable so the sidebar column
          (History + these two cards) lands on the calculator column's own bottom edge rather
          than growing past it -- "hands off the calculator" means this side has to fit, not the
          other way around. Scrolling to reach a row is not clipping: every row stays reachable. */}
      <div className="max-h-[60px] overflow-y-auto rounded-lg" style={{ border: "1px solid var(--glass-table-row-border)" }}>
        <GlassTable
          activeRowKey={hoverAngle !== null ? String(hoverAngle) : null}
          onRowHover={(key) => setHoverAngle(key === null ? null : Number(key))}
          columns={[
            { key: "angle", label: t("colAngle") },
            { key: "sin", label: "sin" },
            { key: "cos", label: "cos" },
            { key: "tan", label: "tan" },
          ]}
          rows={rows}
        />
      </div>
    </GlassHeroCard>
  );
}
