"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DigitStyle } from "@tooloralabs/core";
import {
  GOLD_KARATS,
  METAL_UNIT_GRAMS,
  OIL_UNIT_BARRELS,
  RATIO_ZONE_LIMITS,
  SILVER_FINENESS,
  brentWtiSpread,
  changeOverDays,
  fxVolatility,
  goldSilverRatio,
  goldSilverRatioZone,
  karatPurity,
  metalValueUsd,
  monthlyRatioSeries,
  monthlyVolatility,
  pairMilestones,
  realizedVolatility,
  toBarrels,
  toTroyOunces,
} from "@tooloralabs/tools";
import IndicatorCard, { PillGroup } from "@/components/tools/markets/IndicatorCard";
import LiveFallback from "@/components/tools/markets/LiveFallback";
import SemiGauge from "@/components/tools/markets/SemiGauge";
import SensitivityBars from "@/components/tools/markets/SensitivityBars";
import VolatilityDial from "@/components/tools/markets/VolatilityDial";
import DivergingBars from "@/components/tools/markets/DivergingBars";
import EventTrendChart from "@/components/tools/markets/EventTrendChart";
import { changeColor, useMarketFormatters } from "@/components/tools/markets/fiat";
import { COMMODITIES, isMetal, type CommodityId, type MetalUnit, type OilUnit, type Spot } from "./types";
import { useCommodityHistory, type History, type Loaded } from "./useCommodityData";

type Base = { digitStyle: DigitStyle };
type Selection = { commodity: CommodityId; amount: number; metalUnit: MetalUnit; oilUnit: OilUnit; spot: Spot };

function historyFallback(h: Loaded<History>, loading: string, error: string, height: number) {
  if (h.status === "ready") return undefined;
  return <LiveFallback status={h.status === "loading" ? "loading" : "error"} loading={loading} error={error} height={height} />;
}

const qtyOf = (s: Selection) => {
  const amt = Number.isFinite(s.amount) && s.amount > 0 ? s.amount : 0;
  return isMetal(s.commodity) ? toTroyOunces(amt, s.metalUnit) : toBarrels(amt, s.oilUnit);
};

/* ---------- Unit equivalence (§31 type 11) — top result column ---------- */

