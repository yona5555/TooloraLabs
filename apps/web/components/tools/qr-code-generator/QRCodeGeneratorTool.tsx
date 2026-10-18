"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { QRCodeGenerator, type QRErrorCorrectionLevel } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QRInputPanel, { type QRFormState } from "./QRInputPanel";
import QRResult from "./QRResult";
import QRCustomizePanel from "./QRCustomizePanel";
import QRLogoPanel, { type QRLogoMode } from "./QRLogoPanel";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { buildQRModel, QR_EXAMPLES, QRLiveProvider, type QRDraft } from "./QRLiveContext";

const tool = new QRCodeGenerator();

const INITIAL_FORM: QRFormState = {
  contentType: "url",
  text: "https://tooloralabs.com",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  wifiHidden: false,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactOrg: "",
  emailAddress: "",
  emailSubject: "",
  emailBody: "",
  smsPhone: "",
  smsMessage: "",
};

export default function QRCodeGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.qr-code-generator");
  const tNav = useTranslations("tools.qr-code-generator.nav");
  const tEx = useTranslations("tools.qr-code-generator.examples");
  const [activeExample, setActiveExample] = useState<string | null>("url");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  const [form, setForm] = useState<QRFormState>(INITIAL_FORM);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<QRErrorCorrectionLevel>("M");
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoMode, setLogoMode] = useState<QRLogoMode>("none");
  // The error-correction level in effect for generation: forced to "H" while
  // a logo sits centered on top of the code, since covering the middle only
  // stays scannable within H's ~30% damage tolerance — restored to the
  // user's own choice the moment center mode is no longer active.
  const [levelBeforeCenterLogo, setLevelBeforeCenterLogo] = useState<QRErrorCorrectionLevel>("M");

  const [svg, setSvg] = useState("");
  const [payload, setPayload] = useState("");
  const [hasError, setHasError] = useState(false);
  const requestId = useRef(0);

  function patchForm(patch: Partial<QRFormState>) {
    setForm((prev) => ({ ...prev, ...patch }));
    setActiveExample(null);
  }

  const dims: QRDraft = { ...form, errorCorrectionLevel, darkColor, lightColor };
  function setDim<K extends keyof QRDraft>(key: K, value: QRDraft[K]) {
    if (key === "errorCorrectionLevel") handleErrorCorrectionChange(value as QRErrorCorrectionLevel);
    else if (key === "darkColor") setDarkColor(value as string);
    else if (key === "lightColor") setLightColor(value as string);
    else patchForm({ [key]: value } as Partial<QRFormState>);
  }

  function handleLogoSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      handleLogoModeChange("center");
    };
    reader.readAsDataURL(file);
  }

  function handleLogoClear() {
    setLogoDataUrl(null);
    setLogoMode("none");
    setErrorCorrectionLevel(levelBeforeCenterLogo);
  }

  function handleLogoModeChange(mode: QRLogoMode) {
    if (mode === "center" && logoMode !== "center") {
      setLevelBeforeCenterLogo(errorCorrectionLevel);
      setErrorCorrectionLevel("H");
    } else if (mode !== "center" && logoMode === "center") {
      setErrorCorrectionLevel(levelBeforeCenterLogo);
    }
    setLogoMode(mode);
  }

  function handleErrorCorrectionChange(level: QRErrorCorrectionLevel) {
    setErrorCorrectionLevel(level);
    if (logoMode === "center") setLevelBeforeCenterLogo(level);
  }

  function handleClear() {
    setForm(INITIAL_FORM);
    setActiveExample("url");
    setErrorCorrectionLevel("M");
    setLevelBeforeCenterLogo("M");
    setDarkColor("#000000");
    setLightColor("#ffffff");
    setLogoDataUrl(null);
    setLogoMode("none");
  }

  useEffect(() => {
    const id = ++requestId.current;

    tool.execute({ ...form, errorCorrectionLevel, darkColor, lightColor }, { locale: "en-US" }).then((output) => {
      if (id !== requestId.current) return;
      if (!output.success) {
        setSvg("");
        setPayload("");
        setHasError(true);
        return;
      }
      setSvg(output.data.svg);
      setPayload(output.data.payload);
      setHasError(false);
    });
  }, [form, errorCorrectionLevel, darkColor, lightColor]);

  const error = hasError ? t("errors.required") : "";

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <QRLiveProvider value={{ dims, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <QRInputPanel form={form} onChange={patchForm} onClear={handleClear} />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = QR_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setForm({ ...INITIAL_FORM, ...ex.patch });
                  setActiveExample(id);
                }}
                examples={QR_EXAMPLES.map((ex) => {
                  const m = buildQRModel({ ...INITIAL_FORM, ...ex.patch, errorCorrectionLevel, darkColor, lightColor });
                  return { id: ex.id, label: tEx(ex.id), detail: m.a ? tEx("detail", { v: m.a.version, size: m.a.size, bytes: m.a.payloadBytes }) : "" };
                })}
              />
            </div>
          }
          result={<QRResult svg={svg} payload={payload} error={error} logoDataUrl={logoDataUrl} logoMode={logoMode} />}
          sidebar={<RelatedToolsSidebar fill currentSlug="qr-code-generator" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="qr-code-generator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <QRLogoPanel logoDataUrl={logoDataUrl} onLogoSelect={handleLogoSelect} onLogoClear={handleLogoClear} logoMode={logoMode} onLogoModeChange={handleLogoModeChange} />
              <QRCustomizePanel
                errorCorrectionLevel={errorCorrectionLevel}
                onErrorCorrectionLevelChange={handleErrorCorrectionChange}
                darkColor={darkColor}
                onDarkColorChange={setDarkColor}
                lightColor={lightColor}
                onLightColorChange={setLightColor}
                lockedToHigh={logoMode === "center"}
              />
            </div>
          }
        />
      </div>

      {education}
    </QRLiveProvider>
  );
}
