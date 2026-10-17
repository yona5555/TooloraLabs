"use client";
import { beaufort, compass16, dewComfort, isNightSymbol, uvLevel } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import LiveTable3DLayout, { LiveTableFill, type LiveTableGroup } from "@/components/tool-ui/three/LiveTable3DLayout";
import WeatherIcon from "./WeatherIcon";
import WxSkyScene from "./WxSkyScene";
import { useWxT, type WxDerived, type WxFmt } from "./wx";

type Props = { d: WxDerived; f: WxFmt; status: "idle" | "loading" | "error" };

/** Result card: live conditions table (left) beside the animated sky for the current hour (right). */
export default function WxResult({ d, f, status }: Props) {
  const t = useWxT();
  const cur = d.cur!;
  const zone = d.place.zone;
  const today = d.days[0];
  const feels = d.feels!;
  const bf = beaufort(cur.windKmh / 3.6);
  const dir = compass16(cur.windDir);
  const sunrise = d.sun.sunrise;
  const sunset = d.sun.sunset;
  const feelsFormula =
    feels.method === "heatIndex"
      ? t("result.f.heatIndex", { t: f.deg(cur.tempC), rh: f.num(cur.rh) })
      : feels.method === "windChill"
        ? t("result.f.windChill", { t: f.deg(cur.tempC), v: f.wind(cur.windKmh) })
        : t("result.f.air");

  const groups: LiveTableGroup[] = [
    {
      title: t("result.g.now"),
      rows: [
        { label: t("result.temp"), formula: t("result.f.met"), value: f.temp(cur.tempC, 1), emphasize: true },
        { label: t("result.feels"), formula: feelsFormula, value: f.temp(feels.valueC, 1) },
        { label: t("result.condition"), formula: cur.symbol ?? "—", value: t(`category.${d.category}`) },
        { label: t("result.humidity"), formula: t("result.f.met"), value: `${f.num(cur.rh)}%` },
        { label: t("result.dew"), formula: t("result.f.magnus", { t: f.deg(cur.tempC), rh: f.num(cur.rh) }), value: `${f.temp(d.dew!, 1)} · ${t(`dewComfort.${dewComfort(d.dew!)}`)}` },
        { label: t("result.cloud"), formula: t("result.f.met"), value: `${f.num(cur.cloud)}%` },
      ],
    },
    {
      title: t("result.g.windPressure"),
      rows: [
        { label: t("result.wind"), formula: t("result.f.wind", { ms: f.num(cur.windKmh / 3.6, 1) }), value: `${f.wind(cur.windKmh)} ${t(`compass.${dir}`)}` },
        { label: t("result.beaufort"), formula: t("result.f.beaufort"), value: `${f.num(bf)} · ${t(`beaufort.${bf}`)}` },
        { label: t("result.pressure"), formula: t("result.f.trend", { delta: f.pressureDelta(d.tendency.deltaHpa) }), value: `${f.pressure(cur.pressureHpa)} ${t(`trend.${d.tendency.trend}`)}` },
        { label: t("result.precipHour"), formula: t("result.f.met"), value: f.precip(cur.precipMm) },
      ],
    },
    {
      title: t("result.g.today"),
      rows: [
        { label: t("result.highLow"), formula: t("result.f.daily"), value: today ? `${f.deg(today.maxC)} / ${f.deg(today.minC)}` : "—" },
        { label: t("result.precipDay"), formula: t("result.f.sum"), value: today ? f.precip(today.precipMm) : "—" },
        {
          label: t("result.uv"),
          formula: t("result.f.uv"),
          value: d.uvMaxToday !== null ? `${f.num(d.uvMaxToday, 1)} · ${t(`uv.${uvLevel(d.uvMaxToday)}`)}` : t("result.notProvided"),
        },
      ],
    },
    {
      title: t("result.g.sunMoon"),
      rows: [
        { label: t("result.sunrise"), formula: t("result.f.noaa"), value: sunrise !== null ? f.hhmm(sunrise) : t(`polar.${d.sun.polar ?? "night"}`) },
        { label: t("result.sunset"), formula: t("result.f.noaa"), value: sunset !== null ? f.hhmm(sunset) : t(`polar.${d.sun.polar ?? "night"}`) },
        { label: t("result.dayLength"), formula: sunrise !== null && sunset !== null ? `${f.hhmm(sunset)} − ${f.hhmm(sunrise)}` : "—", value: t("units.hm", { h: Math.floor(d.sun.dayLengthMin / 60), m: Math.round(d.sun.dayLengthMin % 60) }) },
        { label: t("result.sunElevation"), formula: t("result.f.solar"), value: `${f.num(d.sunElevation, 1)}°` },
        { label: t("result.moon"), formula: t("result.f.moon", { age: f.num(d.moon.ageDays, 1) }), value: `${t(`moon.${d.moon.phase}`)} · ${f.num(d.moon.illumination * 100)}%` },
        { label: t("result.nextFull"), formula: t("result.f.synodic"), value: f.dayMonth(d.moon.nextFullMoonMs, zone) },
      ],
    },
  ];

  return (
    <SectionCard title={t("result.title")} className="lg:flex lg:flex-1 lg:flex-col" bodyClassName="p-3 lg:flex lg:flex-1 lg:flex-col">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-50">{d.place.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("result.localTime", { time: f.time(d.now, zone) })} · {t("result.updated", { time: f.dateTime(d.updatedAt, zone) })}
          </p>
        </div>
        <WeatherIcon category={d.category} night={isNightSymbol(cur.symbol)} size={36} className="shrink-0 text-amber-500" />
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center" data-bp-inner>
        {[
          { k: t("result.temp"), v: f.deg(cur.tempC) },
          { k: t("result.feels"), v: f.deg(feels.valueC) },
          { k: t("result.highLow"), v: today ? `${f.deg(today.maxC)}/${f.deg(today.minC)}` : "—" },
        ].map((x) => (
          <div key={x.k} className="rounded-lg bg-blue-50 px-1 py-1.5 dark:bg-blue-500/10">
            <p className="truncate text-[10px] leading-3 font-semibold text-zinc-500 dark:text-zinc-400">{x.k}</p>
            <p dir="ltr" className="text-xl font-bold text-blue-700 dark:text-blue-300">{x.v}</p>
          </div>
        ))}
      </div>
      {status !== "idle" && (
        <p role="status" className={`mb-2 rounded-md px-2 py-1 text-center text-xs ${status === "error" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"}`}>
          {status === "error" ? t("result.error") : t("result.loading")}
        </p>
      )}
      <LiveTableFill>
        <LiveTable3DLayout
          headings={[t("result.colItem"), t("result.colCalc"), t("result.colValue")]}
          groups={groups}
          drawing={<WxSkyScene d={d} f={f} />}
          caption={t("result.skyCaption", { condition: t(`category.${d.category}`), cloud: f.num(cur.cloud), elev: f.num(d.sunElevation, 1) })}
        />
      </LiveTableFill>
    </SectionCard>
  );
}