export function CommodityUnitEquivalence({ commodity, amount, metalUnit, oilUnit, spot, digitStyle }: Selection & Base) {
  const t = useTranslations("tools.commodities-tracker.equivalence");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const price = spot[commodity];
  if (price === null) return null;
  const metal = isMetal(commodity);
  const amt = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const unit = metal ? metalUnit : oilUnit;
  const tiles = metal
    ? (Object.keys(METAL_UNIT_GRAMS) as MetalUnit[]).map((u) => ({ u, qty: (amt * METAL_UNIT_GRAMS[metalUnit]) / METAL_UNIT_GRAMS[u], per: (price * METAL_UNIT_GRAMS[u]) / METAL_UNIT_GRAMS.troyOunce }))
    : (Object.keys(OIL_UNIT_BARRELS) as OilUnit[]).map((u) => ({ u, qty: (amt * OIL_UNIT_BARRELS[oilUnit]) / OIL_UNIT_BARRELS[u], per: price * OIL_UNIT_BARRELS[u] }));
  const ex = tiles.find((x) => x.u !== unit) ?? tiles[0];
  const short = (u: string) => tA(`unitsShort.${u}`);

  return (
    <IndicatorCard
      id="equivalence"
      title={t("title")}
      heading={t("heading", { amount: f.num(amt, 4), unit: short(unit), name: tA(`commodity.${commodity}`) })}
      intro={t("intro")}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: t("rowAmount"), value: `${f.num(amt, 4)} ${short(unit)}` },
          metal
            ? { label: t("rowGrams"), value: `× ${f.num(METAL_UNIT_GRAMS[metalUnit], 4)} = ${f.num(amt * METAL_UNIT_GRAMS[metalUnit], 4)} g` }
            : { label: t("rowBarrels"), value: `× ${f.num(OIL_UNIT_BARRELS[oilUnit], 6)} = ${f.num(amt * OIL_UNIT_BARRELS[oilUnit], 4)} bbl` },
          metal
            ? { label: t("rowTo", { unit: short(ex.u) }), value: `÷ ${f.num(METAL_UNIT_GRAMS[ex.u as MetalUnit], 4)}` }
            : { label: t("rowTo", { unit: short(ex.u) }), value: `÷ ${f.num(OIL_UNIT_BARRELS[ex.u as OilUnit], 6)}` },
          { label: t("rowResult"), value: `${f.num(ex.qty, 4)} ${short(ex.u)}`, emphasize: true },
        ],
      }}
    >
      <div className="grid grid-cols-2 gap-2" data-testid="equivalence-grid">
        {tiles.map((x) => (
          <div key={x.u} className={`min-w-0 rounded-xl border p-2.5 ${x.u === unit ? "border-blue-500 bg-blue-50/60 dark:bg-blue-500/10" : "border-zinc-200 dark:border-zinc-700"}`}>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{tA(`units.${x.u}`)}</p>
            <p dir="ltr" className="truncate font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {f.num(x.qty, x.qty < 1 ? 5 : 3)} {short(x.u)}
            </p>
            <p dir="ltr" className="truncate font-mono text-[11px] text-blue-700 dark:text-blue-300">
              {f.money(x.per)} / {short(x.u)}
            </p>
          </div>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* ---------- Gold/silver ratio gauge (§31 type 8) ---------- */

const RATIO_MAX = 130;

export function CommodityRatioGauge({ spot, amount, metalUnit, digitStyle }: Pick<Selection, "spot" | "amount" | "metalUnit"> & Base) {
  const t = useTranslations("tools.commodities-tracker.goldSilverRatio");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const ratio = goldSilverRatio(spot.gold ?? 0, spot.silver ?? 0);
  if (ratio === null) return null;
  const zone = goldSilverRatioZone(ratio);
  const amt = Number.isFinite(amount) && amount > 0 ? amount : 1;
  const zoneTone = { tight: "text-emerald-600", average: "text-blue-600", wide: "text-amber-600", extreme: "text-red-600" }[zone];

  return (
    <IndicatorCard
      id="ratio"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro")}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: t("rowGold"), value: `${f.num(spot.gold!, 2)} USD` },
          { label: t("rowSilver"), value: `${f.num(spot.silver!, 2)} USD` },
          { label: t("rowFormula"), value: `${f.num(spot.gold!, 2)} ÷ ${f.num(spot.silver!, 2)}` },
          { label: t("rowRatio"), value: f.fixed(ratio, 1), emphasize: true, note: t(`zones.${zone}`) },
          { label: t("rowYours", { amount: f.num(amt, 2), unit: tA(`unitsShort.${metalUnit}`) }), value: `${f.num(amt * ratio, 2)} ${tA(`unitsShort.${metalUnit}`)}` },
        ],
      }}
    >
      <div className="flex flex-col items-center">
        <SemiGauge
          value={Math.min(ratio, RATIO_MAX)}
          max={RATIO_MAX}
          zones={[
            { to: RATIO_ZONE_LIMITS.tight, className: "stroke-emerald-500" },
            { to: RATIO_ZONE_LIMITS.average, className: "stroke-blue-500" },
            { to: RATIO_ZONE_LIMITS.wide, className: "stroke-amber-400" },
            { to: RATIO_MAX, className: "stroke-red-500" },
          ]}
          ticks={[0, RATIO_ZONE_LIMITS.tight, RATIO_ZONE_LIMITS.average, RATIO_ZONE_LIMITS.wide, RATIO_MAX].map((v) => ({ value: v, label: String(v) }))}
          ariaLabel={t("heading")}
          testId="ratio-gauge"
        />
        <p className="-mt-1 font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100" dir="ltr" data-testid="ratio-value">
          {f.fixed(ratio, 1)} : 1
        </p>
        <p className={`text-center text-sm font-semibold ${zoneTone}`}>{t(`zones.${zone}`)}</p>
        <p className="mt-2 max-w-md text-center text-xs text-zinc-500 dark:text-zinc-400">{t("fact")}</p>
      </div>
    </IndicatorCard>
  );
}

