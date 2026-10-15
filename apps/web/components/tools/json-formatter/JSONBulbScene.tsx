"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { KitControls, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { usePrefersReducedMotion } from "@/components/tool-ui/glass/GlassPrimitives";
import { ltr } from "@/components/tool-ui/MixedText";

/**
 * The Result card's main visual: a real, professionally-drawn cosy-room illustration (CC0, see
 * apps/web/public/samples/CREDITS.md) with a functional pendant bulb drawn on top — cord, glass,
 * coiled filament — plus a wall light switch. Either control flips `on`; the room illustration
 * itself dims/desaturates and gets a dark overlay, and a warm radial glow (clipped to the frame)
 * grows with the brightness dimmer. The bulb is a toy lamp only: JSON validity lives in the badge
 * below, not in the lamp.
 */
const BRIGHT_MIN = 10;
const BRIGHT_MAX = 100;
const BRIGHT_STEP = 10;
const clampBrightness = (v: number) => Math.max(BRIGHT_MIN, Math.min(BRIGHT_MAX, Math.round(v / BRIGHT_STEP) * BRIGHT_STEP));

const PULL_THRESHOLD = 40;
const PULL_MAX = 73;

// Scene geometry (SVG user units), matching the illustration's own cropped viewBox so the overlay
// lines up 1:1 with it at any rendered size. The lamp sits in the one column of open wall at the
// frame's left edge (x 0–150), clear of the plant and the framed painting beside it.
const W = 650;
const H = 487.5;
const CX = 70;
const CAP_TOP_Y = 0;
const CAP_BOTTOM_Y = 22;
const CAP_HALF_W = 9;
const NECK_HALF_W = 8;
const BULGE_Y = 85;
const BULGE_HALF_W = 30;
const BOTTOM_Y = 135;
const PULL_X = CX + BULGE_HALF_W + 14;
const PULL_ATTACH_Y = CAP_BOTTOM_Y + 8;
const PULL_HANDLE_BASE_Y = BOTTOM_Y + 18;

/** A small vertical coil (alternating elliptical arcs) standing in for a wound tungsten filament. */
function coilPath(cx: number, top: number, height: number, halfW: number, loops: number) {
  const step = height / loops;
  let d = `M ${cx - halfW} ${top}`;
  for (let i = 0; i < loops; i++) {
    const y1 = top + step * (i + 1);
    const sweep = i % 2 === 0 ? 1 : 0;
    const x = i % 2 === 0 ? cx + halfW : cx - halfW;
    d += ` A ${halfW} ${step / 2} 0 1 ${sweep} ${x} ${y1}`;
  }
  return d;
}