/* ---------- Brent vs WTI spread (§31 type 14, balance) ---------- */

export function CommoditySpreadBalance({ spot, amount, oilUnit, commodity, digitStyle }: Selection & Base) {
  const t = useTranslations("tools.commodities-tracker.spread");
  const f = useMarketFormatters(digitStyle);
  const s = brentWtiSpread(spot.brent ?? 0, spot.wti ?? 0);
  if (!s) return null;
  const bbl = !isMetal(commodity) && amount > 0 ? toBarrels(amount, oilUnit) : 1000;
  // ±10% spread tilts the beam the full 12°.
  const tilt = Math.max(-12, Math.min(12, (s.percent / 10) * 12));
  const pan = (label: string, price: number, heavy: boolean) => (
    <div className="flex w-32 flex-col items-center">
      <div className={`h-1 w-24 rounded ${heavy ? "bg-amber-500" : "bg-sky-500"}`} />
      <div className={`mt-1 rounded-b-2xl px-3 pb-2 pt-1 text-center ${heavy ? "bg-amber-50 dark:bg-amber-500/10" : "bg-sky-50 dark:bg-sky-500/10"}`}>
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</p>
        <p dir="ltr" className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {f.money(price)}
        </p>
      </div>
    </div>
  );

  return (
    <IndicatorCard
      id="spread"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro")}
      worked={{
        title: t("workedTitle"),
        rows: [
          { label: "Brent", value: `${f.num(spot.brent!, 2)} USD` },
          { label: "WTI", value: `− ${f.num(spot.wti!, 2)} USD` },
          { label: t("rowSpread"), value: `= ${f.num(s.spread, 2)} USD`, note: `${f.signedPct(s.percent)} ${t("vsWti")}` },
          { label: t("rowOnYours", { bbl: f.num(bbl, 2) }), value: `${f.num(bbl, 2)} × ${f.num(s.spread, 2)}` },
          { label: t("rowResult"), value: f.money(bbl * s.spread), emphasize: true, note: t(s.spread >= 0 ? "brentPremium" : "wtiPremium") },
        ],
      }}
    >
      <div className="flex flex-col items-center" dir="ltr" data-testid="spread-balance">
        <p className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {s.spread >= 0 ? "+" : "−"}
          {f.money(Math.abs(s.spread))}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("perBarrel")}</p>
        {/* The heavier (pricier) side sits lower: Brent on the left, WTI on the right. */}
        <div className="relative mt-4 h-40 w-80">
          <div className="absolute inset-x-0 top-6 flex justify-between transition-transform duration-700" style={{ transform: `rotate(${-tilt}deg)` }}>
            <div className="absolute inset-x-4 top-0 h-1.5 rounded bg-zinc-700 dark:bg-zinc-300" />
            <div className="mt-2">{pan("Brent", spot.brent!, s.spread >= 0)}</div>
            <div className="mt-2">{pan("WTI", spot.wti!, s.spread < 0)}</div>
          </div>
          <div className="absolute left-1/2 top-6 h-28 w-1.5 -translate-x-1/2 rounded bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[22px] border-b-[18px] border-x-transparent border-b-zinc-400 dark:border-b-zinc-500" />
        </div>
      </div>
    </IndicatorCard>
  );
}

/* ---------- Karat / fineness value table (§31 type 17) ---------- */

export function CommodityPurityTable({ commodity, amount, metalUnit, spot, digitStyle }: Selection & Base) {
  const t = useTranslations("tools.commodities-tracker.purity");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const metal: "gold" | "silver" = commodity === "silver" ? "silver" : "gold";
  const price = spot[metal];
  if (price === null) return null;
  // Oil selected: show the gold table for 1 gram so the card still reads naturally.
  const unit: MetalUnit = isMetal(commodity) ? metalUnit : "gram";
  const amt = isMetal(commodity) && amount > 0 ? amount : 1;
  const rows =
    metal === "gold"
      ? GOLD_KARATS.map((k) => ({ key: `${k}k`, label: `${k}K`, purity: karatPurity(k), tag: k === 24 ? "investment" : k >= 21 ? "gulf" : k === 18 ? "fine" : "everyday" }))
      : SILVER_FINENESS.map((p) => ({ key: String(p), label: `${p}`, purity: p / 1000, tag: p === 999 ? "investment" : p === 925 ? "sterling" : p === 958 ? "britannia" : "coin" }));
  const perGram = (purity: number) => metalValueUsd(1, "gram", price, purity);
  const ex = rows[metal === "gold" ? 3 : 2];
  const tagTone: Record<string, string> = {
    investment: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    gulf: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    fine: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
    everyday: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
    sterling: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    britannia: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
    coin: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  };
  const unitShort = tA(`unitsShort.${unit}`);

  return (
    <IndicatorCard
      id="purity"
      title={t("title")}
      heading={t(metal === "gold" ? "headingGold" : "headingSilver", { amount: f.num(amt, 4), unit: unitShort })}
      intro={t(metal === "gold" ? "introGold" : "introSilver")}
      worked={{
        title: t("workedTitle", { label: ex.label }),
        rows: [
          { label: t("rowSpot"), value: `${f.num(price, 2)} USD / oz t` },
          { label: t("rowPurity"), value: metal === "gold" ? `${ex.label} = ${ex.label.replace("K", "")} ÷ 24 = ${f.num(ex.purity, 4)}` : `${ex.label} ÷ 1000 = ${f.num(ex.purity, 3)}` },
          { label: t("rowGrams"), value: `${f.num(amt, 4)} ${unitShort} = ${f.num(toTroyOunces(amt, unit), 5)} oz t` },
          { label: t("rowResult"), value: f.money(metalValueUsd(amt, unit, price, ex.purity)), emphasize: true },
        ],
      }}
    >
      <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
        <table className="w-full min-w-[460px] text-sm" data-testid="purity-table">
          <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-start font-medium">{t(metal === "gold" ? "colKarat" : "colFineness")}</th>
              <th className="px-3 py-2 text-start font-medium">{t("colUse")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("colPurity")}</th>
              <th className="px-3 py-2 text-end font-medium">{t("colPerGram")}</th>
              <th className="px-3 py-2 text-end font-medium">
                <span dir="ltr">
                  {f.num(amt, 4)} {unitShort}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-zinc-100 dark:border-zinc-800">
                <td dir="ltr" className="px-3 py-2 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {r.label}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tagTone[r.tag]}`}>{t(`tags.${r.tag}`)}</span>
                </td>
                <td dir="ltr" className="px-3 py-2 text-end font-mono text-zinc-700 dark:text-zinc-300">
                  {f.num(r.purity * 100, 2)}%
                </td>
                <td dir="ltr" className="px-3 py-2 text-end font-mono text-zinc-900 dark:text-zinc-100">
                  {f.money(perGram(r.purity))}
                </td>
                <td dir="ltr" className="px-3 py-2 text-end font-mono font-semibold text-blue-700 dark:text-blue-300">
                  {f.money(metalValueUsd(amt, unit, price, r.purity))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IndicatorCard>
  );
}

/* ---------- Sensitivity trio (§31 type 12) ---------- */

const SHIFTS = [2, 5, 10] as const;

export function CommoditySensitivityTrio(props: Selection & Base) {
  const t = useTranslations("tools.commodities-tracker.sensitivity");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const [pct, setPct] = useState<(typeof SHIFTS)[number]>(2);
  const f = useMarketFormatters(props.digitStyle);
  const price = props.spot[props.commodity];
  if (price === null) return null;
  const qty = qtyOf(props);
  const base = isMetal(props.commodity) ? "oz t" : "bbl";
  const name = tA(`commodity.${props.commodity}`);
  const pts = [-pct, 0, pct].map((s) => ({ price: price * (1 + s / 100), value: qty * price * (1 + s / 100) }));
  const delta = (v: number) => (v === 0 ? "—" : `${v > 0 ? "+" : "−"}${f.money(Math.abs(v))}`);

  return (
    <IndicatorCard
      id="sensitivity"
      title={t("title")}
      heading={t("heading", { name })}
      intro={t("intro", { name })}
      controls={<PillGroup label={t("shiftLabel")} options={SHIFTS} value={pct} onChange={setPct} format={(s) => `±${s}%`} />}
      worked={{
        title: t("workedTitle", { pct }),
        rows: [
          { label: t("rowSpot", { unit: base }), value: `${f.num(price, 2)} USD` },
          { label: t("rowShifted", { pct }), value: `× ${f.num(1 + pct / 100, 2)} = ${f.num(pts[2].price, 2)} USD` },
          { label: t("rowQty"), value: `${f.num(qty, 4)} ${base}` },
          { label: t("rowResult"), value: f.money(pts[2].value), emphasize: true, note: t("rowNote", { diff: delta(pts[2].value - pts[1].value) }) },
        ],
      }}
    >
      <SensitivityBars
        points={[
          { label: t("low", { pct }), sub: `${f.money(pts[0].price)} / ${base}`, value: pts[0].value, display: f.money(pts[0].value), delta: delta(pts[0].value - pts[1].value) },
          { label: t("now"), sub: `${f.money(pts[1].price)} / ${base}`, value: pts[1].value, display: f.money(pts[1].value), delta: "—" },
          { label: t("high", { pct }), sub: `${f.money(pts[2].price)} / ${base}`, value: pts[2].value, display: f.money(pts[2].value), delta: delta(pts[2].value - pts[1].value) },
        ]}
      />
    </IndicatorCard>
  );
}

/* ---------- Volatility (§31 type 8) ---------- */

export function CommodityVolatilityGauge({ commodity, history, digitStyle }: { commodity: CommodityId; history: Loaded<History> } & Base) {
  const t = useTranslations("tools.commodities-tracker.volatility");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const name = tA(`commodity.${commodity}`);
  const points = history.status === "ready" ? history.data.points : [];
  const monthly = history.status === "ready" && history.data.frequency === "monthly";
  // Gold is PAXG, traded every day (√365); oil fixings are business days (√252); silver is monthly (√12).
  const vol =
    commodity === "gold"
      ? (() => {
          const v = realizedVolatility(points.map((p) => ({ time: 0, open: p.rate, high: p.rate, low: p.rate, close: p.rate, volume: 0 })), 30);
          return v && { periodPercent: v.dailyPercent, annualizedPercent: v.annualizedPercent, returns: v.returns, scale: "√365", factor: Math.sqrt(365) };
        })()
      : monthly
        ? (() => {
            const v = monthlyVolatility(points.map((p) => p.rate), 12);
            return v && { periodPercent: v.monthlyPercent, annualizedPercent: v.annualizedPercent, returns: v.returns, scale: "√12", factor: Math.sqrt(12) };
          })()
        : (() => {
            const v = fxVolatility(points.map((p) => p.rate), 30);
            return v && { periodPercent: v.dailyPercent, annualizedPercent: v.annualizedPercent, returns: v.returns, scale: "√252", factor: Math.sqrt(252) };
          })();
  const limits = { low: 15, medium: 30 };
  const zoneKey = vol ? (vol.annualizedPercent < limits.low ? "low" : vol.annualizedPercent < limits.medium ? "medium" : "high") : "low";

  return (
    <IndicatorCard
      id="volatility"
      title={t("title")}
      heading={t("heading", { name })}
      intro={t(monthly ? "introMonthly" : "intro")}
      fallback={vol ? undefined : historyFallback(history, t("loading"), t("error"), 220)}
      worked={
        vol && {
          title: t("workedTitle"),
          rows: [
            { label: t(monthly ? "rowReturnsMonthly" : "rowReturns"), value: String(vol.returns) },
            { label: t(monthly ? "rowMonthly" : "rowDaily"), value: `${f.num(vol.periodPercent, 3)}%` },
            { label: t("rowScale"), value: `× ${vol.scale} = × ${f.num(vol.factor, 2)}` },
            { label: t("rowAnnual"), value: `${f.fixed(vol.annualizedPercent)}%`, emphasize: true, note: t(`zones.${zoneKey}`) },
          ],
        }
      }
    >
      {vol && (
        <VolatilityDial
          value={vol.annualizedPercent}
          limits={limits}
          max={80}
          valueText={`${f.fixed(vol.annualizedPercent)}%`}
          zoneLabels={{ low: t("zones.low"), medium: t("zones.medium"), high: t("zones.high") }}
          ariaLabel={t("heading", { name })}
        />
      )}
    </IndicatorCard>
  );
}

/* ---------- Returns by period (§31 type 1) ---------- */

const PERIODS = [
  { key: "1M", days: 30 },
  { key: "3M", days: 91 },
  { key: "6M", days: 182 },
  { key: "1Y", days: 365 },
  { key: "5Y", days: 1826 },
  { key: "10Y", days: 3652 },
  { key: "20Y", days: 7305 },
] as const;

export function CommodityReturns({ commodity, history, digitStyle }: { commodity: CommodityId; history: Loaded<History> } & Base) {
  const t = useTranslations("tools.commodities-tracker.returns");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const name = tA(`commodity.${commodity}`);
  const points = (history.status === "ready" ? history.data.points : []).filter((p) => p.rate > 0);
  const bars = PERIODS.flatMap((p) => {
    const v = changeOverDays(points, p.days);
    return v === null ? [] : [{ key: p.key, label: t(`periods.${p.key}`), value: v }];
  });
  const year = bars.find((b) => b.key === "1Y");
  const last = points[points.length - 1];
  const then = year && last ? last.rate / (1 + year.value / 100) : null;

  return (
    <IndicatorCard
      id="returns"
      title={t("title")}
      heading={t("heading", { name })}
      intro={t("intro")}
      fallback={bars.length ? undefined : historyFallback(history, t("loading"), t("error"), 240)}
      worked={
        year && last && then
          ? {
              title: t("workedTitle"),
              rows: [
                { label: t("rowThen"), value: `${f.num(then, 2)} USD` },
                { label: t("rowNow"), value: `${f.num(last.rate, 2)} USD` },
                { label: t("rowFormula"), value: `${f.num(last.rate, 2)} ÷ ${f.num(then, 2)} − 1` },
                { label: t("rowResult"), value: f.signedPct(year.value), emphasize: true },
              ],
            }
          : null
      }
    >
      <DivergingBars bars={bars} format={(v) => f.signedPct(v)} testId="period-returns" />
    </IndicatorCard>
  );
}

/* ---------- Comparison cards (§31 type 16) ---------- */

export function CommodityComparisonCards({ spot, commodity, onPick, digitStyle }: { spot: Spot; commodity: CommodityId; onPick: (c: CommodityId) => void } & Base) {
  const t = useTranslations("tools.commodities-tracker.comparison");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const histories = {
    gold: useCommodityHistory("goldMonthly"),
    silver: useCommodityHistory("silver"),
    wti: useCommodityHistory("wti"),
    brent: useCommodityHistory("brent"),
  };
  const stats = COMMODITIES.map((id) => {
    const h = histories[id];
    const pts = h.status === "ready" ? h.data.points : [];
    const m = pairMilestones(pts);
    const price = spot[id];
    return { id, price, y1: changeOverDays(pts.filter((p) => p.rate > 0), 365), high: m?.high ?? null, fromHigh: m && price ? (price / m.high.rate - 1) * 100 : null };
  });
  const sel = stats.find((s) => s.id === commodity)!;

  return (
    <IndicatorCard
      id="compare"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro", { currency: f.currency })}
      worked={
        sel.price !== null && sel.high
          ? {
              title: t("workedTitle", { name: tA(`commodity.${sel.id}`) }),
              rows: [
                { label: t("rowNow"), value: `${f.num(sel.price, 2)} USD` },
                { label: t("rowHigh"), value: `${f.num(sel.high.rate, 2)} USD`, note: sel.high.date.slice(0, 7) },
                { label: t("rowFormula"), value: `${f.num(sel.price, 2)} ÷ ${f.num(sel.high.rate, 2)} − 1` },
                { label: t("rowResult"), value: f.signedPct(sel.fromHigh ?? 0), emphasize: true },
              ],
            }
          : null
      }
    >
      <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4" data-testid="comparison-cards">
        {stats.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            className={`min-w-0 rounded-xl border-t-4 bg-zinc-50 p-3 text-start transition hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 ${s.id === commodity ? "border-blue-600 ring-1 ring-blue-200 dark:ring-blue-500/30" : "border-zinc-300 dark:border-zinc-600"}`}
          >
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tA(`commodity.${s.id}`)}</p>
            <p dir="ltr" className="truncate font-mono text-base font-bold text-blue-700 dark:text-blue-300">
              {s.price === null ? "—" : f.money(s.price)}
            </p>
            <p className="text-[10px] text-zinc-400">{isMetal(s.id) ? t("perOunce") : t("perBarrel")}</p>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-1">
                <dt className="text-zinc-500 dark:text-zinc-400">{t("y1")}</dt>
                <dd dir="ltr" className={`font-mono font-semibold ${changeColor(s.y1)}`}>{s.y1 === null ? "—" : f.signedPct(s.y1)}</dd>
              </div>
              <div className="flex justify-between gap-1">
                <dt className="text-zinc-500 dark:text-zinc-400">{t("fromHigh")}</dt>
                <dd dir="ltr" className={`font-mono font-semibold ${changeColor(s.fromHigh)}`}>{s.fromHigh === null ? "—" : f.signedPct(s.fromHigh)}</dd>
              </div>
            </dl>
          </button>
        ))}
      </div>
    </IndicatorCard>
  );
}