export default function JSONBulbScene({ valid, errorLine, errorColumn }: { valid: boolean; errorLine: number; errorColumn: number }) {
  const t = useTranslations("tools.json-formatter.visuals.bulb");
  const reduced = usePrefersReducedMotion();

  const [on, setOn] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [pull, setPull] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [swinging, setSwinging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [handleFocused, setHandleFocused] = useState(false);
  const startY = useRef(0);

  function toggleOn() {
    setOn((v) => !v);
  }

  function releasePull(didPull: boolean) {
    setPulling(false);
    setPull(0);
    if (didPull) {
      if (reduced) {
        toggleOn();
      } else {
        setSwinging(true);
        toggleOn();
        setTimeout(() => setSwinging(false), 650);
      }
    }
  }

  // Tracked on `window` rather than the small handle element: a real drag's pointer routinely
  // moves outside the handle's own hit area well before release, and relying on the element to
  // keep receiving pointermove/pointerup (even with setPointerCapture) missed real pulls.
  const pullRef = useRef(0);
  useEffect(() => {
    pullRef.current = pull;
  }, [pull]);
  useEffect(() => {
    if (!pulling) return;
    function onMove(e: PointerEvent) {
      setPull(Math.max(0, Math.min(PULL_MAX, e.clientY - startY.current)));
    }
    function onUp() {
      releasePull(pullRef.current >= PULL_THRESHOLD);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulling]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    setTouched(true);
    setPulling(true);
    startY.current = e.clientY;
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setTouched(true);
      releasePull(true);
    }
  }

  const s: Stepper = {
    value: brightness,
    set: (v) => setBrightness(clampBrightness(v)),
    inc: () => setBrightness((b) => clampBrightness(b + BRIGHT_STEP)),
    dec: () => setBrightness((b) => clampBrightness(b - BRIGHT_STEP)),
    reset: () => {
      setOn(false);
      setBrightness(100);
    },
    flash: 0,
    atMin: brightness <= BRIGHT_MIN,
    atMax: brightness >= BRIGHT_MAX,
    isSeed: !on && brightness === 100,
    min: BRIGHT_MIN,
    max: BRIGHT_MAX,
    step: BRIGHT_STEP,
  };
  const brightnessText = ltr(`${brightness}%`);
  const stateText = on ? t("switchOn") : t("switchOff");

  const brightFrac = brightness / 100;
  const glowOpacity = on ? Math.max(0.2, brightFrac) : 0;
  const haloOpacity = on ? brightFrac * 0.65 : 0.06;
  const filamentColor = on ? "var(--json-bulb-filament-on)" : "var(--json-bulb-filament-off)";
  const filamentGlow = on ? `drop-shadow(0 0 ${4 + 9 * brightFrac}px var(--json-bulb-filament-on))` : "none";
  const transition = reduced ? "none" : "filter 500ms ease, opacity 500ms ease, stroke 500ms ease";

  const handleY = PULL_HANDLE_BASE_Y + pull;

  return (
    <div data-ph-scene-block data-ph-hero className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={t("sceneAria")}
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "4 / 3" }}
        data-testid="json-bulb-scene"
      >
        {/* The cosy-room illustration (CC0, apps/web/public/samples/CREDITS.md). Dims/desaturates when off. */}
        <img
          src="/samples/json-formatter-cozy-room.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: on ? `saturate(${0.65 + 0.35 * brightFrac}) brightness(${0.8 + 0.3 * brightFrac})` : "brightness(0.32) saturate(0.35)",
            transition,
          }}
        />
        {/* Dark overlay: fades in as the room goes dark, fades out as it lights up. */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(6, 10, 22, 0.58)", opacity: on ? 0 : 1, transition }}
        />
        {/* Warm ambient glow centred on the bulb, clipped by the frame's own overflow:hidden. */}
        <div
          className="absolute"
          style={{
            left: `${((CX - 120) / W) * 100}%`,
            top: `${((BULGE_Y - 120) / H) * 100}%`,
            width: `${(240 / W) * 100}%`,
            height: `${(240 / H) * 100}%`,
            borderRadius: "9999px",
            background: "radial-gradient(circle, var(--json-bulb-glow) 0%, transparent 70%)",
            opacity: haloOpacity,
            transition,
          }}
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={`absolute inset-0 h-full w-full ${swinging && !reduced ? "json-bulb-swing" : ""}`}
          style={{ transformOrigin: `${CX}px ${CAP_TOP_Y}px` }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="json-bulb-glow-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--json-bulb-glow)" stopOpacity={0.95} />
              <stop offset="100%" stopColor="var(--json-bulb-glow)" stopOpacity={0} />
            </radialGradient>
            <linearGradient id="json-bulb-glass-grad" x1="20%" y1="10%" x2="85%" y2="95%">
              <stop offset="0%" stopColor="var(--json-bulb-highlight)" />
              <stop offset="45%" stopColor="var(--json-bulb-glass)" />
              <stop offset="100%" stopColor="var(--json-bulb-glass)" />
            </linearGradient>
          </defs>

          {/* Power cord, from the top edge of the scene straight into the screw base. */}
          <path d={`M ${CX} 0 C ${CX - 4} ${CAP_TOP_Y + 8}, ${CX + 4} ${CAP_TOP_Y + 14}, ${CX} ${CAP_TOP_Y + 22}`} stroke="var(--json-cord)" strokeWidth={2.5} fill="none" />

          {/* Halo behind the glass. */}
          <circle cx={CX} cy={BULGE_Y} r={58} fill="url(#json-bulb-glow-grad)" style={{ opacity: haloOpacity, transition }} />

          {/* Screw base: cap with ridge lines and a contact tip where the cord lands. */}
          <circle cx={CX} cy={CAP_TOP_Y} r={3} fill="var(--json-socket)" stroke="var(--ph-line)" strokeWidth={1} />
          <path
            d={`M ${CX - CAP_HALF_W} ${CAP_TOP_Y + 3} L ${CX - NECK_HALF_W} ${CAP_BOTTOM_Y} L ${CX + NECK_HALF_W} ${CAP_BOTTOM_Y} L ${CX + CAP_HALF_W} ${CAP_TOP_Y + 3} Z`}
            fill="var(--json-socket)"
            stroke="var(--ph-line)"
            strokeWidth={1}
          />
          {[9, 14, 19].map((y) => (
            <line key={y} x1={CX - CAP_HALF_W + 1} y1={y} x2={CX + CAP_HALF_W - 1} y2={y} stroke="var(--ph-line)" strokeWidth={0.75} opacity={0.55} />
          ))}

          {/* Glass envelope: a pear-shaped outline, gradient fill, highlight and a glow that fills the glass when lit. */}
          <path
            d={`M ${CX - NECK_HALF_W} ${CAP_BOTTOM_Y}
                C ${CX - NECK_HALF_W - 5} ${CAP_BOTTOM_Y + 16}, ${CX - BULGE_HALF_W + 5} ${BULGE_Y - 26}, ${CX - BULGE_HALF_W} ${BULGE_Y}
                C ${CX - BULGE_HALF_W + 2} ${BULGE_Y + 25}, ${CX - 18} ${BOTTOM_Y}, ${CX} ${BOTTOM_Y}
                C ${CX + 18} ${BOTTOM_Y}, ${CX + BULGE_HALF_W - 2} ${BULGE_Y + 25}, ${CX + BULGE_HALF_W} ${BULGE_Y}
                C ${CX + BULGE_HALF_W - 5} ${BULGE_Y - 26}, ${CX + NECK_HALF_W + 5} ${CAP_BOTTOM_Y + 16}, ${CX + NECK_HALF_W} ${CAP_BOTTOM_Y}
                Z`}
            fill="url(#json-bulb-glass-grad)"
            stroke="var(--ph-line)"
            strokeWidth={1.1}
          />
          <circle cx={CX} cy={BULGE_Y} r={25} fill="url(#json-bulb-glow-grad)" style={{ opacity: glowOpacity, transition }} />
          <ellipse cx={CX - 11} cy={BULGE_Y - 22} rx={5.5} ry={11} fill="var(--json-bulb-highlight)" opacity={0.5} transform={`rotate(-18 ${CX - 11} ${BULGE_Y - 22})`} />

          {/* Filament: two support wires feeding a coiled strand. */}
          <path
            d={`M ${CX - 3.5} ${CAP_BOTTOM_Y + 2} L ${CX - 5} ${BULGE_Y - 22} M ${CX + 3.5} ${CAP_BOTTOM_Y + 2} L ${CX + 5} ${BULGE_Y - 22}`}
            stroke={filamentColor}
            strokeWidth={1}
            fill="none"
            style={{ transition }}
          />
          <path d={coilPath(CX, BULGE_Y - 22, 18, 5, 5)} stroke={filamentColor} strokeWidth={1.4} fill="none" strokeLinecap="round" style={{ filter: filamentGlow, transition }} />

          {/* Pull cord: offset beside the glass for its whole length, never crossing it. */}
          <path d={`M ${PULL_X} ${PULL_ATTACH_Y} L ${PULL_X} ${handleY - 6}`} stroke="var(--json-cord)" strokeWidth={1.4} />
          <g
            role="button"
            tabIndex={0}
            aria-label={t("pullHandle")}
            onPointerDown={onPointerDown}
            onKeyDown={onKeyDown}
            onFocus={() => setHandleFocused(true)}
            onBlur={() => setHandleFocused(false)}
            style={{ cursor: pulling ? "grabbing" : "grab", touchAction: "none", outline: "none" }}
            data-testid="json-bulb-cord-handle"
          >
            <circle cx={PULL_X} cy={handleY} r={14} fill="transparent" />
            {!touched && !reduced && <circle cx={PULL_X} cy={handleY} r={7} fill="none" stroke="var(--json-cord-pull)" className="glass-handle-pulse-ring" />}
            {handleFocused && <circle cx={PULL_X} cy={handleY} r={10} fill="none" stroke="var(--ph-focus)" strokeWidth={1.5} />}
            <circle cx={PULL_X} cy={handleY} r={7} fill="var(--json-cord-pull)" stroke="var(--ph-line)" strokeWidth={1} />
            <path d={`M ${PULL_X - 2.5} ${handleY} a 2.5 2.5 0 1 0 5 0 a 2.5 2.5 0 1 0 -5 0`} fill="none" stroke="var(--ph-ink-muted)" strokeWidth={1} />
          </g>
        </svg>

        {/* Realistic wall light switch, drawn on the open wall above the sofa. A real HTML button
            (not an SVG shape) so its 44px hit target stays fixed regardless of how small the scene
            is rendered. */}
        <button
          type="button"
          aria-pressed={on}
          aria-label={t("switchLabel")}
          onClick={toggleOn}
          data-testid="json-bulb-switch"
          className="absolute flex h-16 w-11 min-h-[44px] min-w-[44px] flex-col gap-0.5 rounded-md border-[1.5px] p-1 shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ right: "6%", top: "7%", borderColor: "var(--ph-line)", background: "var(--ph-surface)", outlineColor: "var(--ph-focus)" }}
        >
          <span aria-hidden="true" className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full" style={{ background: "var(--ph-ink-muted)", opacity: 0.6 }} />
          <span
            className="flex flex-1 items-center justify-center rounded-sm text-[10px] font-bold transition-all duration-200"
            style={{ background: on ? "var(--ph-accent-strong)" : "var(--glass-track)", color: on ? "#fff" : "var(--ph-ink-muted)", boxShadow: on ? "inset 0 1px 2px rgba(0,0,0,.35)" : "none" }}
          >
            {t("switchOn")}
          </span>
          <span
            className="flex flex-1 items-center justify-center rounded-sm text-[10px] font-bold transition-all duration-200"
            style={{ background: !on ? "var(--ph-accent-strong)" : "var(--glass-track)", color: !on ? "#fff" : "var(--ph-ink-muted)", boxShadow: !on ? "inset 0 1px 2px rgba(0,0,0,.35)" : "none" }}
          >
            {t("switchOff")}
          </span>
          <span aria-hidden="true" className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" style={{ background: "var(--ph-ink-muted)", opacity: 0.6 }} />
        </button>
      </div>

      <div
        dir="ltr"
        className="flex items-center justify-center gap-1.5 self-center rounded-lg px-3 py-1.5 text-xs font-semibold"
        style={{
          background: valid ? "var(--glass-success-soft)" : "var(--glass-danger-soft)",
          color: valid ? "var(--glass-success-strong)" : "var(--glass-danger-strong)",
        }}
        data-testid="json-bulb-validity"
      >
        {valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
        <span dir="auto">{valid ? t("validBadge") : t("invalidBadge", { line: ltr(String(errorLine)), column: ltr(String(errorColumn)) })}</span>
      </div>

      <p dir="auto" className="text-center text-xs leading-5" style={{ color: "var(--ph-ink-muted)" }}>
        {t("caption")}
      </p>

      <KitControls s={s} valueText={brightnessText} testId="json-bulb" />
      <p dir="auto" className="min-h-[1rem] text-center text-xs font-semibold" style={{ color: "var(--ph-accent-strong)" }}>
        {t("brightnessReadout", { value: brightnessText, state: stateText })}
      </p>
    </div>
  );
}