/* ---------- Silver history since 1990 (§31 type 7) ---------- */

const SILVER_EVENTS = [
  { key: "start", date: "1990-01-01" },
  { key: "crisis", date: "2008-10-01" },
  { key: "peak2011", date: "2011-04-01" },
  { key: "covid", date: "2020-03-01" },
] as const;

export function CommoditySilverHistory({ amount, metalUnit, commodity, digitStyle }: Pick<Selection, "amount" | "metalUnit" | "commodity"> & Base) {
  const t = useTranslations("tools.commodities-tracker.silverHistory");
  const tA = useTranslations("tools.commodities-tracker.aboveFold");
  const f = useMarketFormatters(digitStyle);
  const h = useCommodityHistory("silver");
  const pts = h.status === "ready" ? h.data.points : [];
  const m = pairMilestones(pts);
  const oz = commodity === "silver" && amount > 0 ? toTroyOunces(amount, metalUnit) : 1;
  const unitText = commodity === "silver" && amount > 0 ? `${f.num(amount, 4)} ${tA(`unitsShort.${metalUnit}`)}` : "1 oz t";

  return (
    <IndicatorCard
      id="silver-history"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro")}
      fallback={m ? undefined : historyFallback(h, t("loading"), t("error"), 300)}
      worked={
        m && {
          title: t("workedTitle", { amount: unitText }),
          rows: [
            ...SILVER_EVENTS.flatMap((e, i) => {
              const p = pts.find((pt) => pt.date >= e.date);
              return p ? [{ label: `${i + 1}. ${t(`events.${e.key}`)}`, value: f.money(p.rate * oz), note: p.date.slice(0, 7) }] : [];
            }),
            { label: t("rowHigh"), value: f.money(m.high.rate * oz), note: m.high.date.slice(0, 7) },
            { label: t("rowNow"), value: f.money(m.last.rate * oz), emphasize: true, note: m.last.date.slice(0, 7) },
          ],
        }
      }
    >
      {m && <EventTrendChart points={pts} events={[...SILVER_EVENTS]} formatValue={(v) => f.num(v, 2)} ariaLabel={t("heading")} testId="silver-trend" />}
    </IndicatorCard>
  );
}

/* ---------- Gold/silver ratio since 1990 (§31 type 19, zone bands) ---------- */

const RATIO_EVENTS = [
  { key: "gulf1991", date: "1991-02-01" },
  { key: "low2011", date: "2011-04-01" },
  { key: "covid2020", date: "2020-03-01" },
] as const;

export function CommodityRatioHistory({ spot, digitStyle }: { spot: Spot } & Base) {
  const t = useTranslations("tools.commodities-tracker.ratioHistory");
  const f = useMarketFormatters(digitStyle);
  const gold = useCommodityHistory("goldMonthly");
  const silver = useCommodityHistory("silver");
  const series = gold.status === "ready" && silver.status === "ready" ? monthlyRatioSeries(gold.data.points, silver.data.points) : [];
  const m = pairMilestones(series);
  const avg = series.length ? series.reduce((s, p) => s + p.rate, 0) / series.length : 0;
  const now = goldSilverRatio(spot.gold ?? 0, spot.silver ?? 0);
  const both: Loaded<History> = gold.status !== "ready" ? gold : silver;

  return (
    <IndicatorCard
      id="ratio-history"
      title={t("title")}
      heading={t("heading")}
      intro={t("intro")}
      fallback={m ? undefined : historyFallback(both, t("loading"), t("error"), 300)}
      worked={
        m && {
          title: t("workedTitle"),
          rows: [
            ...RATIO_EVENTS.flatMap((e, i) => {
              const p = series.find((pt) => pt.date >= e.date);
              return p ? [{ label: `${i + 1}. ${t(`events.${e.key}`)}`, value: f.fixed(p.rate, 1), note: p.date.slice(0, 7) }] : [];
            }),
            { label: t("rowHigh"), value: f.fixed(m.high.rate, 1), note: m.high.date.slice(0, 7) },
            { label: t("rowLow"), value: f.fixed(m.low.rate, 1), note: m.low.date.slice(0, 7) },
            { label: t("rowAvg", { n: series.length }), value: f.fixed(avg, 1) },
            ...(now ? [{ label: t("rowNow"), value: f.fixed(now, 1), emphasize: true, note: t(now > avg ? "aboveAvg" : "belowAvg", { pct: f.num(Math.abs(now / avg - 1) * 100, 1) }) }] : []),
          ],
        }
      }
    >
      {m && (
        <EventTrendChart
          points={series}
          events={[...RATIO_EVENTS]}
          formatValue={(v) => f.num(v, 1)}
          ariaLabel={t("heading")}
          testId="ratio-trend"
          bands={[
            { from: 0, to: RATIO_ZONE_LIMITS.tight, className: "fill-emerald-500/10" },
            { from: RATIO_ZONE_LIMITS.tight, to: RATIO_ZONE_LIMITS.average, className: "fill-blue-500/10" },
            { from: RATIO_ZONE_LIMITS.average, to: RATIO_ZONE_LIMITS.wide, className: "fill-amber-400/15" },
            { from: RATIO_ZONE_LIMITS.wide, to: 200, className: "fill-red-500/10" },
          ]}
        />
      )}
    </IndicatorCard>
  );
}
